// Revisa los temas ya generados sin llamar a nadie.
//
// El esquema dice si la forma está bien. Esto dice si el contenido sirve: son las
// cosas que validan perfecto y aun así dejan un ejercicio que no se puede contestar
// o una pista que regala la respuesta.
//
//   node contenido/auditar.mjs matematicas
//   node contenido/auditar.mjs matematicas 9

import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const dirTemas = join(aqui, 'temas');

const [materia, soloEste] = process.argv.slice(2);
if (!materia) {
  console.error('Uso: node contenido/auditar.mjs <materia> [numero]');
  process.exit(1);
}

/** El teclado de la estación 3 y 4: dígitos y diagonal, nada más. */
const TECLEABLE = /^[0-9]+(\/[0-9]+)?$/;

/**
 * Una pista que dice «cinco por uno es cinco» regala la respuesta igual que si
 * escribiera el 5, y buscando sólo dígitos no se caza.
 */
const EN_LETRAS = ['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez',
  'once','doce','trece','catorce','quince','dieciseis','diecisiete','dieciocho','diecinueve','veinte'];

const planos = (partes) =>
  (partes ?? [])
    .map((a) =>
      a.tipo === 'fraccion'
        ? `${a.arriba}/${a.abajo}`
        : a.tipo === 'hueco'
          ? '[]'
          : a.tipo === 'simbolo'
            ? `${a.valor}${a.sub ?? ''}${a.sup ?? ''}`
            : (a.valor ?? ''),
    )
    .join(' ');

/** Cada regla devuelve un aviso o null. Ninguna mira la forma: de eso ya se ocupó ajv. */
const REGLAS = [
  {
    clave: 'pista regala la respuesta',
    mira: (t) => {
      const avisos = [];
      const revisar = (respuesta, pistas, donde) => {
        const r = respuesta?.tecleado;
        if (!r) return;
        const cifras = [r, ...String(r).split('/')].filter((x) => x.length > 1 || Number(x) > 9);
        const letras = [r, ...String(r).split('/')]
          .map((x) => EN_LETRAS[Number(x)])
          .filter(Boolean);
        const partes = [...cifras, ...letras];
        for (const p of pistas ?? []) {
          const texto = (p.texto ?? p).toLowerCase();
          if (partes.some((n) => new RegExp(`\\b${n}\\b`).test(texto))) {
            avisos.push(`${donde}: la pista ${p.orden ?? '?'} trae el número de la respuesta (${r})`);
          }
        }
      };
      revisar(t.completar?.respuesta, t.completar?.pistas, 'completar');
      (t.escalera?.escalones ?? []).forEach((e, i) =>
        revisar(e.respuesta, e.pistas, `escalera escalón ${i + 1}`),
      );
      return avisos;
    },
  },
  {
    clave: 'respuesta que el teclado no escribe',
    mira: (t) => {
      const avisos = [];
      const ver = (r, donde) => {
        if (r?.tecleado && !TECLEABLE.test(r.tecleado)) {
          avisos.push(`${donde}: "${r.tecleado}" no se teclea con 1-9, 0 y /`);
        }
      };
      ver(t.completar?.respuesta, 'completar');
      (t.escalera?.escalones ?? []).forEach((e, i) => ver(e.respuesta, `escalera escalón ${i + 1}`));
      return avisos;
    },
  },
  {
    clave: 'el paso malo se delata solo',
    mira: (t) => {
      const pasos = t.error?.pasos ?? [];
      const malo = pasos.find((p) => p.numero === t.error?.pasoMalo);
      if (!malo) return [];
      const largo = (p) => planos(p.partes).length;
      const otros = pasos.filter((p) => p !== malo).map(largo);
      if (otros.length === 0) return [];
      const promedio = otros.reduce((a, b) => a + b, 0) / otros.length;
      const suyo = largo(malo);
      if (suyo < promedio * 0.5 || suyo > promedio * 1.8) {
        return [
          `error: el paso malo mide ${suyo} caracteres y los otros ${Math.round(promedio)} de promedio`,
        ];
      }
      return [];
    },
  },
  {
    clave: 'el arrastre no llega al final',
    mira: (t) => {
      if (!t.error) return [];
      const ultimo = t.error.pasos?.[t.error.pasos.length - 1];
      const malo = t.error.pasos?.find((p) => p.numero === t.error.pasoMalo);
      if (!ultimo || !malo || ultimo === malo) return [];
      const numerosDe = (p) => (planos(p.partes).match(/\d+/g) ?? []);
      const delMalo = numerosDe(malo);
      const delUltimo = numerosDe(ultimo);
      if (delMalo.length && delUltimo.length && !delUltimo.some((n) => delMalo.includes(n))) {
        return ['error: el último paso no comparte ningún número con el paso malo'];
      }
      return [];
    },
  },
  {
    clave: 'fracción escrita en línea',
    mira: (t) => {
      // AGENTS.md: «Las fracciones se escriben apiladas, con Fraccion o
      // Expresion, nunca como "3/5" en una línea». En los campos que son cadena
      // —la situación de la escalera, la pregunta, la aclaración— el modelo no
      // tiene átomos a mano y las escribe en línea. Se ve distinto al resto de
      // la app y enseña la notación equivocada.
      const avisos = [];
      const enLinea = /\b\d+\/\d+\b/;
      const caminar = (v, ruta) => {
        if (typeof v === 'string') {
          const m = enLinea.exec(v);
          // Una respuesta tecleada SÍ es "12/5": eso es lo que da el teclado.
          if (m && !/tecleado|aceptaTambien|comoSeLee|url|idDeYouTube/.test(ruta)) {
            avisos.push(`${ruta}: "${m[0]}" va en línea y debería ir apilada`);
          }
          return;
        }
        if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) caminar(x, `${ruta}.${k}`);
      };
      for (const clave of ['contacto', 'completar', 'escalera', 'error', 'explicar']) {
        if (t[clave]) caminar(t[clave], clave);
      }
      return avisos;
    },
  },
  {
    clave: 'la voz prohibida',
    mira: (t) => {
      const prohibido = /¡|excelente|muy bien|genial|es f[áa]cil|es sencillo|obviamente|simplemente|basta con/i;
      const avisos = [];
      const caminar = (v, ruta) => {
        if (typeof v === 'string') {
          const m = prohibido.exec(v);
          if (m) avisos.push(`${ruta}: "${m[0]}"`);
          return;
        }
        if (v && typeof v === 'object') {
          for (const [k, x] of Object.entries(v)) caminar(x, `${ruta}.${k}`);
        }
      };
      caminar(t, '');
      return avisos;
    },
  },
  {
    clave: 'texto con comillas o llaves sueltas',
    mira: (t) => {
      const avisos = [];
      const caminar = (v, ruta) => {
        if (typeof v === 'string') {
          if (/^["{[]|["}\]]$/.test(v.trim()) || v.includes('\\"')) {
            avisos.push(`${ruta}: termina o empieza con un signo de JSON suelto`);
          }
          return;
        }
        if (v && typeof v === 'object') {
          for (const [k, x] of Object.entries(v)) caminar(x, `${ruta}.${k}`);
        }
      };
      caminar(t, '');
      return avisos;
    },
  },
];

const archivos = (await readdir(dirTemas))
  .filter((f) => f.startsWith(`${materia}-`) && f.endsWith('.json'))
  .filter((f) => !soloEste || f === `${materia}-${soloEste}.json`)
  .sort((a, b) => Number(a.match(/-(\d+)\./)[1]) - Number(b.match(/-(\d+)\./)[1]));

let conAvisos = 0;
let total = 0;
for (const f of archivos) {
  const t = JSON.parse(await readFile(join(dirTemas, f), 'utf8'));
  const hechas = ['ver', 'contacto', 'completar', 'escalera', 'error', 'explicar'].filter(
    (c) => t[c],
  );
  const avisos = REGLAS.flatMap((r) => r.mira(t).map((a) => `${r.clave} · ${a}`));
  total += avisos.length;
  if (avisos.length) conAvisos += 1;
  const cabeza = `${String(t.temaNumero).padStart(3)}  ${hechas.length}/6  ${t.titulo}`;
  console.log(avisos.length ? `${cabeza}   (${avisos.length})` : cabeza);
  for (const a of avisos) console.log(`       ${a}`);
}

console.log(`\n${archivos.length} tema(s), ${conAvisos} con avisos, ${total} aviso(s) en total.`);
console.log('Ningún aviso es un error de forma: todos validaron contra su esquema.');
