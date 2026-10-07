/**
 * Baraja lo que el generador deja siempre en el mismo lugar.
 *
 * Medido sobre los nueve temas jugables: el motivo bueno de la estación 5 es el
 * primero en los nueve, y la opción correcta de la estación 2 es la A o la B en
 * 35 de 39 preguntas. Calificar tal cual premia al que elige siempre la primera,
 * y la estación 2 deja de ser una pregunta.
 *
 * Se baraja aquí, una sola vez, y no en la pantalla ni en el generador: ni el
 * modelo baraja de verdad, ni la pantalla debe saber cuál es la correcta. Es
 * determinista —la semilla sale del tema— para que un tema que se retoma mañana
 * muestre las opciones en el mismo orden que ayer.
 *
 * Las letras se reescriben en el orden nuevo. Ningún texto del contenido cita una
 * letra ni una posición («la opción B»), así que reordenar no rompe ninguno.
 */

import type { RespuestaTecleada, TemaRedactado } from './autoria';

const LETRAS = ['A', 'B', 'C', 'D'] as const;

/** FNV-1a: de un texto a un entero de 32 bits. */
function semillaDe(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32: un generador chico y repetible. Devuelve números en [0, 1). */
function generador(semilla: number): () => number {
  let a = semilla;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates sobre una copia: la lista original no se toca. */
function barajar<T>(lista: readonly T[], azar: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Con el teclado `opciones` la correcta también sale primero: se baraja igual. */
function barajarRespuesta(respuesta: RespuestaTecleada, semilla: string): RespuestaTecleada {
  if (!respuesta.opciones) return respuesta;
  return { ...respuesta, opciones: barajar(respuesta.opciones, generador(semillaDe(semilla))) };
}

/** Devuelve una copia del tema con las opciones y los motivos en otro orden. */
export function mezclar(tema: TemaRedactado): TemaRedactado {
  const base = `${tema.materia}-${tema.temaNumero}`;

  return {
    ...tema,
    contacto: tema.contacto && {
      ...tema.contacto,
      preguntas: tema.contacto.preguntas.map((pregunta, i) => ({
        ...pregunta,
        opciones: barajar(pregunta.opciones, generador(semillaDe(`${base}-contacto-${i}`))).map(
          (opcion, k) => ({ ...opcion, letra: LETRAS[k] }),
        ),
      })),
    },
    completar: tema.completar && {
      ...tema.completar,
      respuesta: barajarRespuesta(tema.completar.respuesta, `${base}-completar`),
    },
    escalera: tema.escalera && {
      ...tema.escalera,
      escalones: tema.escalera.escalones.map((escalon, i) => ({
        ...escalon,
        respuesta: barajarRespuesta(escalon.respuesta, `${base}-escalon-${i}`),
      })),
    },
    error: tema.error && {
      ...tema.error,
      motivos: barajar(tema.error.motivos, generador(semillaDe(`${base}-motivos`))),
    },
  };
}
