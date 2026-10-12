// Cuánto se lleva gastado, y el tope que no se cruza.
//
// Generar contenido cuesta dinero de verdad, y nada en el generador contaba cuánto.
// Un reintento de más, o una tanda lanzada dos veces, se pagaba sin que nadie lo
// viera. Aquí se cuenta cada llamada y, antes de la siguiente, se mira si ya se
// llegó al tope.
//
// El gasto vive en un archivo y no en memoria porque `tanda.mjs` lanza un proceso
// hijo por tema: lo que uno gasta tiene que verlo el siguiente. Las llamadas de un
// mismo proceso son en serie, así que el archivo no tiene carreras; dos tandas a la
// vez sí podrían pisarse, y no se hace.
//
//   ANDAMIO_TOPE_CLAUDE_USD   por omisión 9
//   ANDAMIO_TOPE_OPENAI_USD   por omisión 8
//   ANDAMIO_USD_POR_BUSQUEDA  por omisión 0.03
//
// Lo de Claude se calcula con los tokens que la propia API reporta en cada
// respuesta. Lo de OpenAI es **una estimación**: se cuentan las búsquedas que hizo y
// se multiplican por un precio fijo, el que `LEEME.md` mide (≈ 7 búsquedas por $0.21).
// El tope de OpenAI es más bajo por eso. Lo que de verdad manda es el límite de
// gasto que se pone en el panel de cada proveedor; esto sólo evita llegar a él.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
export const RUTA_DEL_GASTO = join(aqui, 'temas', '_gasto.json');

/** El código con el que sale un proceso que paró por el tope: `tanda.mjs` lo lee y no sigue. */
export const CODIGO_DE_TOPE = 3;

export class TopeAlcanzado extends Error {}

/** Dólares por millón de tokens. */
const PRECIOS = {
  'claude-haiku-4-5': { entrada: 1, salida: 5 },
};

/**
 * Un modelo que no está en la tabla se cobra caro a propósito: equivocarse hacia
 * arriba hace parar antes, y equivocarse hacia abajo se come el presupuesto.
 */
const PRECIO_SUPUESTO = { entrada: 5, salida: 25 };

const TOPES_POR_OMISION = { claude: 9, openai: 8 };
const VARIABLE_DEL_TOPE = { claude: 'ANDAMIO_TOPE_CLAUDE_USD', openai: 'ANDAMIO_TOPE_OPENAI_USD' };
const NOMBRE = { claude: 'Anthropic', openai: 'OpenAI' };

function numeroDelEntorno(nombre, porOmision) {
  const crudo = process.env[nombre];
  if (crudo === undefined || crudo === '') return porOmision;
  const n = Number(crudo);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`${nombre}=${crudo} no es un número de dólares mayor que cero.`);
  }
  return n;
}

export const topeDe = (proveedor) =>
  numeroDelEntorno(VARIABLE_DEL_TOPE[proveedor], TOPES_POR_OMISION[proveedor]);

export const precioPorBusqueda = () => numeroDelEntorno('ANDAMIO_USD_POR_BUSQUEDA', 0.03);

/**
 * Lo que costó una respuesta de Claude, en dólares. `usage.input_tokens` NO incluye
 * lo que se leyó del caché ni lo que se escribió en él: cada cosa se cobra aparte,
 * la escritura a 1.25 veces la entrada y la lectura a una décima.
 */
export function costoDeClaude(modelo, usage) {
  const precio = PRECIOS[modelo] ?? PRECIO_SUPUESTO;
  const m = 1_000_000;
  return (
    ((usage.input_tokens ?? 0) * precio.entrada +
      (usage.cache_creation_input_tokens ?? 0) * precio.entrada * 1.25 +
      (usage.cache_read_input_tokens ?? 0) * precio.entrada * 0.1 +
      (usage.output_tokens ?? 0) * precio.salida) /
    m
  );
}

const vacio = () => ({
  claude: { usd: 0, llamadas: 0 },
  openai: { usd: 0, busquedas: 0 },
});

async function leer() {
  let texto;
  try {
    texto = await readFile(RUTA_DEL_GASTO, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return vacio();
    throw e;
  }
  try {
    const g = JSON.parse(texto);
    return {
      claude: { ...vacio().claude, ...g.claude },
      openai: { ...vacio().openai, ...g.openai },
    };
  } catch {
    // Seguir con el contador en cero sería gastar sin tope justo cuando algo está
    // roto. Se para y se dice qué hacer.
    throw new TopeAlcanzado(
      `${RUTA_DEL_GASTO} está ilegible. Si sabes cuánto llevas gastado, corrígelo a mano; ` +
        'si no, bórralo y se empieza a contar de cero.',
    );
  }
}

async function escribir(g) {
  await mkdir(dirname(RUTA_DEL_GASTO), { recursive: true });
  await writeFile(
    RUTA_DEL_GASTO,
    JSON.stringify({ ...g, actualizado: new Date().toISOString() }, null, 2) + '\n',
    'utf8',
  );
}

export async function gastado() {
  return leer();
}

/** Lanza `TopeAlcanzado` si el proveedor ya llegó a su tope. Se llama ANTES de cada llamada. */
export async function comprobarTope(proveedor) {
  const g = await leer();
  const tope = topeDe(proveedor);
  if (g[proveedor].usd >= tope) {
    throw new TopeAlcanzado(
      `Tope de ${NOMBRE[proveedor]} alcanzado: $${g[proveedor].usd.toFixed(2)} gastados de $${tope.toFixed(2)}. ` +
        `No se hace ninguna llamada más. Sube ${VARIABLE_DEL_TOPE[proveedor]} o borra ${RUTA_DEL_GASTO} para seguir.`,
    );
  }
}

/** Suma lo que costó una llamada y devuelve lo acumulado. */
export async function anotar(proveedor, usd, cantidad = 1) {
  const g = await leer();
  g[proveedor].usd += usd;
  if (proveedor === 'claude') g.claude.llamadas += cantidad;
  else g.openai.busquedas += cantidad;
  await escribir(g);
  return { acumulado: g[proveedor].usd, tope: topeDe(proveedor) };
}

/**
 * Las dos líneas que se imprimen al final de una corrida. Sólo muestra: si el
 * archivo está roto lo dice en vez de lanzar, porque a esas alturas ya no hay
 * nada que parar y una traza de error taparía el resumen que se vino a leer.
 */
export async function resumenDelGasto() {
  let g;
  try {
    g = await leer();
  } catch (e) {
    return `  (no se pudo leer el gasto: ${e.message})`;
  }
  return [
    `  Anthropic: $${g.claude.usd.toFixed(3)} de $${topeDe('claude').toFixed(2)} (${g.claude.llamadas} llamadas)`,
    `  OpenAI:    $${g.openai.usd.toFixed(3)} de $${topeDe('openai').toFixed(2)} (${g.openai.busquedas} búsquedas, estimado)`,
  ].join('\n');
}
