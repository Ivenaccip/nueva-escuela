// Corre una tanda de temas llamando a generar.mjs una vez por tema.
//
//   node contenido/tanda.mjs matematicas 1 20 --sondeo   SOLO el canon: 1 llamada por tema
//   node contenido/tanda.mjs matematicas 1 20            los 20 temas completos
//   node contenido/tanda.mjs matematicas 1 20 --seco     sin API, revisa los prompts de los 20
//   node contenido/tanda.mjs matematicas 1 20 --rehacer  tira lo guardado y de cero
//
// Por que un proceso hijo por tema y no un bucle dentro de generar.mjs: generar.mjs
// resuelve materia y numero en constantes de modulo y sale con process.exit en seis
// sitios. Un bucle dentro obligaria a reescribirlo entero; un hijo por tema respeta
// tal cual su reanudacion por archivo y convierte cada tema en un codigo de salida.
//
// Las llaves NO pasan por aqui: el hijo hereda el entorno y su stdio va directo a la
// consola, asi que este archivo nunca ve ni imprime ni guarda una llave. Lo unico que
// lee del hijo es su codigo de salida y el JSON del tema.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ESTACIONES, motivoDeExclusion } from './admision.mjs';
import { CODIGO_DE_TOPE, resumenDelGasto } from './gasto.mjs';
import { resultadoSinCifra } from './forma.mjs';
import { llaveDeAnthropic } from './llaves.mjs';
import { CLAVE_X3, casoDelCanon, noSePuedeVigente } from './teclado.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = dirname(aqui);
const dirTemas = join(aqui, 'temas');
const generar = join(aqui, 'generar.mjs');

// Nadie en el repo leia `.env`, asi que las llaves que `.env.ejemplo` manda poner ahi
// no llegaban al proceso y la salida era «Falta ANTHROPIC_API_KEY». Node 20.12+ trae
// process.loadEnvFile, sin dependencia. Lo que ya viene en el entorno gana: esto no
// pisa una llave exportada a mano.
try {
  const antes = { ...process.env };
  process.loadEnvFile(join(raiz, '.env'));
  for (const clave of Object.keys(antes)) if (antes[clave]) process.env[clave] = antes[clave];
} catch {
  // Sin .env no pasa nada: las llaves pueden venir exportadas en el shell.
}

const MATERIAS = ['matematicas', 'biologia', 'fisica', 'quimica'];

/** Lo que cada caso aparte sustituye. Espeja el ruteo de generar.mjs y CONTRATO.md §3. */
const REEMPLAZA = {
  'X1-tabla': ['contacto', 'completar', 'escalera', 'error'],
  'X2-figura': ['completar', 'escalera'],
  [CLAVE_X3]: ['completar', 'escalera'],
};

const PAUSA_OK = 1500; // entre temas que salieron, para no pegarle al limite de tasa
const PAUSA_MAL = 20000; // despues de un tema que fallo: casi siempre es 429 o 529
const REINTENTOS_TEMA = 2;

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const decir = (m) => console.log(m);

// ---------------------------------------------------------------------------
// Argumentos
// ---------------------------------------------------------------------------

const argumentos = process.argv.slice(2);

// Una llave nunca va en la linea de comandos: queda en el historial de PowerShell y
// la ve cualquier proceso que liste argumentos. Se corta aqui en vez de ignorarla en
// silencio, que es lo que invita a volver a teclearla.
const sospechosa = argumentos.find((a) => /^(sk-|sk_)/i.test(a) || /(api[-_]?key|token)=/i.test(a));
if (sospechosa) {
  console.error(
    '\nEso de la linea de comandos parece una llave, y una llave en argv queda en el\n' +
      'historial del shell y a la vista de cualquier proceso. Exportala en el entorno:\n' +
      '  $env:ANTHROPIC_API_KEY = "..."   ;  $env:OPENAI_API_KEY = "..."\n' +
      'y vuelve a correr esto sin ese argumento.',
  );
  process.exit(1);
}

const banderas = new Set(argumentos.filter((a) => a.startsWith('--')));
const sueltos = argumentos.filter((a) => !a.startsWith('--'));
const [materia, desdeCrudo, hastaCrudo] = sueltos;
const desde = Number(desdeCrudo);
const hasta = hastaCrudo === undefined ? desde : Number(hastaCrudo);

if (!MATERIAS.includes(materia) || !Number.isInteger(desde) || !Number.isInteger(hasta)) {
  console.error(
    'Uso: node contenido/tanda.mjs <materia> <desde> [hasta] [--sondeo] [--seco] [--rehacer]\n' +
      `  materia: ${MATERIAS.join(' | ')}\n` +
      '  --sondeo:  solo el canon de cada tema (1 llamada en vez de 7). Dice a que prompt\n' +
      '             va a rutear cada tema ANTES de pagar las seis estaciones.\n' +
      '  --seco:    sin API, revisa los placeholders de todos los temas del rango\n' +
      '  --rehacer: tira lo guardado y empieza de cero',
  );
  process.exit(1);
}

const sondeo = banderas.has('--sondeo');
const seco = banderas.has('--seco');
const rehacer = banderas.has('--rehacer');

// Se comprueban aqui, antes de parir veinte hijos que impriman veinte veces el
// mismo reclamo. El sondeo no busca videos, asi que no pide la de OpenAI.
if (!seco) {
  const hacenFalta = [
    ...(llaveDeAnthropic() ? [] : ['ANDAMIO_ANTHROPIC_API_KEY']),
    ...(sondeo || process.env.OPENAI_API_KEY ? [] : ['OPENAI_API_KEY']),
  ];
  if (hacenFalta.length) {
    console.error(
      [
        '',
        `Falta ${hacenFalta.join(' y ')} en ${join(raiz, '.env')}.`,
        '',
        ...hacenFalta.map((n) => `    ${n}=pega-aqui-la-llave`),
        '',
        'Ese archivo lo ignora git y este script lo carga solo. No se mando nada.',
      ].join('\n'),
    );
    process.exit(1);
  }
}

const temario = JSON.parse(await readFile(join(aqui, 'temarios', `${materia}.json`), 'utf8'));
const numeros = [];
for (let n = desde; n <= hasta; n += 1) {
  if (temario.temas.some((t) => t.numero === n)) numeros.push(n);
  else console.error(`  aviso: no hay tema ${n} en ${materia}.json, se salta`);
}
if (numeros.length === 0) {
  console.error('Ningun tema del rango existe en el temario.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Estado de la tanda, para reanudar
// ---------------------------------------------------------------------------

const rutaEstado = join(dirTemas, `_tanda-${materia}.json`);

const leerEstado = async () => {
  if (rehacer) return {};
  try {
    return JSON.parse(await readFile(rutaEstado, 'utf8')).temas ?? {};
  } catch {
    return {};
  }
};

const guardarEstado = async (estado) => {
  await mkdir(dirTemas, { recursive: true });
  await writeFile(
    rutaEstado,
    JSON.stringify({ materia, actualizado: new Date().toISOString(), temas: estado }, null, 2) +
      '\n',
    'utf8',
  );
};

// ---------------------------------------------------------------------------
// Clasificar lo que quedo en el archivo del tema
// ---------------------------------------------------------------------------

/**
 * Seis estaciones o ninguna: `BarraEstacion` tiene TOTAL = 6 y `cierre.tsx` dibuja
 * seis nodos. Un tema ruteado a X1 o a X2 tiene 2 o 4, se puede guardar y NO se puede
 * pintar. Uno ruteado a X3 sí: sus estaciones 3 y 4 salen de `casosAparte`, y la
 * misma regla que usa `indexar.mjs` (`motivoDeExclusion`) dice si entra, para que
 * «se pinta» aquí y «entra al catálogo» allá nunca se contradigan.
 */
async function clasificar(numero) {
  let tema;
  try {
    tema = JSON.parse(await readFile(join(dirTemas, `${materia}-${numero}.json`), 'utf8'));
  } catch {
    return { estado: 'sin-archivo', hechas: 0, pintable: false };
  }

  const canon = tema.canon;
  if (!canon) return { estado: 'sin-canon', hechas: 0, pintable: false };

  const notacion = canon.notacion;
  const forma = canon.formaDeRespuesta;
  const caso = casoDelCanon(canon);
  const x3 = tema.casosAparte?.[CLAVE_X3] ?? null;
  const x3Entregado = Boolean(x3 && !x3.noSePuede);

  // Las dos que X3 sustituye cuentan como hechas cuando el caso está guardado y no dijo que no.
  const hechas = ESTACIONES.filter(
    (e) => tema[e] || (caso === CLAVE_X3 && x3Entregado && REEMPLAZA[CLAVE_X3].includes(e)),
  );
  const conNoSePuede = [
    ...(noSePuedeVigente(canon) ? ['canon'] : []),
    ...ESTACIONES.filter((c) => tema[c]?.noSePuede),
    ...(x3?.noSePuede ? [CLAVE_X3] : []),
  ];
  // La estacion 1 es la excepcion del contrato: sin video el tema si se publica.
  const bloquean = conNoSePuede.filter((c) => c !== 'ver');

  const base = {
    notacion,
    forma,
    caso,
    // El resultado es una frase aunque el canon se llame numerico: es por lo que fue a X3.
    sinCifra: resultadoSinCifra(canon),
    hechas: hechas.length,
    faltan: [
      ...ESTACIONES.filter((e) => !tema[e] && !(caso && REEMPLAZA[caso].includes(e))),
      ...(caso === CLAVE_X3 && !x3 ? [CLAVE_X3] : []),
    ],
    conNoSePuede,
  };

  if (noSePuedeVigente(canon)) return { ...base, estado: 'canon-dice-no', pintable: false };
  if (caso === 'X1-tabla' || caso === 'X2-figura') {
    return { ...base, estado: `ruteado-${caso}`, pintable: false };
  }
  if (caso === CLAVE_X3) {
    const motivo = motivoDeExclusion(tema);
    if (motivo === null) return { ...base, estado: 'x3-teclado', pintable: true };
    // Lo que sigue es lo mismo que le dice indexar.mjs a quien lo corre.
    const estado = motivo.startsWith('faltan estaciones')
      ? 'a-medias'
      : /noSePuede/.test(motivo)
        ? 'noSePuede'
        : 'x3-invalido';
    return { ...base, estado, motivo, pintable: false };
  }
  if (hechas.length < 6) return { ...base, estado: 'a-medias', pintable: false };
  if (bloquean.length > 0) return { ...base, estado: 'noSePuede', pintable: false };
  return { ...base, estado: 'completo', pintable: true };
}

// ---------------------------------------------------------------------------
// Un tema = un proceso hijo
// ---------------------------------------------------------------------------

function correrTema(numero) {
  const args = [generar, materia, String(numero)];
  if (sondeo) args.push('--solo', 'canon');
  if (seco) args.push('--seco');
  if (rehacer) args.push('--rehacer');

  return new Promise((resolver) => {
    // stdio heredado: lo que el hijo imprime va directo a la consola y esta tanda no
    // lo copia a ningun lado. Nada que el hijo escriba pasa por aqui.
    const hijo = spawn(process.execPath, args, { stdio: 'inherit', env: process.env });
    hijo.on('error', (e) => resolver({ codigo: -1, porQue: e.message }));
    hijo.on('close', (codigo, senal) => resolver({ codigo: codigo ?? -1, senal }));
  });
}

// ---------------------------------------------------------------------------
// La tanda
// ---------------------------------------------------------------------------

const estado = await leerEstado();

decir(
  `\n${temario.nombre} · temas ${numeros[0]} a ${numeros[numeros.length - 1]} · ${numeros.length} en total` +
    (sondeo ? '\nSONDEO: solo el canon de cada tema. Nada de estaciones.' : '') +
    (seco ? '\nSECO: nada se manda y nada se guarda.' : ''),
);

let cortado = false;
let topeAlcanzado = false;
process.on('SIGINT', () => {
  cortado = true;
  console.error('\nCtrl-C. Se termina el tema en curso y se guarda el estado.');
});

for (const [i, numero] of numeros.entries()) {
  if (cortado) break;

  const tema = temario.temas.find((t) => t.numero === numero);
  const previo = estado[numero];

  // Reanudar: un tema ya resuelto no se vuelve a pedir. Uno ruteado a tabla o figura
  // tampoco: volver a correrlo gasta las mismas dos llamadas y da el mismo resultado.
  // Uno ruteado a X3 sí se retoma: ese caso ahora se genera de verdad, y un estado
  // `ruteado-X3-teclado` guardado por una tanda anterior quiere decir que falta.
  if (!seco && !rehacer && previo && (previo.pintable || /^ruteado-X[12]-/.test(previo.estado))) {
    decir(`\n[${i + 1}/${numeros.length}] tema ${numero} · ${tema.titulo} — ya estaba (${previo.estado})`);
    continue;
  }

  decir(`\n[${i + 1}/${numeros.length}] tema ${numero} · ${tema.titulo}`);

  // En sondeo el hijo sale con 1 a proposito: le faltan las seis estaciones porque
  // nunca se le pidieron. Lo que dice si el sondeo sirvio es que el canon quedo
  // guardado, no el codigo de salida.
  const salioBien = (r) => (sondeo ? true : r.codigo === 0);

  let resultado;
  for (let intento = 1; intento <= (seco ? 1 : REINTENTOS_TEMA); intento += 1) {
    resultado = await correrTema(numero);
    if (salioBien(resultado)) break;
    // El tope es de toda la corrida: ni se reintenta este tema ni se sigue con otro.
    if (resultado.codigo === CODIGO_DE_TOPE) break;
    if (intento < (seco ? 1 : REINTENTOS_TEMA)) {
      // El hijo reanuda desde su propio archivo, asi que un reintento solo vuelve a
      // pedir lo que falta. La espera larga es para el 429 y el 529, que son la causa
      // normal de que un tema se caiga a la mitad.
      console.error(`  el tema salio con ${resultado.codigo}. Se espera y se retoma.`);
      await dormir(PAUSA_MAL);
    }
  }

  if (seco) {
    estado[numero] = { estado: resultado.codigo === 0 ? 'seco-ok' : 'seco-roto', pintable: false };
  } else {
    estado[numero] = { ...(await clasificar(numero)), salida: resultado.codigo, cuando: new Date().toISOString() };
    await guardarEstado(estado);
  }

  if (resultado.codigo === CODIGO_DE_TOPE) {
    topeAlcanzado = true;
    break;
  }

  if (!cortado && i < numeros.length - 1) await dormir(salioBien(resultado) ? PAUSA_OK : PAUSA_MAL);
}

if (!seco) await guardarEstado(estado);

// ---------------------------------------------------------------------------
// El resumen, que es lo unico que se lee al dia siguiente
// ---------------------------------------------------------------------------

decir('\n' + '-'.repeat(78));
decir(`${temario.nombre} · resumen de la tanda`);
decir('-'.repeat(78));
if (!seco) {
  decir('Gasto acumulado:');
  decir(await resumenDelGasto());
  if (topeAlcanzado) {
    decir('\n  PARADA POR EL TOPE DE GASTO. Los temas que siguen no se corrieron.');
    decir('  Sube el tope en .env o borra contenido/temas/_gasto.json para seguir.\n');
  }
}

const filas = numeros.map((n) => ({ n, t: temario.temas.find((x) => x.numero === n), e: estado[n] }));

for (const { n, t, e } of filas) {
  if (!e) {
    decir(`  ${String(n).padStart(3)}  ${'no se corrio'.padEnd(22)} ${t.titulo}`);
    continue;
  }
  // En sondeo las seis estaciones no se pidieron nunca, asi que contar cuantas
  // faltan no dice nada y asusta de balde: lo que se sondeo es el RUTEO.
  // X3 se genera y se pinta: no es un caso «aparte» en el sentido de que falte UI.
  const sinUI = e.estado === 'canon-dice-no' || (e.caso && e.caso !== CLAVE_X3);
  const marca = seco
    ? ''
    : sondeo
      ? !e.notacion
        ? 'SIN CANON'
        : sinUI
          ? 'CASO APARTE'
          : e.caso === CLAVE_X3
            ? 'X3 TECLADO'
            : 'CAMINO NORMAL'
      : e.pintable
        ? 'SE PINTA'
        : 'NO SE PINTA';
  const detalle = [
    e.notacion ? `${e.notacion}/${e.forma}` : null,
    sondeo ? (e.caso ? `va a ${e.caso}${e.sinCifra ? ' (su resultado no tiene cifra)' : ''}` : null) : null,
    sondeo || e.hechas === undefined ? null : `${e.hechas}/6 estaciones`,
    sondeo || !(e.faltan && e.faltan.length) ? null : `faltan ${e.faltan.join(',')}`,
    e.conNoSePuede && e.conNoSePuede.length ? `noSePuede en ${e.conNoSePuede.join(',')}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const estado = sondeo ? (e.notacion ? 'canon listo' : e.estado) : e.estado;
  decir(`  ${String(n).padStart(3)}  ${marca.padEnd(13)} ${estado.padEnd(18)} ${t.titulo}`);
  if (detalle) decir(`       ${detalle}`);
}

const pintables = filas.filter((f) => f.e && f.e.pintable);
const pintablesPorX3 = pintables.filter((f) => f.e.caso === CLAVE_X3);
const ruteados = filas.filter((f) => f.e && String(f.e.estado).startsWith('ruteado-'));
const aMedias = filas.filter((f) => f.e && (f.e.estado === 'a-medias' || f.e.estado === 'sin-canon' || f.e.estado === 'sin-archivo'));
const negados = filas.filter((f) => f.e && (f.e.estado === 'canon-dice-no' || f.e.estado === 'noSePuede'));
const invalidos = filas.filter((f) => f.e && f.e.estado === 'x3-invalido');

decir('\n' + '-'.repeat(78));
if (seco) {
  const rotos = filas.filter((f) => f.e && f.e.estado === 'seco-roto');
  decir(`  prompts revisados: ${numeros.length}, con placeholders sin resolver: ${rotos.length}`);
  decir('-'.repeat(78) + '\n');
  process.exit(rotos.length === 0 ? 0 : 1);
}

// El sondeo no cuenta estaciones: contesta a cuantos temas les falta UI antes de
// pagarla. Es la unica pregunta que importa antes de soltar la tanda entera.
if (sondeo) {
  const conCanon = filas.filter((f) => f.e && f.e.notacion);
  const sinUI = conCanon.filter(
    (f) => f.e.estado === 'canon-dice-no' || (f.e.caso && f.e.caso !== CLAVE_X3),
  );
  const aX3 = conCanon.filter((f) => f.e.caso === CLAVE_X3 && f.e.estado !== 'canon-dice-no');
  decir(`  canon obtenido: ${conCanon.length} de ${numeros.length}`);
  decir(`  van al camino normal y se van a poder pintar: ${conCanon.length - sinUI.length - aX3.length}`);
  decir(`  van a ${CLAVE_X3}, que se genera y se pinta (teclado propio): ${aX3.length}`);
  for (const f of aX3) {
    const porQue = f.e.sinCifra ? ' (el resultado del ejemplo no tiene cifra)' : '';
    decir(`      ${String(f.n).padStart(3)} ${f.e.notacion}/${f.e.forma}${porQue}  ${f.t.titulo}`);
  }
  decir(`  van a un caso aparte sin UI (tabla, figura) o el canon los niega: ${sinUI.length}`);
  for (const f of sinUI) {
    decir(`      ${String(f.n).padStart(3)} ${f.e.notacion}/${f.e.forma} -> ${f.e.caso ?? 'noSePuede'}  ${f.t.titulo}`);
  }
  decir('\n  Genera la tanda completa de los del camino normal y de los de X3. Los de tabla y');
  decir('  figura se pagarian igual y la app no los puede abrir (CONTRATO.md §5).');
  decir('-'.repeat(78) + '\n');
  process.exit(topeAlcanzado ? CODIGO_DE_TOPE : 0);
}
decir(`  se pintan hoy, con sus seis estaciones: ${pintables.length} de ${numeros.length}`);
if (pintablesPorX3.length) {
  decir(`      de ellos, con teclado propio (${CLAVE_X3}): temas ${pintablesPorX3.map((f) => f.n).join(', ')}`);
}
if (ruteados.length) {
  const porCaso = {};
  for (const f of ruteados) (porCaso[f.e.caso] ??= []).push(f.n);
  decir(`  ruteados a un caso aparte, pagados y NO pintables: ${ruteados.length}`);
  for (const [caso, ns] of Object.entries(porCaso)) decir(`      ${caso}: temas ${ns.join(', ')}`);
  decir('      Falta codigo de UI, no contenido (CONTRATO.md §5).');
}
if (negados.length) decir(`  con noSePuede que bloquea: ${negados.map((f) => f.n).join(', ')}`);
if (invalidos.length) {
  decir(`  con ${CLAVE_X3} que no se puede contestar, no se pintan: ${invalidos.map((f) => f.n).join(', ')}`);
  for (const f of invalidos) decir(`      ${String(f.n).padStart(3)} ${f.e.motivo}`);
}
if (aMedias.length) decir(`  a medias, vuelve a correr la tanda para retomar: ${aMedias.map((f) => f.n).join(', ')}`);
decir(`  estado de la tanda: ${rutaEstado}`);
decir('-'.repeat(78) + '\n');

// Salir con 1 mientras no esten los 20 pintables: asi un `if ($?)` no da por buena
// una tanda que dejo 12 temas que la app no puede abrir.
process.exit(topeAlcanzado ? CODIGO_DE_TOPE : pintables.length === numeros.length ? 0 : 1);
