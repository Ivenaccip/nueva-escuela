// Busca el video de la estación 1 con la API de OpenAI.
//
// Sustituye a la búsqueda web del servidor de Anthropic, que Haiku 4.5 no sirve.
// El modelo que escribe el contenido ya no sale a internet: recibe esta lista,
// ya buscada y ya validada.
//
// LA DECISIÓN QUE SOSTIENE ESTE ARCHIVO: los ids de YouTube NO se leen de lo que
// el modelo escribe. Se leen de `web_search_call.action.sources` y de las
// anotaciones `url_citation`, que es lo único que el buscador visitó de verdad.
// Un id inventado tiene once caracteres válidos y casi siempre existe: lleva a un
// video cualquiera, y ninguna validación de forma lo caza. Por eso aquí el texto
// del modelo se ignora por completo.
//
// El título y el canal salen del oEmbed de YouTube, no del modelo, porque ahí no
// hay nada que inventar.
//
// La llave se lee de OPENAI_API_KEY. Nunca se escribe, nunca se imprime.

const BASE = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';

/**
 * gpt-4.1-mini: documentado para la herramienta de búsqueda, y el más barato de
 * los que la sirven ($0.40 de entrada por millón contra $5 de gpt-5.5). Aquí no
 * se le pide razonar: sólo que busque. Quien decide es el modelo que escribe.
 */
const MODELO = process.env.ANDAMIO_MODELO_BUSQUEDA ?? 'gpt-4.1-mini';

/** Cuántos candidatos se devuelven. La estación 1 usa uno y guarda los demás. */
const TOPE = 6;

const REINTENTOS = 3;
const ESPERA_MS = 90_000;

/** Las cinco formas en que YouTube escribe un enlace a un video. */
const ID_DE_YOUTUBE =
  /(?:youtube\.com\/(?:watch\?(?:[^"'\s&]*&)*v=|shorts\/|embed\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/g;

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

function idsDe(texto) {
  const ids = [];
  for (const m of String(texto ?? '').matchAll(ID_DE_YOUTUBE)) ids.push(m[1]);
  return ids;
}

/**
 * Los ids que el buscador visitó. Se recorre `output[]` por estructura y nunca
 * se pasa un regex sobre el JSON completo: el texto del modelo viaja dentro de
 * ese JSON, y regexearlo entero anularía justamente el filtro que esto es.
 */
function idsQueElBuscadorVio(salida) {
  const vistos = new Map();
  const anotar = (url, deDonde) => {
    for (const id of idsDe(url)) if (!vistos.has(id)) vistos.set(id, deDonde);
  };

  for (const item of salida ?? []) {
    if (item.type === 'web_search_call') {
      const accion = item.action ?? {};
      for (const fuente of accion.sources ?? []) anotar(fuente.url, 'resultados de búsqueda');
      anotar(accion.url, 'página abierta');
    }
    if (item.type === 'message') {
      for (const parte of item.content ?? []) {
        for (const nota of parte.annotations ?? []) {
          if (nota.type === 'url_citation') anotar(nota.url, 'cita del modelo');
        }
      }
    }
  }
  return vistos;
}

async function pedirABusqueda(cuerpo, llave) {
  let ultimo;
  for (let intento = 1; intento <= REINTENTOS; intento += 1) {
    let respuesta;
    try {
      respuesta = await fetch(`${BASE}/responses`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${llave}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
        signal: AbortSignal.timeout(ESPERA_MS),
      });
    } catch (e) {
      ultimo = new Error(`no se pudo hablar con OpenAI: ${e.message}`);
      if (intento === REINTENTOS) break;
      await dormir(2 ** intento * 1000);
      continue;
    }

    if (respuesta.ok) return respuesta.json();

    // El cuerpo del error puede traer la llave de vuelta en algún eco; se corta.
    const detalle = (await respuesta.text()).slice(0, 300).replace(/sk-[A-Za-z0-9_-]+/g, 'sk-…');
    ultimo = new Error(`OpenAI contestó ${respuesta.status}: ${detalle}`);
    if (respuesta.status === 401) break; // la llave no sirve: reintentar no ayuda
    if (respuesta.status !== 429 && respuesta.status < 500) break;
    if (intento === REINTENTOS) break;
    const dice = Number(respuesta.headers.get('retry-after'));
    await dormir(Number.isFinite(dice) && dice > 0 ? dice * 1000 : 2 ** intento * 1000);
  }
  throw ultimo;
}

/**
 * El oEmbed de YouTube no pide llave y es la única prueba de que el video existe,
 * es público y se deja incrustar. De paso da el título y el canal de verdad.
 */
async function porOEmbed(id) {
  const url = `https://www.youtube.com/watch?v=${id}`;
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  try {
    const r = await fetch(endpoint, { signal: AbortSignal.timeout(15_000) });
    if (!r.ok) return { vive: false, porQue: `oEmbed ${r.status}` };
    const d = await r.json();
    return { vive: true, url, titulo: d.title, canal: d.author_name };
  } catch (e) {
    return { vive: false, porQue: `no se pudo consultar el oEmbed: ${e.message}` };
  }
}

function consultaDe(tema, materia) {
  const cual = { matematicas: 'matemáticas', biologia: 'biología', fisica: 'física', quimica: 'química' };
  return [
    `video explicación "${tema.titulo}" ${cual[materia] ?? materia}`,
    `${tema.grado} México, en español, que explique por qué funciona y no sólo el procedimiento`,
  ].join(' ');
}

/**
 * Devuelve los candidatos de video para un tema, ya validados contra oEmbed.
 * Un arreglo vacío es una respuesta legítima: significa que la búsqueda no trajo
 * nada que sobreviviera, y vale más que un video inventado.
 */
export async function buscarVideos(tema, materia) {
  const llave = process.env.OPENAI_API_KEY;
  if (!llave) throw new Error('Falta OPENAI_API_KEY: la estación 1 no puede buscar el video.');

  const datos = await pedirABusqueda(
    {
      model: MODELO,
      tools: [{ type: 'web_search' }],
      include: ['web_search_call.action.sources'],
      input: [
        'Busca en YouTube videos en español que expliquen este tema a un estudiante de secundaria en México.',
        `Tema: ${tema.titulo}. Grado: ${tema.grado}.`,
        `Lo que el estudiante tiene que acabar sabiendo: ${tema.quedaSabiendo}`,
        '',
        consultaDe(tema, materia),
        '',
        'Haz al menos dos búsquedas distintas: una con las palabras que usaría el estudiante y otra más precisa.',
        'Prefiere videos que expliquen POR QUÉ funciona y no sólo cómo se hace.',
        'Al final lista los enlaces de los videos que encontraste.',
      ].join('\n'),
    },
    llave,
  );

  const vistos = idsQueElBuscadorVio(datos.output);
  if (vistos.size === 0) return { candidatos: [], buscados: 0, descartados: [] };

  const candidatos = [];
  const descartados = [];
  for (const [id, deDonde] of vistos) {
    if (candidatos.length >= TOPE) break;
    const prueba = await porOEmbed(id);
    if (!prueba.vive) {
      descartados.push({ id, porQue: prueba.porQue });
      continue;
    }
    candidatos.push({
      url: prueba.url,
      idDeYouTube: id,
      titulo: prueba.titulo,
      canal: prueba.canal,
      deDonde,
    });
  }

  return { candidatos, buscados: vistos.size, descartados };
}

/** Los candidatos como texto, que es lo que se interpola en el prompt de la estación 1. */
export function candidatosComoTexto({ candidatos, buscados, descartados }) {
  if (candidatos.length === 0) {
    return [
      'La búsqueda no devolvió ningún video que sobreviviera a la comprobación.',
      `Se vieron ${buscados} enlaces y se descartaron todos.`,
      '',
      'NO inventes un video. Deja `video` en null y di en `noSePuede` que la búsqueda vino vacía.',
    ].join('\n');
  }

  const lineas = candidatos.map((c, i) =>
    [
      `${i + 1}. ${c.titulo}`,
      `   canal: ${c.canal}`,
      `   url: ${c.url}`,
      `   id: ${c.idDeYouTube}`,
    ].join('\n'),
  );

  return [
    `Estos ${candidatos.length} videos se buscaron en la web y se comprobó que existen, son`,
    'públicos y se dejan incrustar. El título y el canal salen de YouTube, no de un modelo.',
    '',
    ...lineas,
    '',
    'ESCOGE UNO DE ÉSTOS Y COPIA SU URL TAL CUAL. No escribas ninguna otra URL: cualquier id',
    'que no esté en esta lista es inventado, aunque exista un video con ese id.',
    descartados.length ? `\n(Se descartaron ${descartados.length} por no pasar la comprobación.)` : '',
  ].join('\n');
}
