// Genera un tema completo de Andamio llamando a la API de Anthropic.
//
//   node contenido/generar.mjs quimica 11
//   node contenido/generar.mjs fisica 4 --solo ver
//   node contenido/generar.mjs matematicas 9 --rehacer
//   node contenido/generar.mjs quimica 11 --seco     nada de API: sólo arma
//
// --seco arma las siete llamadas, comprueba que todos los placeholders se
// resuelven y dice cuántos tokens pesa cada mensaje, sin llamar a la API. Es lo
// que se corre antes de gastar el primer peso.
//
// La llave se lee de ANTHROPIC_API_KEY. Nunca se escribe aquí y nunca se
// imprime. Si no está, el script no arranca.
//
// El orden importa: primero el canon (paso 0), y sólo cuando el canon está
// guardado se lanzan las seis estaciones, porque las seis lo reciben entero y no
// se hablan entre ellas (contenido/CONTRATO.md §3).
//
// Falla ruidoso y se retoma. La salida se escribe en
// contenido/temas/<materia>-<numero>.json después de CADA llamada, así que una
// corrida interrumpida se reanuda sola: al volver a correrlo, lo que ya está no
// se vuelve a pedir. Con --rehacer se tira lo guardado y se empieza de cero.
//
// Lee contenido/LEEME.md antes de tocar esto.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';

const aqui = dirname(fileURLToPath(import.meta.url));
const dirEsquema = join(aqui, 'esquema');
const dirPrompts = join(aqui, 'prompts');
const dirTemarios = join(aqui, 'temarios');
const dirTemas = join(aqui, 'temas');

const MODELO = 'claude-opus-5';
const MAX_TOKENS = 16000;

/** La búsqueda web del servidor, en la variante que este modelo sirve. */
const BUSQUEDA_WEB = { type: 'web_search_20260209', name: 'web_search', max_uses: 6 };

/** Los turnos que se le dan a la estación 1 para buscar antes de rendirse. */
const TOPE_TURNOS_BUSQUEDA = 8;

/** Reintentos por llamada, con espera que crece. */
const REINTENTOS = 3;

// ---------------------------------------------------------------------------
// Las siete llamadas, en orden, con su herramienta
// ---------------------------------------------------------------------------

const CANON = {
  clave: 'canon',
  prompt: '00-canon.md',
  esquema: '00-canon.schema.json',
  herramienta: 'escribir_canon',
  descripcion:
    'Fija el canon del tema: los cinco pasos, el ejemplo y el error, que las seis estaciones comparten.',
  busquedaWeb: false,
};

const ESTACIONES = [
  {
    clave: 'ver',
    prompt: '01-ver.md',
    esquema: '01-ver.schema.json',
    herramienta: 'escribir_estacion_ver',
    descripcion:
      'Entrega la pregunta que abre el tema, el resumen y el video encontrado en la busqueda.',
    // La unica con busqueda web, y por eso la unica que NO va con tool_choice
    // forzado: con tool_choice forzado el modelo emite la salida en el primer
    // turno y nunca busca (CONTRATO.md §8).
    busquedaWeb: true,
  },
  {
    clave: 'contacto',
    prompt: '02-contacto.md',
    esquema: '02-contacto.schema.json',
    herramienta: 'escribir_estacion_contacto',
    descripcion: 'Entrega el bloque de preguntas de cuatro opciones del primer contacto.',
    busquedaWeb: false,
  },
  {
    clave: 'completar',
    prompt: '03-completar.md',
    esquema: '03-completar.schema.json',
    herramienta: 'escribir_estacion_completar',
    descripcion: 'Entrega el renglon con un hueco, su respuesta y sus pistas.',
    busquedaWeb: false,
  },
  {
    clave: 'escalera',
    prompt: '04-escalera.md',
    esquema: '04-escalera.schema.json',
    herramienta: 'escribir_estacion_escalera',
    descripcion: 'Entrega los escalones de la escalera, con su respuesta y sus pistas.',
    busquedaWeb: false,
  },
  {
    clave: 'error',
    prompt: '05-error.md',
    esquema: '05-error.schema.json',
    herramienta: 'escribir_estacion_error',
    descripcion: 'Entrega el procedimiento con un paso mal, los motivos y las pistas.',
    busquedaWeb: false,
  },
  {
    clave: 'explicar',
    prompt: '06-explicar.md',
    esquema: '06-explicar.schema.json',
    herramienta: 'escribir_estacion_explicar',
    descripcion:
      'Entrega los textos de la estacion de explicar y la rubrica con la que se califica.',
    busquedaWeb: false,
  },
];

/** Los casos aparte. El canon rutea, y aquí sólo está su ficha. */
const CASOS_APARTE = {
  tabla: {
    clave: 'X1-tabla',
    prompt: 'X1-tabla.md',
    esquema: 'X1-tabla.schema.json',
    herramienta: 'escribir_caso_tabla',
    descripcion: 'Entrega las estaciones 2 a 5 de un tema que necesita rejilla.',
    busquedaWeb: false,
    /** Sustituye a estas cuatro estaciones. */
    reemplaza: ['contacto', 'completar', 'escalera', 'error'],
  },
  figura: {
    clave: 'X2-figura',
    prompt: 'X2-figura.md',
    esquema: 'X2-figura.schema.json',
    herramienta: 'escribir_caso_figura',
    descripcion: 'Entrega la especificacion de la figura y el plan B lineal.',
    busquedaWeb: false,
    reemplaza: ['completar', 'escalera'],
  },
  teclado: {
    clave: 'X3-teclado',
    prompt: 'X3-respuesta-no-numerica.md',
    esquema: 'X3-respuesta-no-numerica.schema.json',
    herramienta: 'escribir_caso_teclado',
    descripcion:
      'Elige el teclado del tema y escribe con el las respuestas de las estaciones 3 y 4.',
    busquedaWeb: false,
    reemplaza: ['completar', 'escalera'],
  },
};

// ---------------------------------------------------------------------------
// Gritar y morir
// ---------------------------------------------------------------------------

class Rajada extends Error {}

const morir = (mensaje, detalle) => {
  console.error(`\n${mensaje}`);
  if (detalle) console.error(detalle);
  process.exit(1);
};

const decir = (mensaje) => console.log(mensaje);

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Los argumentos
// ---------------------------------------------------------------------------

const MATERIAS = ['matematicas', 'biologia', 'fisica', 'quimica'];

const argumentos = process.argv.slice(2);
const banderas = new Set(argumentos.filter((a) => a.startsWith('--')));
const sueltos = argumentos.filter((a) => !a.startsWith('--'));
const iSolo = argumentos.indexOf('--solo');
const solo = iSolo >= 0 ? argumentos[iSolo + 1] : null;
const posicionales = solo ? sueltos.filter((a) => a !== solo) : sueltos;

const [materia, numeroCrudo] = posicionales;
const numero = Number(numeroCrudo);

if (!materia || !Number.isInteger(numero)) {
  morir(
    'Uso: node contenido/generar.mjs <materia> <numero> [--solo <estacion>] [--rehacer]\n' +
      `  materia: ${MATERIAS.join(' | ')}\n` +
      '  numero: el numero del tema dentro de su materia\n' +
      '  --solo: una sola llamada (canon, ver, contacto, completar, escalera, error, explicar)\n' +
      '  --rehacer: tira lo ya guardado y empieza de cero\n' +
      '  --seco: arma las llamadas y revisa los placeholders sin llamar a la API',
  );
}
if (!MATERIAS.includes(materia)) {
  morir(`Materia desconocida: ${materia}. Son ${MATERIAS.join(', ')}.`);
}

const seco = banderas.has('--seco');

// El SDK lee ANTHROPIC_API_KEY del entorno por su cuenta. La llave no se copia
// a ninguna variable de aquí y no se imprime en ningún mensaje.
if (!seco && !process.env.ANTHROPIC_API_KEY) {
  morir(
    'Falta ANTHROPIC_API_KEY en el entorno.\n' +
      'No la escribas en ningun archivo del repo: exportala en tu shell.',
  );
}

const cliente = seco ? null : new Anthropic();

// ---------------------------------------------------------------------------
// Validar contra el esquema. La API NO lo hace (CONTRATO.md §7).
// ---------------------------------------------------------------------------

let Ajv2020 = null;
try {
  Ajv2020 = (await import('ajv/dist/2020.js')).default;
  if (typeof Ajv2020 !== 'function') Ajv2020 = null;
} catch {
  Ajv2020 = null;
}
if (!Ajv2020) {
  morir(
    'Falta ajv 8, y sin el no se puede validar lo que devuelve la API.\n' +
      'La API no comprueba el tool_use contra el input_schema: si nadie lo valida, el\n' +
      'esquema no sirve de nada y se guardan respuestas que la pantalla no puede pintar.\n' +
      'Corre: npm install --save-dev ajv@^8',
  );
}

const esquemas = new Map();
const validadores = new Map();

const cargarEsquema = async (nombre) => {
  if (!esquemas.has(nombre)) {
    const crudo = JSON.parse(await readFile(join(dirEsquema, nombre), 'utf8'));
    esquemas.set(nombre, crudo);
    const ajv = new Ajv2020({ strict: false, allErrors: true });
    validadores.set(nombre, ajv.compile(crudo));
  }
  return esquemas.get(nombre);
};

const contarErrores = (validar) =>
  validar.errors
    .slice(0, 10)
    .map((e) => `    ${e.instancePath || '/'} ${e.keyword}: ${e.message}`)
    .join('\n');

// ---------------------------------------------------------------------------
// Los placeholders
// ---------------------------------------------------------------------------

/** El cuerpo del prompt: lo que va debajo de la primera línea de `---`. */
function cuerpoDelPrompt(md) {
  const corte = md.indexOf('\n---\n');
  return corte === -1 ? md : md.slice(corte + 5).trimStart();
}

/**
 * Sustitución de cadena y nada más: sin condicionales, sin bucles, sin filtros,
 * sin valores por omisión (CONTRATO.md §2). Un placeholder que no se resuelve
 * aborta la llamada: no se manda la cadena vacía ni el literal.
 */
function interpolar(texto, valores, deDonde) {
  const faltantes = new Set();
  const salida = texto.replace(/\{\{([A-Za-z0-9_.]+)\}\}/g, (todo, ruta) => {
    if (!(ruta in valores)) {
      faltantes.add(ruta);
      return todo;
    }
    const valor = valores[ruta];
    if (valor === undefined || valor === null) {
      faltantes.add(ruta);
      return todo;
    }
    return typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2);
  });
  if (faltantes.size > 0) {
    throw new Rajada(
      `${deDonde}: no se pudieron resolver ${[...faltantes].map((f) => `{{${f}}}`).join(', ')}`,
    );
  }
  return salida;
}

function valoresDelTema(temario, tema, ejemploCanon) {
  return {
    materia: temario.clave,
    materiaNombre: temario.nombre,
    'tema.numero': String(tema.numero),
    'tema.titulo': tema.titulo,
    'tema.familia': tema.familia,
    'tema.grado': tema.grado,
    'tema.quedaSabiendo': tema.quedaSabiendo,
    'tema.dependeDe': tema.dependeDe,
    'tema.errorTipico': tema.errorTipico,
    'tema.losCincoPasos': tema.losCincoPasos,
    'tema.notacion': tema.notacion,
    ejemploCanon,
  };
}

function valoresDelCanon(canon) {
  return {
    canon,
    'canon.procedimiento.nombre': canon.procedimiento.nombre,
    'canon.ejemplo.deQueVa': canon.ejemplo.deQueVa,
    'canon.error.pasoQueCorrompe': String(canon.error.pasoQueCorrompe),
    'canon.error.creenciaDeAtras': canon.error.creenciaDeAtras,
    'canon.cotas.numeros': canon.cotas.numeros,
  };
}

// ---------------------------------------------------------------------------
// La llamada
// ---------------------------------------------------------------------------

/** Una petición, con las clases de error del SDK de la más específica a la más general. */
async function pedir(cuerpo) {
  try {
    return await cliente.messages.create(cuerpo);
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) morir('La llave de ANTHROPIC_API_KEY no sirve.');
    if (e instanceof Anthropic.BadRequestError) {
      throw new Rajada(`la API rechazó la petición: ${e.message}`);
    }
    if (e instanceof Anthropic.RateLimitError) throw new Rajada(`límite de tasa: ${e.message}`);
    if (e instanceof Anthropic.APIError) {
      throw new Rajada(`la API contestó ${e.status}: ${e.message}`);
    }
    throw e;
  }
}

/**
 * Una llamada, con su herramienta y su política de `tool_choice`.
 *
 * Sin búsqueda web: `tool_choice` forzado y un solo turno, así la salida
 * estructurada queda garantizada.
 *
 * Con búsqueda web: `tool_choice: auto` y los dos utensilios, y se iteran los
 * turnos hasta que aparezca el `tool_use` de salida. Forzar la herramienta y
 * pedir búsqueda son incompatibles: el modelo emitiría la salida en el primer
 * turno sin haber buscado (CONTRATO.md §8).
 */
async function llamar({ paso, sistema, mensaje }) {
  const esquema = await cargarEsquema(paso.esquema);
  const herramientaSalida = {
    name: paso.herramienta,
    description: paso.descripcion,
    input_schema: esquema,
  };

  const utensilios = paso.busquedaWeb ? [BUSQUEDA_WEB, herramientaSalida] : [herramientaSalida];

  const eleccion = paso.busquedaWeb
    ? { type: 'auto' }
    : { type: 'tool', name: paso.herramienta };

  const mensajes = [{ role: 'user', content: mensaje }];
  const tope = paso.busquedaWeb ? TOPE_TURNOS_BUSQUEDA : 1;

  for (let turno = 1; turno <= tope; turno += 1) {
    const datos = await pedir({
      model: MODELO,
      max_tokens: MAX_TOKENS,
      system: sistema,
      tools: utensilios,
      tool_choice: eleccion,
      messages: mensajes,
    });

    // Una negativa por política sale con 200 y stop_reason "refusal".
    if (datos.stop_reason === 'refusal') {
      throw new Rajada(
        `${paso.clave}: la API declinó la petición` +
          (datos.stop_details ? ` (${datos.stop_details.category})` : ''),
      );
    }

    const salida = (datos.content ?? []).find(
      (b) => b.type === 'tool_use' && b.name === paso.herramienta,
    );
    if (salida) return salida.input;

    // Sin el tool_use de salida: si pidió buscar, se le contesta y se sigue.
    const busquedas = (datos.content ?? []).filter((b) => b.type === 'server_tool_use');
    if (busquedas.length === 0) {
      throw new Rajada(
        `${paso.clave}: contestó sin llamar a ${paso.herramienta} (stop_reason ${datos.stop_reason}). Se descarta.`,
      );
    }
    decir(`      turno ${turno}: buscó ${busquedas.length} vez/veces, sigue`);
    mensajes.push({ role: 'assistant', content: datos.content });
    mensajes.push({
      role: 'user',
      content: `Ya buscaste. Ahora devuelve la llamada a ${paso.herramienta} con lo que encontraste, y nada más.`,
    });
  }

  throw new Rajada(
    `${paso.clave}: ${tope} turnos y nunca llamó a ${paso.herramienta}. Se descarta y se reintenta.`,
  );
}

/** La misma llamada, con reintentos y espera que crece. */
async function llamarConReintentos(opciones) {
  let ultimo;
  for (let intento = 1; intento <= REINTENTOS; intento += 1) {
    try {
      return await llamar(opciones);
    } catch (e) {
      ultimo = e;
      console.error(`      intento ${intento} de ${REINTENTOS} falló: ${e.message}`);
      if (intento < REINTENTOS) await dormir(2000 * intento);
    }
  }
  throw ultimo;
}

// ---------------------------------------------------------------------------
// Las comprobaciones de antes de guardar
// ---------------------------------------------------------------------------

function comprobarEsquema(paso, salida) {
  const validar = validadores.get(paso.esquema);
  if (!validar(salida)) {
    throw new Rajada(
      `${paso.clave}: la salida no valida contra ${paso.esquema}\n${contarErrores(validar)}`,
    );
  }
}

/**
 * `temaNumero` y `materia` contra el tema que se pidió. Es lo que caza un
 * reintento que se cruza o una tanda que se reanuda a medias: sin esto, la
 * estación 5 de un tema puede acabar acusando un paso de otro.
 */
function comprobarTraza(paso, salida, temario, tema) {
  if ('temaNumero' in salida && salida.temaNumero !== tema.numero) {
    throw new Rajada(
      `${paso.clave}: devolvió temaNumero ${salida.temaNumero} y se pidió el ${tema.numero}.`,
    );
  }
  if ('materia' in salida && salida.materia !== temario.clave) {
    throw new Rajada(
      `${paso.clave}: devolvió materia "${salida.materia}" y se pidió "${temario.clave}".`,
    );
  }
}

/**
 * El oEmbed de YouTube, que no pide llave. Atrapa la URL muerta y el video que
 * responde pero es otro; no atrapa un video vivo que no explica este tema.
 */
async function validarVideo(video) {
  if (!video) return { vive: false, porQue: 'no viene video' };

  if (!/^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}$/.test(video.url)) {
    return { vive: false, porQue: `la url no tiene la forma de watch: ${video.url}` };
  }
  if (!video.url.endsWith(`v=${video.idDeYouTube}`)) {
    return { vive: false, porQue: 'url e idDeYouTube no cuadran, así que el par es inventado' };
  }

  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(video.url)}&format=json`;
  let respuesta;
  try {
    respuesta = await fetch(endpoint);
  } catch (e) {
    return { vive: false, porQue: `no se pudo consultar el oEmbed: ${e.message}` };
  }
  if (!respuesta.ok) {
    const porQue =
      respuesta.status === 400
        ? 'el id está mal formado'
        : 'se borró, es privado o no deja incrustarse';
    return { vive: false, porQue: `oEmbed ${respuesta.status}: ${porQue}` };
  }

  const datos = await respuesta.json();
  const normalizar = (s) =>
    String(s ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();

  const tituloReal = normalizar(datos.title);
  const tituloDicho = normalizar(video.titulo);
  const canalReal = normalizar(datos.author_name);
  const canalDicho = normalizar(video.canal);

  if (tituloReal !== tituloDicho && !tituloReal.includes(tituloDicho)) {
    return {
      vive: false,
      porQue: `responde pero es otro video: oEmbed dice "${datos.title}" y se reportó "${video.titulo}"`,
    };
  }
  if (canalReal !== canalDicho && !canalReal.includes(canalDicho)) {
    return {
      vive: false,
      porQue: `el canal no cuadra: oEmbed dice "${datos.author_name}" y se reportó "${video.canal}"`,
    };
  }
  return { vive: true, titulo: datos.title, canal: datos.author_name };
}

/**
 * Deja en `video` el primero que de verdad exista, y guarda en
 * `videosDescartados` los que se cayeron y por qué. Si ninguno vive, `video`
 * queda en `null` y el tema abre con la tarjeta vacía: eso se puede ver en
 * pantalla, un video equivocado no.
 */
async function acomodarVideos(salida) {
  const candidatos = [salida.video, ...(salida.alternativas ?? [])].filter(Boolean);
  const descartados = [];

  for (const candidato of candidatos) {
    const veredicto = await validarVideo(candidato);
    if (veredicto.vive) {
      decir(`      video vivo: ${candidato.idDeYouTube} · ${veredicto.canal}`);
      return {
        ...salida,
        video: candidato,
        alternativas: candidatos.filter((c) => c !== candidato),
        videosDescartados: descartados,
      };
    }
    decir(`      video descartado: ${candidato.idDeYouTube} · ${veredicto.porQue}`);
    descartados.push({ idDeYouTube: candidato.idDeYouTube, porQue: veredicto.porQue });
  }

  decir('      ningun video sobrevivio al oEmbed: la tarjeta se queda vacia');
  return { ...salida, video: null, alternativas: [], videosDescartados: descartados };
}

// ---------------------------------------------------------------------------
// El archivo del tema, que se escribe después de cada llamada
// ---------------------------------------------------------------------------

const rutaDelTema = join(dirTemas, `${materia}-${numero}.json`);

async function leerLoGuardado() {
  if (banderas.has('--rehacer')) return null;
  try {
    return JSON.parse(await readFile(rutaDelTema, 'utf8'));
  } catch {
    return null;
  }
}

async function guardar(tema) {
  await mkdir(dirTemas, { recursive: true });
  await writeFile(rutaDelTema, JSON.stringify(tema, null, 2) + '\n', 'utf8');
}

// ---------------------------------------------------------------------------
// Y ahora sí
// ---------------------------------------------------------------------------

const temario = JSON.parse(await readFile(join(dirTemarios, `${materia}.json`), 'utf8'));
const tema = temario.temas.find((t) => t.numero === numero);
if (!tema) morir(`No hay tema ${numero} en ${materia}.json.`);

const sistema = cuerpoDelPrompt(await readFile(join(dirPrompts, '00-sistema.md'), 'utf8'));
const ejemploCanon = await readFile(join(dirEsquema, 'canon-ejemplo.json'), 'utf8');

const guardado = await leerLoGuardado();
const salida = guardado ?? {
  materia: temario.clave,
  temaNumero: tema.numero,
  titulo: tema.titulo,
  generadoEn: new Date().toISOString(),
  canon: null,
  ver: null,
  contacto: null,
  completar: null,
  escalera: null,
  error: null,
  explicar: null,
};

decir(`\n${temario.nombre} · tema ${tema.numero} · ${tema.titulo}`);
decir(`${tema.grado} · familia ${tema.familia}`);
if (guardado) decir('Se retoma lo que ya estaba en el archivo.');

/** Una llamada de punta a punta: interpola, llama, valida, guarda. */
async function correr(paso, valores) {
  const md = await readFile(join(dirPrompts, paso.prompt), 'utf8');
  const mensaje = interpolar(cuerpoDelPrompt(md), valores, paso.prompt);

  if (seco) {
    const esquema = await cargarEsquema(paso.esquema);
    const pesoEsquema = JSON.stringify(esquema).length;
    decir(
      `  ${paso.clave.padEnd(10)} ${paso.herramienta.padEnd(30)} ` +
        `mensaje ${String(mensaje.length).padStart(6)} car · esquema ${String(pesoEsquema).padStart(6)} car · ` +
        `tool_choice ${paso.busquedaWeb ? 'auto + búsqueda web' : 'forzado'}`,
    );
    return null;
  }

  decir(`\n  ${paso.clave} · ${paso.herramienta}`);
  let resultado = await llamarConReintentos({ paso, sistema, mensaje });

  comprobarEsquema(paso, resultado);
  comprobarTraza(paso, resultado, temario, tema);

  if (paso.busquedaWeb) resultado = await acomodarVideos(resultado);

  if (resultado.noSePuede) {
    decir(`      noSePuede lleno: ${resultado.noSePuede.que}`);
    decir(`      y hace falta: ${resultado.noSePuede.porQue}`);
  }
  return resultado;
}

// En seco no hay canon, así que las estaciones se arman con un canon de mentiras
// —el de referencia— nada más para comprobar que los placeholders se resuelven.
if (seco) {
  decir('\nEn seco: nada se manda y nada se guarda.\n');
  const canonFalso = JSON.parse(ejemploCanon);
  const valoresSecos = {
    ...valoresDelTema(temario, tema, ejemploCanon),
    ...valoresDelCanon(canonFalso),
  };
  let rotos = 0;
  for (const paso of [CANON, ...ESTACIONES, ...Object.values(CASOS_APARTE)]) {
    try {
      await correr(paso, paso === CANON ? valoresDelTema(temario, tema, ejemploCanon) : valoresSecos);
    } catch (e) {
      rotos += 1;
      console.error(`  ${paso.clave.padEnd(10)} ROTO: ${e.message}`);
    }
  }
  decir(
    '\nEl sistema (00-sistema.md) va igual en las ' +
      `${1 + ESTACIONES.length} llamadas de un tema lineal, y pesa ${sistema.length} caracteres.`,
  );
  if (rotos > 0) {
    console.error(`\n${rotos} prompt(s) con placeholders sin resolver.`);
    process.exit(1);
  }
  decir('\nTodos los placeholders se resuelven.');
  process.exit(0);
}

// Paso 0 · el canon. Sin él no se puede pedir ninguna estación.
if (!salida.canon) {
  try {
    salida.canon = await correr(CANON, valoresDelTema(temario, tema, ejemploCanon));
  } catch (e) {
    morir(`El canon no salió, así que no hay de dónde colgar las seis estaciones.`, e.message);
  }
  await guardar(salida);
  decir('      canon guardado');
} else {
  decir('\n  canon · ya estaba');
}

const canon = salida.canon;
const valores = {
  ...valoresDelTema(temario, tema, ejemploCanon),
  ...valoresDelCanon(canon),
};

// El ruteo: qué prompts le tocan a este tema (CONTRATO.md §3).
const caso =
  canon.notacion === 'tabla'
    ? CASOS_APARTE.tabla
    : canon.notacion === 'figura'
      ? CASOS_APARTE.figura
      : canon.formaDeRespuesta === 'palabra'
        ? CASOS_APARTE.teclado
        : canon.formaDeRespuesta === 'trazo'
          ? CASOS_APARTE.figura
          : null;

if (caso) {
  decir(
    `\n  Ruteo: notacion "${canon.notacion}", respuesta "${canon.formaDeRespuesta}".\n` +
      `  Este tema va a ${caso.prompt}, que sustituye a: ${caso.reemplaza.join(', ')}.\n` +
      '  Ese caso aparte pide componentes de UI que hoy no existen (CONTRATO.md §5),\n' +
      '  asi que aqui solo se generan las estaciones que si corren.',
  );
}

const porGenerar = ESTACIONES.filter((e) => {
  if (solo) return e.clave === solo;
  if (salida[e.clave]) return false;
  if (caso && caso.reemplaza.includes(e.clave)) return false;
  return true;
});

if (solo && solo !== 'canon' && porGenerar.length === 0) {
  morir(`--solo ${solo}: no es ninguna de las seis estaciones.`);
}

let rajadas = 0;
for (const paso of porGenerar) {
  try {
    salida[paso.clave] = await correr(paso, valores);
    await guardar(salida);
    decir(`      ${paso.clave} guardado`);
  } catch (e) {
    rajadas += 1;
    console.error(`  ${paso.clave} NO SALIÓ: ${e.message}`);
    console.error('  Se sigue con las demás; vuelve a correr el script para retomar ésta.');
  }
}

await guardar(salida);

const hechas = ESTACIONES.filter((e) => salida[e.clave]).map((e) => e.clave);
const faltan = ESTACIONES.filter(
  (e) => !salida[e.clave] && !(caso && caso.reemplaza.includes(e.clave)),
).map((e) => e.clave);
const conNoSePuede = ['canon', ...ESTACIONES.map((e) => e.clave)].filter(
  (c) => salida[c] && salida[c].noSePuede,
);

decir(`\n${rutaDelTema}`);
decir(`  hechas: ${hechas.length ? hechas.join(', ') : 'ninguna'}`);
if (faltan.length) decir(`  faltan: ${faltan.join(', ')}`);
if (caso) decir(`  a ${caso.prompt}: ${caso.reemplaza.join(', ')}`);
if (conNoSePuede.length) decir(`  con noSePuede lleno: ${conNoSePuede.join(', ')}`);
decir(
  '  El cierre no se genera: su frase es quedaSabiendo del temario y el resto es\n' +
    '  copy fijo y estado de la app (CONTRATO.md §4).',
);

if (rajadas > 0) {
  console.error(`\n${rajadas} llamada(s) sin salir. El archivo quedó a medias, y se retoma.`);
  process.exit(1);
}
if (faltan.length > 0) {
  console.error(`\nFaltan ${faltan.length} estacion(es). Vuelve a correrlo para retomar.`);
  process.exit(1);
}
decir('\nTema completo.');
