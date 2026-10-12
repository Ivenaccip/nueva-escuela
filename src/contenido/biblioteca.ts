/**
 * Lo que la app sabe abrir: los temas del catálogo, con su contenido ya
 * barajado, y la forma de armar el `Tema` que las pantallas pintan.
 *
 * Sustituye a `actual.ts`. Aquel archivo fijaba un solo tema al cargar el módulo;
 * éste no guarda nada del estudiante: todo lo que cambia entra como argumento, y
 * por eso el estado vive aparte, en `src/estado`.
 */

import { adaptar, progresoInicial, type DelTemario, type Progreso } from './adaptar';
import type {
  CompletarRedactado,
  ContactoRedactado,
  ErrorRedactado,
  EscaleraRedactada,
  ExplicarRedactado,
  Materia,
  TemaRedactado,
  VerRedactado,
} from './autoria';
import { CATALOGO } from './catalogo';
import { mezclar } from './mezclar';
import { aplicarTeclado } from './teclado';
import { llaveDe, type ClaveEstacion, type Tema } from './tipos';

/**
 * Un tema con sus seis estaciones escritas. El catálogo sólo admite temas así
 * (`contenido/indexar.mjs`), y por eso aquí ninguna estación puede ser `null`:
 * las pantallas no necesitan preguntarlo seis veces.
 */
export type TemaJugable = TemaRedactado & {
  ver: VerRedactado;
  contacto: ContactoRedactado;
  completar: CompletarRedactado;
  escalera: EscaleraRedactada;
  error: ErrorRedactado;
  explicar: ExplicarRedactado;
};

export type TemaAbrible = {
  materia: Materia;
  numero: number;
  titulo: string;
  familia: string;
};

export type MateriaAbrible = {
  clave: Materia;
  nombre: string;
  /** Cuántos temas de esa materia se pueden abrir hoy. */
  abribles: number;
  /** Cuántos tiene el temario entero. */
  total: number;
};

/** Las materias que ya tienen algún tema abrible, en el orden del catálogo. */
export function materiasAbribles(): MateriaAbrible[] {
  return (Object.keys(CATALOGO) as Materia[]).map((clave) => {
    const m = CATALOGO[clave]!;
    return {
      clave,
      nombre: m.nombre,
      abribles: m.redactados.length,
      total: m.totalTemas,
    };
  });
}

/** Los temas abribles de una materia, en el orden del temario. */
export function temasDe(materia: Materia): TemaAbrible[] {
  const m = CATALOGO[materia];
  if (!m) return [];
  return m.redactados
    .map((t) => {
      const entrada = m.temario.find((x) => x.numero === t.temaNumero);
      return {
        materia,
        numero: t.temaNumero,
        titulo: entrada?.titulo ?? t.titulo,
        familia: entrada?.familia ?? '',
      };
    })
    .sort((a, b) => a.numero - b.numero);
}

/** El primer tema abrible del catálogo: con el que arranca quien no ha abierto ninguno. */
export function primerTema(): { materia: Materia; numero: number } | null {
  const materia = materiasAbribles()[0]?.clave;
  if (!materia) return null;
  const primero = temasDe(materia)[0];
  return primero ? { materia, numero: primero.numero } : null;
}

/** Barajar cuesta poco, pero no hay razón para repetirlo en cada render. */
const barajados = new Map<string, TemaJugable>();

/** El contenido redactado de un tema, ya barajado. `null` si no está en el catálogo. */
export function redactadoDe(materia: Materia, numero: number): TemaJugable | null {
  const llave = llaveDe(materia, numero);
  const guardado = barajados.get(llave);
  if (guardado) return guardado;

  const crudo = CATALOGO[materia]?.redactados.find((t) => t.temaNumero === numero);
  if (!crudo) return null;

  // Primero el teclado del tema (si trae uno), para que el barajado alcance a sus opciones.
  const listo = mezclar(aplicarTeclado(crudo)) as TemaJugable;
  barajados.set(llave, listo);
  return listo;
}

function delTemarioDe(materia: Materia, numero: number): DelTemario | null {
  const m = CATALOGO[materia];
  const entrada = m?.temario.find((t) => t.numero === numero);
  if (!m || !entrada) return null;
  return {
    indice: entrada.numero,
    total: m.totalTemas,
    familia: entrada.familia,
    quedaSabiendo: entrada.quedaSabiendo,
    materiaNombre: m.nombre,
  };
}

/** Arma el `Tema` que pintan las pantallas, con el avance que lleva el estudiante. */
export function armarTema(
  materia: Materia,
  numero: number,
  progreso: Progreso = progresoInicial,
): { tema: Tema; faltan: ClaveEstacion[] } | null {
  const redactado = redactadoDe(materia, numero);
  const delTemario = delTemarioDe(materia, numero);
  if (!redactado || !delTemario) return null;
  return adaptar(redactado, delTemario, progreso);
}
