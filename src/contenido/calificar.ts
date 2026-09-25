/**
 * Comparar lo tecleado con la respuesta. Funciones puras, sin React y sin
 * estado: es lo único de la calificación que no necesita que la UI exista.
 *
 * Hoy ninguna pantalla las llama. Los tres botones de «comprobar» y el «es ese»
 * hacen `router.push` sin condición (`app/estacion/completar.tsx:113`,
 * `escalera.tsx:106`, `error.tsx:112`, `contacto.tsx:85`), así que el contenido
 * que la API genera —`respuesta.tecleado`, `aceptaTambien`, `siTecleaElError`,
 * `opciones[].queRevela`, `motivos[].esElBueno`, `pasos[].siLoTocas`— se
 * guarda y nadie lo lee. Lo que falta es UI, no lógica: un bloque de respuesta
 * debajo de la tarjeta que pinte el texto que estas funciones devuelven, y que
 * `BotonPrincipal` avance sólo cuando `esCorrecta` da `true`.
 */

import type {
  CompletarRedactado,
  ErrorRedactado,
  EscalonRedactado,
  OpcionRedactada,
  RespuestaTecleada,
} from './autoria';

/**
 * Lo tecleado, listo para comparar. El teclado de doce teclas sólo escribe
 * dígitos y la diagonal, así que aquí no hay acentos ni mayúsculas que perdonar:
 * lo único que sobra son los espacios y los ceros de adelante (`04` es `4`).
 */
export function normalizar(tecleado: string): string {
  const limpio = tecleado.replace(/\s+/g, '');
  const partes = limpio.split('/');
  const sinCeros = partes.map((p) => p.replace(/^0+(?=\d)/, ''));
  // Un denominador de 1 no cambia el número: 4/1 es 4.
  if (sinCeros.length === 2 && sinCeros[1] === '1') return sinCeros[0];
  return sinCeros.join('/');
}

/** ¿Lo tecleado cuenta como la respuesta correcta? */
export function esCorrecta(tecleado: string, respuesta: RespuestaTecleada): boolean {
  const escrito = normalizar(tecleado);
  if (escrito.length === 0) return false;
  if (escrito === normalizar(respuesta.tecleado)) return true;
  return respuesta.aceptaTambien.some((otra) => normalizar(otra) === escrito);
}

/** Qué se le contesta y si puede avanzar. `texto` en `null` es «sin nada que decir». */
export type Respuesta = {
  bien: boolean;
  texto: string | null;
};

/**
 * La respuesta de la estación 3. Cuando teclea justo el error típico, se le
 * contesta con el texto que el contenido escribió para ese instante exacto: es
 * el único momento en que `siTecleaElError` sirve de algo.
 */
export function respuestaDeCompletar(tecleado: string, contenido: CompletarRedactado): Respuesta {
  if (esCorrecta(tecleado, contenido.respuesta)) return { bien: true, texto: null };
  const error = contenido.siTecleaElError;
  if (error && normalizar(error.tecleado) === normalizar(tecleado)) {
    return { bien: false, texto: error.queSeLeDice };
  }
  return { bien: false, texto: null };
}

/** La respuesta de un escalón de la estación 4. Sin texto por escalón: sólo acierta o no. */
export function respuestaDeEscalon(tecleado: string, escalon: EscalonRedactado): Respuesta {
  return { bien: esCorrecta(tecleado, escalon.respuesta), texto: null };
}

/** Lo que revela la opción elegida en la estación 2. Aquí nada penaliza: siempre se avanza. */
export function respuestaDeContacto(opcion: OpcionRedactada): Respuesta {
  return { bien: opcion.esCorrecta, texto: opcion.queRevela };
}

/** Lo que se contesta al acusar un paso en la estación 5. */
export function respuestaDePaso(numero: number, contenido: ErrorRedactado): Respuesta {
  const paso = contenido.pasos.find((p) => p.numero === numero);
  return { bien: numero === contenido.pasoMalo, texto: paso ? paso.siLoTocas : null };
}

/** Lo que revela el motivo elegido, una vez que el paso ya está acusado. */
export function respuestaDeMotivo(indice: number, contenido: ErrorRedactado): Respuesta {
  const motivo = contenido.motivos[indice];
  if (!motivo) return { bien: false, texto: null };
  return { bien: motivo.esElBueno, texto: motivo.queRevela };
}
