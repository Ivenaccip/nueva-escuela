// Qué temas puede abrir la app. Lo usan `indexar.mjs` (para escribir el catálogo) y
// `tanda.mjs` (para decir si un tema recién generado «se pinta»): que los dos
// contesten lo mismo es lo único que importa, así que la regla vive en un solo sitio.

import {
  CLAVE_X3,
  casoDeTeclado,
  casoDelCanon,
  noSePuedeVigente,
  problemasDeTeclado,
} from './teclado.mjs';

/** Las seis estaciones, en el orden del círculo. */
export const ESTACIONES = ['ver', 'contacto', 'completar', 'escalera', 'error', 'explicar'];

/** De cuántos escalones tiene que ser la estación 4 (el esquema de X3 pide de 3 a 5). */
const MIN_ESCALONES = 3;

/**
 * Por qué un tema no se puede abrir, o `null` si se puede.
 *
 * La estación 1 puede traer `noSePuede` lleno y el tema sí se publica: sin video la
 * tarjeta se queda vacía, pero `pregunta` y `resumen` están escritos. En las otras
 * cinco, un `noSePuede` lleno quiere decir que el ejercicio no se puede dibujar, y
 * son seis estaciones o ninguna (`CONTRATO.md` §6).
 *
 * Las estaciones 3 y 4 pueden venir de dos lados. Casi siempre son `completar` y
 * `escalera`; en un tema ruteado a X3 son `casosAparte['X3-teclado']` y esos dos
 * campos quedan en `null`. La app hace lo mismo (`src/contenido/teclado.ts`): si el
 * caso trae `noSePuede` en `null` y sus dos estaciones, las usa en vez de las normales.
 */
export function motivoDeExclusion(tema) {
  if (noSePuedeVigente(tema.canon)) return 'el canon trae noSePuede lleno';

  const x3 = casoDeTeclado(tema);
  const normales = Boolean(tema.completar && tema.escalera);
  if (x3?.noSePuede && !normales) {
    return `el caso ${CLAVE_X3} trae noSePuede lleno: ${x3.noSePuede.que}`;
  }

  // Lo mismo que decide la app para servir el caso en lugar de las dos normales.
  const x3Sirve = Boolean(
    x3 && !x3.noSePuede && x3.completar && Array.isArray(x3.escalera) && x3.escalera.length > 0,
  );
  const sustituidas = x3Sirve ? ['completar', 'escalera'] : [];

  // Un tema que el canon manda a X3 y todavía no lo tiene: lo que falta es el caso, no
  // «completar y escalera», que nunca se van a generar.
  const faltaElCaso = !x3 && !normales && casoDelCanon(tema.canon) === CLAVE_X3;
  const faltan = ESTACIONES.filter(
    (clave) =>
      !tema[clave] &&
      !sustituidas.includes(clave) &&
      !(faltaElCaso && (clave === 'completar' || clave === 'escalera')),
  );
  if (faltaElCaso) faltan.push(CLAVE_X3);
  if (faltan.length > 0) return `faltan estaciones: ${faltan.join(', ')}`;

  const llenas = ESTACIONES.filter(
    (clave) => clave !== 'ver' && !sustituidas.includes(clave) && tema[clave]?.noSePuede,
  );
  if (llenas.length > 0) return `noSePuede lleno en: ${llenas.join(', ')}`;

  // El caso que la app va a servir tiene que estar entero y ser contestable.
  if (x3Sirve) {
    const problemas = [];
    if (x3.escalera.length < MIN_ESCALONES) {
      problemas.push(`escalera: hay ${x3.escalera.length} escalones y tienen que ser al menos ${MIN_ESCALONES}`);
    }
    problemas.push(...problemasDeTeclado(x3));
    if (problemas.length > 0) {
      const resto = problemas.length > 1 ? ` (y ${problemas.length - 1} más)` : '';
      return `el caso ${CLAVE_X3} no se puede contestar: ${problemas[0]}${resto}`;
    }
  }
  return null;
}
