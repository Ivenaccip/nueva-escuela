// Arma `src/contenido/catalogo.ts`: la lista de temas que la app puede abrir.
//
// Metro empaqueta lo que ve escrito, así que no hay forma de cargar una carpeta
// entera. Este script escribe los `import` uno por uno, y de paso decide qué temas
// entran: sólo los que se pueden recorrer completos. La regla vive en `admision.mjs`
// (la comparte `tanda.mjs`): seis estaciones, y las 3 y 4 pueden venir del caso
// `X3-teclado` si es contestable (`teclado.mjs`).
//
//   node contenido/indexar.mjs           # reescribe el catálogo
//   node contenido/indexar.mjs --revisar # sólo dice qué entra y qué no, sin escribir
//
// Se corre después de generar temas nuevos. El archivo que escribe se sube al
// repo: la app no lo calcula al arrancar.

import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { motivoDeExclusion } from './admision.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const dirTemas = join(aqui, 'temas');
const dirTemarios = join(aqui, 'temarios');
const salida = join(aqui, '..', 'src', 'contenido', 'catalogo.ts');

const soloRevisar = process.argv.includes('--revisar');

/** El orden en que aparecen las pestañas de materia. */
const MATERIAS = ['matematicas', 'biologia', 'quimica', 'fisica'];

const temarios = {};
const admitidos = [];
const excluidos = [];

for (const materia of MATERIAS) {
  let temario;
  try {
    temario = JSON.parse(await readFile(join(dirTemarios, `${materia}.json`), 'utf8'));
  } catch {
    continue;
  }
  temarios[materia] = temario;

  const archivos = (await readdir(dirTemas))
    .filter((nombre) => new RegExp(`^${materia}-\\d+\\.json$`).test(nombre))
    .sort((a, b) => parseInt(a.split('-')[1], 10) - parseInt(b.split('-')[1], 10));

  for (const archivo of archivos) {
    const tema = JSON.parse(await readFile(join(dirTemas, archivo), 'utf8'));
    const motivo = motivoDeExclusion(tema);
    const numero = tema.temaNumero;
    if (!temario.temas.some((t) => t.numero === numero)) {
      excluidos.push({ materia, numero, motivo: 'no está en el temario' });
    } else if (motivo) {
      excluidos.push({ materia, numero, motivo });
    } else {
      admitidos.push({ materia, numero, archivo });
    }
  }
}

for (const materia of MATERIAS) {
  const a = admitidos.filter((t) => t.materia === materia);
  const e = excluidos.filter((t) => t.materia === materia);
  if (a.length === 0 && e.length === 0) continue;
  console.log(`${materia}: ${a.length} entran, ${e.length} no`);
  for (const x of e) console.log(`   · tema ${x.numero}: ${x.motivo}`);
}

if (soloRevisar) process.exit(0);

const identificador = (t) => `${t.materia}_${t.numero}`;

const lineas = [];
lineas.push('// GENERADO por `node contenido/indexar.mjs`. No se edita a mano.');
lineas.push('//');
lineas.push('// Los temas que la app puede abrir: seis estaciones (la 3 y la 4 pueden venir del');
lineas.push('// caso `X3-teclado`), y ninguna con `noSePuede` lleno salvo la 1, que sin video se');
lineas.push('// publica igual. Para meter uno nuevo, se genera su JSON en `contenido/temas/` y');
lineas.push('// se vuelve a correr el script.');
lineas.push('');
lineas.push("import type { Materia, TemaRedactado } from './autoria';");
lineas.push('');

// Sólo las materias con algún tema abrible: un temario sin temas pesa en el
// bundle y nadie lo lee.
const conTemas = MATERIAS.filter((m) => temarios[m] && admitidos.some((t) => t.materia === m));

for (const materia of conTemas) {
  lineas.push(`import temario_${materia} from '../../contenido/temarios/${materia}.json';`);
}
lineas.push('');
for (const t of admitidos) {
  lineas.push(`import ${identificador(t)} from '../../contenido/temas/${t.archivo}';`);
}

lineas.push('');
lineas.push('/** Lo que el temario sabe de un tema y la IA no repite. */');
lineas.push('export type EntradaDelTemario = {');
lineas.push('  numero: number;');
lineas.push('  titulo: string;');
lineas.push('  familia: string;');
lineas.push('  quedaSabiendo: string;');
lineas.push('};');
lineas.push('');
lineas.push('export type MateriaDelCatalogo = {');
lineas.push('  /** Como se lee en pantalla: "Matemáticas". */');
lineas.push('  nombre: string;');
lineas.push('  /** Cuántos temas tiene el temario entero, los abribles y los que no. */');
lineas.push('  totalTemas: number;');
lineas.push('  temario: EntradaDelTemario[];');
lineas.push('  /** Sólo los que se pueden recorrer completos. */');
lineas.push('  redactados: TemaRedactado[];');
lineas.push('};');
lineas.push('');
lineas.push('export const CATALOGO: Partial<Record<Materia, MateriaDelCatalogo>> = {');
for (const materia of conTemas) {
  const propios = admitidos.filter((t) => t.materia === materia);
  lineas.push(`  ${materia}: {`);
  lineas.push(`    nombre: temario_${materia}.nombre,`);
  lineas.push(`    totalTemas: temario_${materia}.totalTemas,`);
  lineas.push(`    temario: temario_${materia}.temas as unknown as EntradaDelTemario[],`);
  lineas.push('    redactados: [');
  for (const t of propios) {
    lineas.push(`      ${identificador(t)} as unknown as TemaRedactado,`);
  }
  lineas.push('    ],');
  lineas.push('  },');
}
lineas.push('};');
lineas.push('');

await writeFile(salida, lineas.join('\n'));
console.log(`\nEscrito ${salida.replace(join(aqui, '..') + '/', '')}: ${admitidos.length} temas.`);
