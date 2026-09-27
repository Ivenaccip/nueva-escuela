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

import { buscarVideos, candidatosComoTexto } from './buscar-videos.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const dirEsquema = join(aqui, 'esquema');
const dirPrompts = join(aqui, 'prompts');
const dirTemarios = join(aqui, 'temarios');
const dirTemas = join(aqui, 'temas');

// Las llaves viven en `.env`, que .gitignore ignora. Lo que ya venga exportado en
// el shell gana: esto no pisa una llave puesta a mano.
try {
  const antes = { ...process.env };
  process.loadEnvFile(join(dirname(aqui), '.env'));
  for (const clave of Object.keys(antes)) if (antes[clave]) process.env[clave] = antes[clave];
} catch {
  // Sin `.env` no pasa nada: las llaves pueden venir del entorno.
}

/**
 * Haiku 4.5. El id va sin sufijo de fecha: `claude-haiku-4-5-20251001` da 404.
 * Haiku no sirve `output_config.effort` (da error) y su pensamiento se pide con
 * `budget_tokens`, no con `adaptive`.
 */
const MODELO = process.env.ANDAMIO_MODELO ?? 'claude-haiku-4-5';
const MAX_TOKENS = 16000;

/**
 * El prefijo que se cachea es `tools` + `system`, en ese orden de render. Para una
 * misma estación ese prefijo es idéntico en los 20 temas, así que del segundo tema
 * en adelante se lee del caché. El mínimo cacheable de Haiku 4.5 son 4 096 tokens
 * (no 1 024): el sistema solo no llega, pero con el esquema delante sí.
 */
const CACHEAR = { type: 'ephemeral' };

/**
 * `strict` obliga al servidor a validar los argumentos, pero su subconjunto de
 * JSON Schema es más chico que el de ajv: un esquema que aquí vale puede salir
 * rechazado allá. Si la primera llamada lo rechaza se apaga para toda la corrida
 * y ajv sigue haciendo el trabajo, en vez de tirar las ciento cuarenta llamadas.
 */
let estricto = true;

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
};

const ESTACIONES = [
  {
    clave: 'ver',
    prompt: '01-ver.md',
    esquema: '01-ver.schema.json',
    herramienta: 'escribir_estacion_ver',
    descripcion:
      'Entrega la pregunta que abre el tema, el resumen y el video escogido de la busqueda.',
    // No busca ella: la busqueda la hace OpenAI antes (buscar-videos.mjs) y aqui
    // solo llegan candidatos ya comprobados contra oEmbed.
    necesitaVideos: true,
  },
  {
    clave: 'contacto',
    prompt: '02-contacto.md',
    esquema: '02-contacto.schema.json',
    herramienta: 'escribir_estacion_contacto',
    descripcion: 'Entrega el bloque de preguntas de cuatro opciones del primer contacto.',
  },
  {
    clave: 'completar',
    prompt: '03-completar.md',
    esquema: '03-completar.schema.json',
    herramienta: 'escribir_estacion_completar',
    descripcion: 'Entrega el renglon con un hueco, su respuesta y sus pistas.',
  },
  {
    clave: 'escalera',
    prompt: '04-escalera.md',
    esquema: '04-escalera.schema.json',
    herramienta: 'escribir_estacion_escalera',
    descripcion: 'Entrega los escalones de la escalera, con su respuesta y sus pistas.',
  },
  {
    clave: 'error',
    prompt: '05-error.md',
    esquema: '05-error.schema.json',
    herramienta: 'escribir_estacion_error',
    descripcion: 'Entrega el procedimiento con un paso mal, los motivos y las pistas.',
  },
  {
    clave: 'explicar',
    prompt: '06-explicar.md',
    esquema: '06-explicar.schema.json',
    herramienta: 'escribir_estacion_explicar',
    descripcion:
      'Entrega los textos de la estacion de explicar y la rubrica con la que se califica.',
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
    /** Sustituye a estas cuatro estaciones. */
    reemplaza: ['contacto', 'completar', 'escalera', 'error'],
  },
  figura: {
    clave: 'X2-figura',
    prompt: 'X2-figura.md',
    esquema: 'X2-figura.schema.json',
    herramienta: 'escribir_caso_figura',
    descripcion: 'Entrega la especificacion de la figura y el plan B lineal.',
    reemplaza: ['completar', 'escalera'],
  },
  teclado: {
    clave: 'X3-teclado',
    prompt: 'X3-respuesta-no-numerica.md',
    esquema: 'X3-respuesta-no-numerica.schema.json',
    herramienta: 'escribir_caso_teclado',
    descripcion:
      'Elige el teclado del tema y escribe con el las respuestas de las estaciones 3 y 4.',
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
//
// Las dos llaves se comprueban aquí, antes de la primera llamada. La de OpenAI no
// se usa hasta la estación 1, y descubrir que falta ahí sería descubrirlo con el
// canon ya pagado. El sondeo (`--solo canon`) no la necesita, así que no la pide.
function faltaLaLlave(nombre, paraQue) {
  if (process.env[nombre]) return null;
  return [
    `Falta ${nombre}, que es ${paraQue}.`,
    '',
    `Ponla en ${join(dirname(aqui), '.env')}, en el renglon que ya esta ahi:`,
    '',
    `    ${nombre}=pega-aqui-la-llave`,
    '',
    'Ese archivo lo ignora git, y generar.mjs y tanda.mjs lo cargan solos: no hace',
    'falta exportar nada en la terminal. Si de todos modos la exportas, esa gana.',
  ].join('\n');
}

if (!seco) {
  const pendientes = [
    faltaLaLlave('ANTHROPIC_API_KEY', 'la que escribe el contenido'),
    solo === 'canon'
      ? null
      : faltaLaLlave('OPENAI_API_KEY', 'la que busca el video de la estacion 1'),
  ].filter(Boolean);
  if (pendientes.length) morir(pendientes.join('\n\n'));
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
      if (estricto && /strict|schema/i.test(e.message)) {
        estricto = false;
        console.error('      el servidor rechazó `strict`; se apaga y valida sólo ajv. Reintento.');
        return pedir({ ...cuerpo, tools: cuerpo.tools.map(({ strict, ...t }) => t) });
      }
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
 * Una llamada: `tool_choice` forzado, `strict: true` y un solo turno.
 *
 * Las siete son iguales desde que la búsqueda salió de aquí. Antes la estación 1
 * era la excepción porque forzar la herramienta y pedir búsqueda web son
 * incompatibles; ahora busca OpenAI por su cuenta y esa excepción se acabó.
 *
 * `strict: true` hace que los argumentos de la herramienta validen contra el
 * esquema en el servidor. No sustituye a ajv —el esquema completo no cabe en el
 * subconjunto de strict— pero atrapa gratis la mitad de los errores de forma.
 */
async function llamar({ paso, sistema, mensaje }) {
  const esquema = await cargarEsquema(paso.esquema);
  const herramientaSalida = {
    name: paso.herramienta,
    description: paso.descripcion,
    input_schema: esquema,
    ...(estricto ? { strict: true } : {}),
  };

  const mensajes = [{ role: 'user', content: mensaje }];
  const tope = 1;

  for (let turno = 1; turno <= tope; turno += 1) {
    const datos = await pedir({
      model: MODELO,
      max_tokens: MAX_TOKENS,
      // El corte del caché va al final del sistema: lo de antes (el esquema y el
      // sistema) es idéntico entre temas; el mensaje, que cambia, queda después.
      system: [{ type: 'text', text: sistema, cache_control: CACHEAR }],
      tools: [herramientaSalida],
      tool_choice: { type: 'tool', name: paso.herramienta },
      messages: mensajes,
    });

    if (datos.usage) {
      const leido = datos.usage.cache_read_input_tokens ?? 0;
      const escrito = datos.usage.cache_creation_input_tokens ?? 0;
      if (leido || escrito) decir(`      caché: ${leido} leidos, ${escrito} escritos`);
    }

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

    throw new Rajada(
      `${paso.clave}: contestó sin llamar a ${paso.herramienta} (stop_reason ${datos.stop_reason}). Se descarta.`,
    );
  }

  throw new Rajada(`${paso.clave}: nunca llamó a ${paso.herramienta}. Se descarta y se reintenta.`);
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

/**
 * El modelo tiene que escoger uno de los candidatos que OpenAI encontró, no
 * escribir una URL suya. Un id inventado tiene once caracteres válidos y casi
 * siempre existe —lleva a un video cualquiera— así que la forma no prueba nada:
 * lo único que prueba algo es que el id esté en la lista que se le dio.
 */
function comprobarVideoEscogido(salida, candidatos) {
  if (!salida.video) return;
  const permitidos = new Set(candidatos.map((c) => c.idDeYouTube));
  const escogido = salida.video.idDeYouTube ?? '';
  if (permitidos.has(escogido)) return;
  console.error(
    `      video descartado: escogió "${escogido}", que no estaba entre los ${permitidos.size} ` +
      'candidatos buscados. Se guarda el tema sin video.',
  );
  salida.video = null;
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
        `tool_choice forzado${paso.necesitaVideos ? ' · con videos de OpenAI' : ''}`,
    );
    return null;
  }

  decir(`\n  ${paso.clave} · ${paso.herramienta}`);
  let resultado = await llamarConReintentos({ paso, sistema, mensaje });

  comprobarEsquema(paso, resultado);
  comprobarTraza(paso, resultado, temario, tema);

  if (paso.necesitaVideos) comprobarVideoEscogido(resultado, valores.__candidatos ?? []);

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
    resultadosDeBusqueda: '(en seco no se busca: aquí irían los candidatos de OpenAI)',
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
    const suyos = { ...valores };
    if (paso.necesitaVideos) {
      decir('\n  buscando el video con OpenAI...');
      const hallazgo = await buscarVideos(tema, materia);
      decir(
        `      ${hallazgo.candidatos.length} candidato(s) de ${hallazgo.buscados} enlace(s) vistos` +
          (hallazgo.descartados.length ? `, ${hallazgo.descartados.length} descartado(s)` : ''),
      );
      suyos.resultadosDeBusqueda = candidatosComoTexto(hallazgo);
      suyos.__candidatos = hallazgo.candidatos;
    }
    salida[paso.clave] = await correr(paso, suyos);
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
