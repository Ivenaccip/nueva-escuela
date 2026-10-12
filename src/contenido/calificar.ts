/**
 * Comparar lo tecleado con la respuesta. Funciones puras, sin React y sin
 * estado: es lo único de la calificación que no necesita que la UI exista.
 *
 * Las llaman las cuatro estaciones que tienen respuesta (`contacto`, `completar`,
 * `escalera` y `error`). Reciben el contenido **redactado** —el que sí trae
 * `respuesta.tecleado`, `esCorrecta`, `esElBueno`—, que la pantalla saca de
 * `useAndamio().redactado`: el `Tema` que pinta `adaptar` no lo lleva a propósito.
 * Devuelven qué decir (`siTecleaElError.queSeLeDice`, `queRevela`, `siLoTocas`) y
 * si se puede avanzar.
 */

import type {
  ComoSeCompara,
  CompletarRedactado,
  EntradaRedactada,
  ErrorRedactado,
  EscalonRedactado,
  OpcionRedactada,
  RespuestaTecleada,
} from './autoria';

/**
 * Lo tecleado, listo para comparar. Con las doce teclas de dígitos sólo hay
 * espacios y ceros de adelante que perdonar (`04` es `4`). Con un teclado propio
 * el tema decide qué más se perdona (`regla`): sólo el de texto lo usa, porque con
 * fichas y opciones el estudiante no puede escribir nada que no venga pintado.
 */
export function normalizar(tecleado: string, regla?: ComoSeCompara): string {
  // El menos de la tecla (U+2212) y el guion del teclado del sistema son el mismo signo.
  let limpio = tecleado.replace(/[\u2212\u2013\u2014]/g, '-');
  if (regla?.ignoraEspaciosDeMas) limpio = limpio.trim().replace(/\s+/g, ' ');
  else if (!regla) limpio = limpio.replace(/\s+/g, '');
  if (regla?.ignoraMayusculas) limpio = limpio.toLowerCase();
  if (regla?.ignoraAcentos) limpio = limpio.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const partes = limpio.split('/');
  const sinCeros = partes.map((p) => sinCerosDeMas(p));
  // Un denominador de 1 no cambia el número: 4/1 es 4.
  if (sinCeros.length === 2 && sinCeros[1] === '1') return sinCeros[0];
  return sinCeros.join('/');
}

/**
 * `007` es `7`, y con punto `2.50` es `2.5` y `.5` es `0.5`: es el mismo número, y
 * quien teclea el de menos ceros no se equivocó. Un entero (`100`) no se toca.
 */
function sinCerosDeMas(parte: string): string {
  const sinInicio = parte.replace(/^(-?)0+(?=\d)/, '$1');
  if (!/^-?\d*\.\d+$/.test(sinInicio)) return sinInicio;
  const sinFinal = sinInicio.replace(/0+$/, '').replace(/\.$/, '');
  return sinFinal.replace(/^(-?)\./, '$10.');
}

/** ¿Lo tecleado cuenta como la respuesta correcta? */
export function esCorrecta(
  tecleado: string,
  respuesta: RespuestaTecleada,
  regla?: ComoSeCompara,
): boolean {
  const escrito = normalizar(tecleado, regla);
  if (escrito.length === 0) return false;
  if (escrito === normalizar(respuesta.tecleado, regla)) return true;
  return respuesta.aceptaTambien.some((otra) => normalizar(otra, regla) === escrito);
}

/**
 * La regla de comparación de un tema. Sólo el teclado de texto perdona algo: con
 * los otros la comparación es exacta, igual que siempre.
 */
function reglaDe(entrada: EntradaRedactada | undefined): ComoSeCompara | undefined {
  return entrada?.teclado === 'texto' ? entrada.comoSeCompara : undefined;
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
  const regla = reglaDe(contenido.entrada);
  const elegida = laOpcionElegida(tecleado, contenido.respuesta);
  if (elegida)
    return { bien: elegida.esCorrecta, texto: elegida.esCorrecta ? null : elegida.queRevela };
  if (esCorrecta(tecleado, contenido.respuesta, regla)) return { bien: true, texto: null };
  const error = contenido.siTecleaElError;
  if (error && normalizar(error.tecleado, regla) === normalizar(tecleado, regla)) {
    return { bien: false, texto: error.queSeLeDice };
  }
  return { bien: false, texto: null };
}

/**
 * La respuesta de un escalón de la estación 4. Con dígitos sólo acierta o no;
 * con opciones, elegir una equivocada dice qué creía quien la eligió.
 */
export function respuestaDeEscalon(tecleado: string, escalon: EscalonRedactado): Respuesta {
  const elegida = laOpcionElegida(tecleado, escalon.respuesta);
  if (elegida)
    return { bien: elegida.esCorrecta, texto: elegida.esCorrecta ? null : elegida.queRevela };
  return { bien: esCorrecta(tecleado, escalon.respuesta, reglaDe(escalon.entrada)), texto: null };
}

/** Con el teclado `opciones` lo «tecleado» es la etiqueta de la opción que se tocó. */
function laOpcionElegida(tecleado: string, respuesta: RespuestaTecleada) {
  return respuesta.opciones?.find((o) => o.etiqueta === tecleado) ?? null;
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
