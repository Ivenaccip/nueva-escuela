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
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';

import { buscarVideos, candidatosComoTexto } from './buscar-videos.mjs';
import { resultadoSinCifra } from './forma.mjs';
import { llaveDeAnthropic } from './llaves.mjs';
import {
  anotar,
  CODIGO_DE_TOPE,
  comprobarTope,
  costoDeClaude,
  resumenDelGasto,
  TopeAlcanzado,
} from './gasto.mjs';

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

/**
 * El id del `tool_use` de cada salida, por objeto. La corrección (ver `correr`) tiene
 * que devolverle al modelo su propia salida como turno suyo, y la API exige el id.
 */
const IDS_DE_SALIDA = new WeakMap();

const morir = (mensaje, detalle) => {
  console.error(`\n${mensaje}`);
  if (detalle) console.error(detalle);
  process.exit(1);
};

/**
 * Parar porque se llegó al tope de gasto. Sale con un código propio para que
 * `tanda.mjs` no siga con el tema siguiente: el tope es de toda la corrida.
 */
const pararPorTope = (e) => {
  console.error(`\n${e.message}`);
  process.exit(CODIGO_DE_TOPE);
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

/**
 * `strict` haría que el servidor validara los argumentos, pero su subconjunto de
 * JSON Schema es más chico que el de ajv y **estos esquemas no caben**: el sondeo
 * de los trece primeros temas de Matemáticas lo rechazó en las trece llamadas.
 * Va apagado, entonces, para no gastar un viaje rechazado por proceso; con
 * `--estricto` se vuelve a probar, y si lo rechaza se apaga solo y sigue.
 *
 * Que esté apagado no deja nada sin validar: ajv comprueba cada respuesta contra
 * el esquema completo antes de guardarla, y ahí sí caben todas las palabras.
 */
let estricto = banderas.has('--estricto');

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
    llaveDeAnthropic()
      ? null
      : faltaLaLlave(
          'ANDAMIO_ANTHROPIC_API_KEY',
          'la que escribe el contenido (también vale ANTHROPIC_API_KEY)',
        ),
    solo === 'canon'
      ? null
      : faltaLaLlave('OPENAI_API_KEY', 'la que busca el video de la estacion 1'),
  ].filter(Boolean);
  if (pendientes.length) morir(pendientes.join('\n\n'));
}

const cliente = seco ? null : new Anthropic({ apiKey: llaveDeAnthropic() });

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
    if (e instanceof Anthropic.AuthenticationError) morir('La llave de Anthropic no sirve.');
    if (e instanceof Anthropic.BadRequestError) {
      if (estricto && /strict|schema/i.test(e.message)) {
        estricto = false;
        console.error(`      el servidor rechazó \`strict\`: ${e.message}`);
        console.error('      se apaga y valida sólo ajv, que comprueba lo mismo. Reintento.');
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
async function llamar({ paso, sistema, mensaje, corregir }) {
  const esquema = await cargarEsquema(paso.esquema);
  const herramientaSalida = {
    name: paso.herramienta,
    description: paso.descripcion,
    input_schema: esquema,
    ...(estricto ? { strict: true } : {}),
  };

  const mensajes = [{ role: 'user', content: mensaje }];
  // Una corrección es la misma conversación con dos turnos más: lo que el modelo
  // devolvió, y el resultado de la herramienta como error con lo que falló.
  if (corregir) {
    const id = IDS_DE_SALIDA.get(corregir.salida);
    mensajes.push(
      {
        role: 'assistant',
        content: [{ type: 'tool_use', id, name: paso.herramienta, input: corregir.salida }],
      },
      {
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: id,
            is_error: true,
            content:
              `La salida no pasó la validación. Los errores exactos:\n${corregir.errores}\n\n` +
              `Llama otra vez a ${paso.herramienta} con la salida COMPLETA, igual que la anterior ` +
              'salvo los campos que el error señala. Corrige sólo esos: lo que pasó del tope de ' +
              'caracteres se reescribe más corto, con la misma idea y sin cortar a media frase; ' +
              'respeta cada tope; no cambies nada más.',
          },
        ],
      },
    );
  }
  const tope = 1;

  for (let turno = 1; turno <= tope; turno += 1) {
    await comprobarTope('claude');
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
      const { acumulado, tope: limite } = await anotar('claude', costoDeClaude(MODELO, datos.usage));
      decir(`      gasto: $${acumulado.toFixed(3)} de $${limite.toFixed(2)}`);
      const leido = datos.usage.cache_read_input_tokens ?? 0;
      const escrito = datos.usage.cache_creation_input_tokens ?? 0;
      if (leido || escrito) decir(`      caché: ${leido} leidos, ${escrito} escritos`);
    }

    // Una salida cortada por el tope sale con 200 y un `tool_use` a medias, así
    // que sin esto el síntoma es «faltan cuatro campos obligatorios» y uno se va
    // a buscar el error al prompt. Pasó en la estación 5 del tema 3: el modelo
    // mandó `pasos` como una cadena de 3 545 caracteres —serializar un arreglo
    // gasta el doble— y se quedó sin espacio para los últimos cuatro campos.
    if (datos.stop_reason === 'max_tokens') {
      throw new Rajada(
        `${paso.clave}: la salida se cortó en el tope de ${MAX_TOKENS} tokens y llegó incompleta. ` +
          'Casi siempre es porque devolvió algún arreglo serializado como cadena, que gasta el doble.',
      );
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
    if (salida) {
      IDS_DE_SALIDA.set(salida.input, salida.id);
      return salida.input;
    }

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
      // Reintentar contra el tope sólo gastaría tiempo: la respuesta no va a cambiar.
      if (e instanceof TopeAlcanzado) throw e;
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

/**
 * Un renglón que llegó como cadena en vez de arreglo. Haiku lo hace seguido: el
 * arreglo es correcto, pero serializado, con sus comillas escapadas adentro. Se
 * repara en vez de tirar la llamada, porque un reintento cuesta lo mismo que la
 * llamada entera y lo que devolvería es esto mismo.
 *
 * El aviso sale ruidoso a propósito: si empieza a salir en todas las llamadas,
 * lo que hay que arreglar es el prompt, no seguir remendando aquí.
 */
function repararArreglosSerializados(valor, ruta = '') {
  if (Array.isArray(valor)) {
    valor.forEach((v, i) => repararArreglosSerializados(v, `${ruta}/${i}`));
    return valor;
  }
  if (!valor || typeof valor !== 'object') return valor;
  for (const [clave, v] of Object.entries(valor)) {
    if (typeof v === 'string' && v.trimStart().startsWith('[') && v.trimEnd().endsWith(']')) {
      try {
        const abierto = JSON.parse(v);
        if (Array.isArray(abierto)) {
          valor[clave] = abierto;
          console.error(`      reparado: ${ruta}/${clave} venía como cadena, era un arreglo`);
          repararArreglosSerializados(abierto, `${ruta}/${clave}`);
          continue;
        }
      } catch {
        // No era JSON: es texto que de casualidad empieza con corchete. Se deja.
      }
    }
    repararArreglosSerializados(v, `${ruta}/${clave}`);
  }
  return valor;
}

/**
 * Los «exactamente uno» que el esquema no puede expresar. Contar a uno sobre una
 * salida larga es justo lo que se le va a un modelo chico, y la salida valida
 * perfecto: sin esto, una estación 5 sin motivo bueno o con dos se guarda igual y
 * el estudiante se topa con una pregunta que no tiene respuesta.
 */
const UNO_SOLO = {
  error: (s) => [['motivos', (s.motivos ?? []).filter((m) => m.esElBueno).length, 'esElBueno']],
  contacto: (s) => [
    ...(s.preguntas ?? []).map((p, i) => [
      `preguntas[${i}].opciones`,
      (p.opciones ?? []).filter((o) => o.esCorrecta).length,
      'esCorrecta',
    ]),
    [
      'todo el bloque',
      (s.preguntas ?? []).flatMap((p) => p.opciones ?? []).filter((o) => o.esElErrorTipico).length,
      'esElErrorTipico',
    ],
  ],
  explicar: (s) => [
    [
      'rubrica.ideasQueCuentan',
      (s.rubrica?.ideasQueCuentan ?? []).filter((i) => i.esImprescindible).length,
      'esImprescindible',
    ],
  ],
};

function comprobarUnoSolo(paso, salida) {
  const mirar = UNO_SOLO[paso.clave];
  if (!mirar) return;
  const mal = mirar(salida).filter(([, cuantos]) => cuantos !== 1);
  if (mal.length === 0) return;
  throw new Rajada(
    `${paso.clave}: tiene que haber exactamente uno y no lo hay\n` +
      mal.map(([donde, cuantos, campo]) => `    ${donde}: ${cuantos} con ${campo}`).join('\n'),
  );
}

function comprobarEsquema(paso, salida) {
  repararArreglosSerializados(salida);
  const validar = validadores.get(paso.esquema);
  if (!validar(salida)) {
    // Se guarda lo rechazado. Un prompt no se arregla adivinando qué devolvió el
    // modelo: el error de ajv dice qué campo está mal, no qué escribió en su lugar,
    // y eso último es justo lo que hay que enseñarle a no hacer.
    // Síncrono a propósito: `morir()` sale del proceso y una escritura con promesa
    // no alcanza a terminar.
    const donde = join(dirTemas, `_rechazado-${materia}-${numero}-${paso.clave}.json`);
    try {
      mkdirSync(dirTemas, { recursive: true });
      writeFileSync(donde, JSON.stringify(salida, null, 2) + '\n', 'utf8');
      console.error(`      lo rechazado se guardó en ${donde}`);
    } catch {
      // Si no se puede escribir, el error de ajv de abajo sigue siendo lo importante.
    }
    throw new Rajada(
      `${paso.clave}: la salida no valida contra ${paso.esquema}\n${contarErrores(validar)}`,
    );
  }
}

/**
 * Los cuatro pasos cuyo `titulo` de raíz es el del temario, «copiado sin
 * cambiarlo». El `titulo` de 06-explicar NO está aquí: ése es la petición que la
 * pantalla pinta en grande, otra cosa con el mismo nombre.
 */
const TITULO_DEL_TEMARIO = new Set(['canon', 'X1-tabla', 'X2-figura', 'X3-teclado']);

/**
 * `temaNumero`, `materia` y el `titulo` los sabe el llamador con certeza, así que
 * pedírselos al modelo sólo agrega una manera de fallar: los olvida y se tira la
 * llamada entera por campos que nadie tenía que adivinar. Se rellenan cuando faltan.
 *
 * Lo que sí vale la pena sigue vivo en `comprobarTraza`: si vienen y no cuadran, eso
 * es una respuesta cruzada —un reintento que se cruzó, una tanda que se reanudó a
 * medias— y se rechaza, para que la estación 5 de un tema no acuse un paso de otro.
 */
function sellarTraza(paso, salida, temario, tema) {
  if (!salida || typeof salida !== 'object') return;
  if (!('temaNumero' in salida)) salida.temaNumero = tema.numero;
  if (!('materia' in salida)) salida.materia = temario.clave;
  if (TITULO_DEL_TEMARIO.has(paso.clave) && !('titulo' in salida)) salida.titulo = tema.titulo;
}

/**
 * Caracteres que no se ven y sí cuentan: guion blando (U+00AD), espacios de ancho
 * cero y la marca de orden de bytes. Haiku los mete a veces dentro de una palabra
 * («só\u00ADlo») o entre todas («error.arrastre» del tema 13 de Química llevaba 29).
 * En pantalla no se ven, pero parten palabras a medio renglón, rompen la búsqueda
 * del texto y suman caracteres al tope. No son contenido: se quitan.
 */
const INVISIBLES = /[\u00AD\u200B-\u200D\uFEFF]/g;

function sellarInvisibles(salida) {
  const andar = (nodo) => {
    if (Array.isArray(nodo)) {
      nodo.forEach((valor, i) => {
        if (typeof valor === 'string') nodo[i] = valor.replace(INVISIBLES, '');
        else andar(valor);
      });
      return;
    }
    if (!nodo || typeof nodo !== 'object') return;
    for (const [llave, valor] of Object.entries(nodo)) {
      if (typeof valor === 'string') nodo[llave] = valor.replace(INVISIBLES, '');
      else andar(valor);
    }
  };
  andar(salida);
}

/**
 * Quita la comilla recta que cierra un texto sin haber abierto nada. Los campos
 * son texto plano, así que una `"` suelta en el borde no es contenido: es el
 * cierre del JSON que se coló dentro del valor. Medido sobre los nueve temas
 * jugables, le pasó a `error.porQue` en tres —y ése se pinta en pantalla, con la
 * comilla— y a `error.arrastre` en nueve. Con una cantidad par no se toca nada, y
 * una comilla en medio de una frase tampoco: sólo la del borde.
 */
function sellarComillasSueltas(salida) {
  const limpiar = (texto) => {
    if ((texto.match(/"/g) ?? []).length % 2 === 0) return texto;
    if (texto.endsWith('"')) return texto.slice(0, -1);
    if (texto.startsWith('"')) return texto.slice(1);
    return texto;
  };
  const andar = (nodo) => {
    if (Array.isArray(nodo)) {
      nodo.forEach((valor, i) => {
        if (typeof valor === 'string') nodo[i] = limpiar(valor);
        else andar(valor);
      });
      return;
    }
    if (!nodo || typeof nodo !== 'object') return;
    for (const [llave, valor] of Object.entries(nodo)) {
      if (typeof valor === 'string') nodo[llave] = limpiar(valor);
      else andar(valor);
    }
  };
  andar(salida);
}

/**
 * Los índices del arreglo, escritos a mano. `letra` es 'ABCD'[i], `orden` es i+1
 * y `numero` es i+1: más de cincuenta campos obligatorios por tema que nadie
 * tenía que adivinar, y cada uno tiraba la llamada entera si faltaba. Son los más
 * cortos y los más del final de cada objeto, que es justo lo que se le va a un
 * modelo chico en una salida larga.
 *
 * Recorre la salida entera en vez de nombrar rutas: así cubre igual las seis
 * estaciones, el canon y los cuatro casos aparte, donde los mismos arreglos
 * viven anidados tres o cuatro niveles más abajo.
 */
function sellarIndices(salida) {
  const andar = (nodo) => {
    if (Array.isArray(nodo)) return nodo.forEach(andar);
    if (!nodo || typeof nodo !== 'object') return;
    for (const [llave, valor] of Object.entries(nodo)) {
      if (Array.isArray(valor)) {
        valor.forEach((item, i) => {
          if (!item || typeof item !== 'object' || Array.isArray(item)) return;
          const cual = indiceDe(llave, item);
          if (cual && !(cual.campo in item)) item[cual.campo] = cual.valor(i);
        });
      }
      andar(valor);
    }
  };
  andar(salida);
}

/**
 * Qué índice le toca a un objeto, si le toca alguno. El nombre del arreglo no basta:
 * `respuesta.opciones` de X3 también se llama `opciones` y sus entradas llevan
 * `etiqueta`, no `letra`. Meterle una `letra` la tiraría, porque los esquemas van con
 * `additionalProperties: false`. Por eso se mira también la forma del objeto.
 */
function indiceDe(llave, item) {
  if (llave === 'opciones' && 'partes' in item) {
    return { campo: 'letra', valor: (i) => 'ABCD'[i] };
  }
  if (llave === 'pistas' && 'texto' in item) {
    return { campo: 'orden', valor: (i) => i + 1 };
  }
  if (llave === 'pasos' && ('partes' in item || 'queSeHace' in item)) {
    return { campo: 'numero', valor: (i) => i + 1 };
  }
  return null;
}

/**
 * Los índices que sí vinieron tienen que cuadrar con su posición. Es lo mismo que
 * `comprobarTraza` hace con `temaNumero`: rellenar lo que falta no puede tapar una
 * salida descuadrada, porque un `letra: "C"` en el primer lugar cambia cuál opción
 * se marca como correcta.
 */
function comprobarIndices(paso, salida) {
  const mal = [];
  const andar = (nodo, ruta) => {
    if (Array.isArray(nodo)) return nodo.forEach((v, i) => andar(v, `${ruta}[${i}]`));
    if (!nodo || typeof nodo !== 'object') return;
    for (const [llave, valor] of Object.entries(nodo)) {
      if (Array.isArray(valor)) {
        valor.forEach((item, i) => {
          if (!item || typeof item !== 'object' || Array.isArray(item)) return;
          const cual = indiceDe(llave, item);
          if (!cual || !(cual.campo in item)) return;
          const esperado = cual.valor(i);
          if (item[cual.campo] === esperado) return;
          mal.push(
            `${ruta}.${llave}[${i}].${cual.campo}: dice ${JSON.stringify(item[cual.campo])} ` +
              `y va ${JSON.stringify(esperado)}`,
          );
        });
      }
      andar(valor, `${ruta}.${llave}`);
    }
  };
  andar(salida, '');
  if (mal.length === 0) return;
  throw new Rajada(`${paso.clave}: un índice no cuadra con su posición\n    ${mal.join('\n    ')}`);
}

/**
 * Lo que el llamador sabe del caso X3: `faltaCodigo` es `teclado !== 'digitos'`,
 * y los tres booleanos de `comoSeCompara` sólo tienen algo que decidir cuando el
 * teclado es de texto. Con los otros tres teclados sólo se puede escribir lo que
 * viene pintado, así que la comparación es exacta.
 */
function sellarTeclado(paso, salida) {
  if (paso.clave !== 'X3-teclado' || !salida || typeof salida !== 'object') return;
  if (!('faltaCodigo' in salida)) salida.faltaCodigo = salida.teclado !== 'digitos';
  if (salida.teclado === 'texto') return;
  salida.comoSeCompara ??= {};
  for (const b of ['ignoraMayusculas', 'ignoraAcentos', 'ignoraEspaciosDeMas']) {
    if (!(b in salida.comoSeCompara)) salida.comoSeCompara[b] = false;
  }
}

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
  if (TITULO_DEL_TEMARIO.has(paso.clave) && 'titulo' in salida && salida.titulo !== tema.titulo) {
    throw new Rajada(
      `${paso.clave}: devolvió titulo "${salida.titulo}" y el del temario es "${tema.titulo}".`,
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

/**
 * Los cuatro campos de identidad del video los sabe el llamador con certeza: la
 * URL, el título y el canal salen del oEmbed de YouTube (buscar-videos.mjs:108-115,
 * y la línea 14 de ese archivo dice que salen de ahí «no del modelo»), y
 * `dondeSalio` es el campo `deDonde` del candidato. Pedírselos al modelo era
 * pedirle dieciséis transcripciones literales por llamada —dos de ellas cadenas de
 * longitud exacta, 43 y 11— y cuatro puntos del revísate para vigilarlas.
 *
 * Se sella ANTES de validar: así una URL mal copiada no puede tirar la llamada.
 * Lo que sigue siendo del modelo es el `idDeYouTube`, que es la elección, y su
 * juicio. Un id que no esté en la lista lo caza `comprobarVideoEscogido` después.
 */
function sellarVideo(salida, candidatos, consulta) {
  if (!salida || typeof salida !== 'object') return;

  if (salida.busqueda && typeof salida.busqueda === 'object' && consulta) {
    // La consulta la compuso el llamador y nunca se le mostró al modelo, así que
    // pedírsela era pedirle que se la inventara. Ahora sí se guarda la de verdad.
    salida.busqueda.consulta = consulta;
    salida.busqueda.consultasAlternas = [];
  }

  const porId = new Map(candidatos.map((c) => [c.idDeYouTube, c]));
  const sellarUno = (v) => {
    if (!v || typeof v !== 'object') return;
    const c = porId.get(v.idDeYouTube);
    if (!c) return; // id de fuera de la lista: no hay de dónde copiar, y se caza aparte
    v.url = c.url;
    v.titulo = c.titulo;
    v.canal = c.canal;
    v.dondeSalio = `De donde lo vio el buscador: ${c.deDonde}.`;
  };
  sellarUno(salida.video);
  if (Array.isArray(salida.alternativas)) salida.alternativas.forEach(sellarUno);
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

  const sellarYComprobar = (r) => {
    // Todo lo que el llamador sabe con certeza se rellena ANTES de validar: un campo
    // que nadie tenía que adivinar no puede tirar la llamada entera.
    sellarTraza(paso, r, temario, tema);
    sellarIndices(r);
    sellarInvisibles(r);
    sellarComillasSueltas(r);
    sellarTeclado(paso, r);
    if (paso.necesitaVideos) sellarVideo(r, valores.__candidatos ?? [], valores.__consulta);

    comprobarEsquema(paso, r);
    comprobarTraza(paso, r, temario, tema);
    comprobarIndices(paso, r);
    comprobarUnoSolo(paso, r);

    if (paso.necesitaVideos) comprobarVideoEscogido(r, valores.__candidatos ?? []);
  };

  // Una vuelta de corrección, no un reintento a ciegas. Lo que más tira una salida
  // es pasarse de un tope de caracteres (resumen 242 de 240, pregunta 75 de 70), y
  // repetir la llamada tal cual vuelve a pasarse por lo mismo: el modelo no ve qué
  // falló. Con el error delante corrige sólo ese campo. Cuesta una llamada más, y
  // ahorra las tres que la tanda se gastaba repitiendo el tema entero.
  try {
    sellarYComprobar(resultado);
  } catch (e) {
    if (!(e instanceof Rajada)) throw e;
    decir(`      no valida; una vuelta de corrección con los errores a la vista`);
    resultado = await llamarConReintentos({
      paso,
      sistema,
      mensaje,
      corregir: { salida: resultado, errores: e.message },
    });
    sellarYComprobar(resultado);
  }

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
    if (e instanceof TopeAlcanzado) pararPorTope(e);
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
//
// `expresion` entró aquí por lo que pasó con el tema 2. La factorización de 360 se
// escribe 2³ × 3² × 5, y el teclado no tiene ni exponente ni la x de multiplicar:
// la estación 4 se pidió igual y $defs.tecleado rechazó «2/3*3/2*5» tres veces
// seguidas. El tope hizo su trabajo; lo que falló fue mandar ese tema a la
// escalera. La mitad del temario de matemáticas está en el mismo caso (la respuesta
// necesita el punto decimal, el signo menos o un símbolo de comparación), así que
// el canon declara `expresion` y el tema sale por aquí en vez de cobrar reintentos.
const caso =
  canon.notacion === 'tabla'
    ? CASOS_APARTE.tabla
    : canon.notacion === 'figura'
      ? CASOS_APARTE.figura
      : canon.formaDeRespuesta === 'palabra' || canon.formaDeRespuesta === 'expresion'
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

// Un canon que se llama numérico y no tiene una sola cifra en su resultado no corre
// en las estaciones 3 y 4: se para aquí, antes de pagar las seis (contenido/forma.mjs).
if (!caso && !solo && resultadoSinCifra(canon)) {
  decir(
    `\n  Forma dudosa: el canon dice "${canon.formaDeRespuesta}" pero su resultado no tiene ninguna cifra.\n` +
      '  Las estaciones 3 y 4 pedirian una respuesta que el teclado no puede escribir, asi que\n' +
      '  no se generan. El canon queda guardado; si de verdad es numerico, rehaz el tema.',
  );
  decir(`\n  Gasto acumulado (contenido/temas/_gasto.json):\n${await resumenDelGasto()}`);
  process.exit(0);
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
      // La búsqueda se paga (≈ $0.2 con gpt-5.5) y la estación 1 puede no salir a la
      // primera. Lo buscado se guarda aparte para que reintentar la estación no lo
      // pague otra vez; un archivo vacío de candidatos no se guarda: ahí sí se busca.
      const rutaDeVideos = join(dirTemas, `_videos-${materia}-${numero}.json`);
      let hallazgo = null;
      try {
        hallazgo = JSON.parse(await readFile(rutaDeVideos, 'utf8'));
        if (!hallazgo?.candidatos?.length) hallazgo = null;
        else decir('\n  video: se reusa la búsqueda guardada de la corrida anterior.');
      } catch {
        // Sin archivo, o ilegible: se busca de nuevo.
      }
      if (!hallazgo) {
        decir('\n  buscando el video con OpenAI...');
        hallazgo = await buscarVideos(tema, materia);
        if (hallazgo.candidatos.length) {
          await writeFile(rutaDeVideos, JSON.stringify(hallazgo, null, 2) + '\n', 'utf8');
        }
      }
      decir(
        `      ${hallazgo.candidatos.length} candidato(s) de ${hallazgo.buscados} enlace(s) vistos` +
          (hallazgo.descartados.length ? `, ${hallazgo.descartados.length} descartado(s)` : ''),
      );
      suyos.resultadosDeBusqueda = candidatosComoTexto(hallazgo);
      suyos.__candidatos = hallazgo.candidatos;
      suyos.__consulta = hallazgo.consulta;
    }
    salida[paso.clave] = await correr(paso, suyos);
    await guardar(salida);
    decir(`      ${paso.clave} guardado`);
  } catch (e) {
    if (e instanceof TopeAlcanzado) pararPorTope(e);
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

decir(`\n  Gasto acumulado (contenido/temas/_gasto.json):\n${await resumenDelGasto()}`);

if (rajadas > 0) {
  console.error(`\n${rajadas} llamada(s) sin salir. El archivo quedó a medias, y se retoma.`);
  process.exit(1);
}
if (faltan.length > 0) {
  console.error(`\nFaltan ${faltan.length} estacion(es). Vuelve a correrlo para retomar.`);
  process.exit(1);
}
decir('\nTema completo.');
