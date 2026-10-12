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

import { anotar, comprobarTope, precioPorBusqueda } from './gasto.mjs';

const BASE = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';

/**
 * gpt-5.5, y aquí el modelo sí importa. Medido sobre el mismo tema:
 *
 *   gpt-4.1-mini   1 búsqueda,  0 videos   — se rinde a la primera
 *   gpt-4.1        1 búsqueda,  2 videos
 *   gpt-5.5       39 búsquedas, 19 videos  — trabaja el problema
 *
 * Los videos de YouTube están mal representados en un índice de web, así que
 * encontrarlos pide insistir con `site:youtube.com/watch` y con nombres de
 * canales. Un modelo chico hace una consulta, ve resultados de sitios de tareas
 * y contesta con eso; no es que busque mal, es que no insiste.
 */
const MODELO = process.env.ANDAMIO_MODELO_BUSQUEDA ?? 'gpt-5.5';

/**
 * Sin tope, gpt-5.5 hizo 39 búsquedas en un solo tema: a un centavo cada una más
 * sus tokens de contenido, sale más caro que generar el tema entero. Con seis
 * trae cinco videos en 24 segundos, y con uno basta (los otros son respaldo).
 */
const TOPE_BUSQUEDAS = Number(process.env.ANDAMIO_TOPE_BUSQUEDAS ?? 6);

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
    // Antes de cada intento y no una vez por tema: un reintento vuelve a cobrar.
    await comprobarTope('openai');
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

    if (respuesta.ok) {
      const datos = await respuesta.json();
      // Se cuentan las búsquedas que hizo y se anotan aunque no haya traído ningún
      // video: se cobraron igual. Es una estimación (`gasto.mjs`), no la factura.
      const hechas = (datos.output ?? []).filter((i) => i.type === 'web_search_call').length;
      await anotar('openai', hechas * precioPorBusqueda(), hechas);
      return datos;
    }

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
      max_tool_calls: TOPE_BUSQUEDAS,
      include: ['web_search_call.action.sources'],
      // Pedir la URL de `watch` con todas sus letras es lo que hace que el índice
      // devuelva páginas de video. Sin esa frase el buscador contesta con
      // help.youtube.com y music.youtube.com, y no sale ni un video: probado.
      input: [
        'Busca en YouTube videos en español que expliquen este tema a un estudiante de secundaria en México.',
        `Tema: ${tema.titulo}. Grado: ${tema.grado}.`,
        `Lo que el estudiante tiene que acabar sabiendo: ${tema.quedaSabiendo}`,
        '',
        consultaDe(tema, materia),
        '',
        'Haz al menos tres búsquedas distintas: una con las palabras que usaría el estudiante,',
        'otra más precisa, y otra con el nombre de un canal educativo mexicano o latinoamericano.',
        'Prefiere videos que expliquen POR QUÉ funciona y no sólo cómo se hace.',
        '',
        'Busca dentro de youtube.com, no en sitios de tareas ni en blogs que hablen del tema.',
        'Lo que necesito es la direccion de la pagina de cada video, no la del canal,',
        'no un enlace de ayuda de YouTube y no una busqueda. Cinco a ocho videos.',
        '',
        'No escribas ninguna direccion que no hayas visto en los resultados. Si no encontraste',
        'ninguna pagina de video, dilo: vale mas eso que una direccion armada.',
      ].join('\n'),
    },
    llave,
  );

  const vistos = idsQueElBuscadorVio(datos.output);
  if (vistos.size === 0)
    return { candidatos: [], buscados: 0, descartados: [], consulta: consultaDe(tema, materia) };

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

  // La consulta viaja para que el llamador la guarde en busqueda.consulta. El
  // modelo nunca la ve: la lista de candidatos trae titulo, canal, url e id.
  return { candidatos, buscados: vistos.size, descartados, consulta: consultaDe(tema, materia) };
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
