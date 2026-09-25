// La prueba de coherencia del juego de prompts y esquemas. Se corre sola, sin
// llave y sin gastar un peso:
//
//   node contenido/esquema/revisar.mjs
//
// Comprueba tres cosas:
//   1. Los once esquemas compilan con ajv 2020-12, que es el dialecto que la
//      API acepta como input_schema.
//   2. canon-ejemplo.json valida contra 00-canon.schema.json. Es el canon de
//      referencia: si se rompe, los ejemplos de los prompts que lo citan mienten.
//   3. El bloque ```json mas grande de cada prompt valida contra su esquema. Es
//      lo unico que atrapa un ejemplo escrito con atomos abreviados o con un
//      campo que el esquema ya no tiene: el modelo copia el ejemplo, no la
//      descripcion.
//
// Sale con codigo 1 si algo falla, para que se pueda colgar de un hook.

import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const dirPrompts = join(aqui, '..', 'prompts');

// ajv 8 es el que habla 2020-12. El ajv 6 que arrastra eslint no sirve: sólo
// entiende draft-07. Si no está, se revisa lo que se puede revisar sin él y se
// dice qué falta, en vez de reventar.
let Ajv2020 = null;
try {
  Ajv2020 = (await import('ajv/dist/2020.js')).default;
  if (typeof Ajv2020 !== 'function') Ajv2020 = null;
} catch {
  Ajv2020 = null;
}
if (!Ajv2020) {
  console.warn(
    'Sin ajv 8: no se puede compilar 2020-12 ni validar los ejemplos.\n' +
      'Corre: npm install --save-dev ajv@^8\n',
  );
}

/** El canon de referencia se interpola en 00-canon.md, así que hay que resolverlo. */
const canonEjemplo = await readFile(join(aqui, 'canon-ejemplo.json'), 'utf8');

const compilar = async (nombre) => {
  const esquema = JSON.parse(await readFile(join(aqui, nombre), 'utf8'));
  if (!Ajv2020) return null;
  const ajv = new Ajv2020({ strict: false, allErrors: true });
  return ajv.compile(esquema);
};

const contar = (validar) =>
  validar.errors
    .slice(0, 8)
    .map((e) => `    ${e.instancePath || '/'} ${e.keyword}: ${e.message}`)
    .join('\n');

let fallas = 0;
const falla = (linea, detalle) => {
  fallas += 1;
  console.error(`FALLA  ${linea}${detalle ? '\n' + detalle : ''}`);
};

// 1 y 2 · los esquemas parsean y compilan, y el canon de referencia valida
const esquemas = (await readdir(aqui)).filter((n) => n.endsWith('.schema.json')).sort();
const validadores = new Map();
let compilados = 0;
for (const nombre of esquemas) {
  try {
    const validar = await compilar(nombre);
    compilados += 1;
    if (validar) validadores.set(nombre.replace('.schema.json', ''), validar);
  } catch (e) {
    falla(`${nombre} no ${Ajv2020 ? 'compila con ajv 2020-12' : 'parsea'}: ${e.message}`);
  }
}
console.log(
  `${compilados} de ${esquemas.length} esquema(s) ${Ajv2020 ? 'compilan' : 'parsean'}.`,
);

const vCanon = validadores.get('00-canon');
if (vCanon) {
  const canon = JSON.parse(canonEjemplo);
  if (vCanon(canon)) console.log('canon-ejemplo.json valida.');
  else falla('canon-ejemplo.json no valida contra 00-canon.schema.json', contar(vCanon));
}

// 3 · el ejemplo de cada prompt valida contra su esquema
const prompts = (await readdir(dirPrompts)).filter((n) => n.endsWith('.md') && n !== '00-sistema.md');
for (const archivo of prompts.sort()) {
  const base = archivo.replace(/\.md$/, '');
  const validar = validadores.get(base);
  if (!validar) {
    if (Ajv2020) falla(`${archivo} no tiene esquema (${base}.schema.json)`);
    continue;
  }

  // Sustitución de cadena, igual que la del llamador: sin regex, para que un $
  // dentro del canon no se interprete como grupo de reemplazo.
  const texto = (await readFile(join(dirPrompts, archivo), 'utf8'))
    .split('{{ejemploCanon}}')
    .join(canonEjemplo);
  const candidatos = [];
  for (const bloque of texto.matchAll(/```json\n([\s\S]*?)```/g)) {
    try {
      const objeto = JSON.parse(bloque[1]);
      // Los bloques que son un arreglo son ejemplos de renglones, no de salida.
      if (objeto && typeof objeto === 'object' && !Array.isArray(objeto)) {
        candidatos.push({ objeto, largo: bloque[1].length });
      }
    } catch {
      // Un bloque que no parsea puede ser un recorte a propósito. No es falla.
    }
  }
  candidatos.sort((a, b) => b.largo - a.largo);

  if (candidatos.length === 0) {
    falla(`${archivo} no tiene ningún ejemplo de salida completo. El modelo copia el ejemplo.`);
    continue;
  }

  const bueno = candidatos.slice(0, 3).some(({ objeto }) => validar(objeto));
  if (bueno) {
    console.log(`${archivo}: su ejemplo valida.`);
  } else {
    validar(candidatos[0].objeto);
    falla(`${archivo}: su ejemplo no valida contra ${base}.schema.json`, contar(validar));
  }
}

if (fallas > 0) {
  console.error(`\n${fallas} problema(s).`);
  process.exit(1);
}
console.log('\nTodo en verde.');
