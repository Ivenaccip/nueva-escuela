// Cada esquema se manda a la API tal cual, como input_schema de una herramienta,
// y ahi no hay forma de resolver un $ref que apunte a otro archivo. Por eso los
// atomos viven una sola vez en partes.json y este script los copia dentro de
// cada esquema: los $ref internos (#/$defs/...) si funcionan en la llamada.
//
//   node contenido/esquema/armar.mjs           revisa que todos esten al dia
//   node contenido/esquema/armar.mjs --escribir  los actualiza
//
// Un esquema de estacion se escribe SIN $defs y con $ref a #/$defs/renglon,
// #/$defs/parteMat, #/$defs/tecleado o #/$defs/noSePuede. Este script le pega
// el bloque $defs al final. Si el esquema ya trae $defs, se reemplaza.

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const escribir = process.argv.includes('--escribir');

const { $defs } = JSON.parse(await readFile(join(aqui, 'partes.json'), 'utf8'));

const esquemas = (await readdir(aqui)).filter((n) => n.endsWith('.schema.json'));
let desfasados = 0;

for (const nombre of esquemas) {
  const ruta = join(aqui, nombre);
  const antes = await readFile(ruta, 'utf8');
  const esquema = JSON.parse(antes);
  esquema.$defs = $defs;
  const despues = JSON.stringify(esquema, null, 2) + '\n';

  if (antes === despues) continue;
  desfasados += 1;
  if (escribir) {
    await writeFile(ruta, despues, 'utf8');
    console.log(`actualizado  ${nombre}`);
  } else {
    console.log(`desfasado    ${nombre}`);
  }
}

if (!escribir && desfasados > 0) {
  console.error(`\n${desfasados} esquema(s) sin los atomos al dia. Corre: node contenido/esquema/armar.mjs --escribir`);
  process.exit(1);
}
if (desfasados === 0) console.log(`${esquemas.length} esquema(s) al dia.`);
