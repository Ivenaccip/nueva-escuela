/**
 * La puerta entre lo que escribe la IA y lo que pintan las pantallas.
 *
 * `autoria.ts` tiene las formas de lo redactado: listas completas, sin nada del
 * estudiante. `tipos.ts` tiene las de la pantalla, que mezclan contenido con
 * estado: `pistas: 5` es cuántas le quedan, `escalon: 4` es en cuál va. Aquí y
 * sólo aquí se juntan los dos (`contenido/CONTRATO.md` §4).
 *
 * Lo que se deriva aquí, y en ningún otro lado:
 *   - `estaciones[].estado`, de por dónde va el estudiante
 *   - `indice` y `total`, del temario
 *   - `escalon` y `preguntas[i]`, aplanando la lista al que está en curso
 *   - `pistas` como contador y `pistaEn` como cuenta regresiva
 *   - el `cierre`, que la IA no escribe: su frase es el `quedaSabiendo` del
 *     temario y el resto es copy fijo
 *
 * Es una función pura: sin React, sin estado, sin leer disco. Lo que entra
 * decide lo que sale, y por eso se puede probar sin levantar la app.
 */

import type {
  ContactoRedactado,
  CompletarRedactado,
  ErrorRedactado,
  EscaleraRedactada,
  ExplicarRedactado,
  TemaRedactado,
  VerRedactado,
} from './autoria';
import {
  ORDEN_ESTACIONES,
  type ClaveEstacion,
  type Estacion,
  type EstadoEstacion,
  type Tema,
} from './tipos';

/** Cómo se lee cada estación en el centro del círculo. */
const NOMBRES: Record<ClaveEstacion, string> = {
  ver: 'Ver el video',
  contacto: 'Primer contacto',
  completar: 'Completar',
  escalera: 'Escalera',
  error: 'Cazar el error',
  explicar: 'Explicarlo',
};

/**
 * El guardián es copy fijo: dice qué le pasa al tema cuando se cierra el
 * círculo, y eso no cambia de un tema a otro.
 */
const GUARDIAN =
  'Este tema se guarda. Algún domingo lo voy a sacar otra vez, un poco más difícil, cuando ya no te lo esperes.';

/** Por dónde va el estudiante en este tema. Nada de esto lo escribe la IA. */
export type Progreso = {
  /** Las estaciones que ya cerró, en cualquier orden. */
  hechas: ClaveEstacion[];
  /** Las que le quedan en este tema. La pantalla las pinta en la barra de arriba. */
  pistasRestantes: number;
  /** En qué escalón de la escalera va, de 1 a los que haya. */
  escalonEnCurso: number;
  /** En qué pregunta del bloque de la estación 2 va, de 1 a las que haya. */
  preguntaEnCurso: number;
  /** Lo que lleva escrito en la estación 6. Vacío cuando empieza de cero. */
  borrador: string;
  /** Lo que lleva tecleado en el hueco de la estación 3 o 4. */
  tecleado: string;
  /** Cuánto falta para que se libere una pista, en segundos. */
  segundosParaPista: number;
  /** Las que lleva ganadas en el tema. Se muestran en el cierre. */
  monedas: number;
};

/** Con lo que arranca un tema que el estudiante no ha tocado. */
export const progresoInicial: Progreso = {
  hechas: [],
  pistasRestantes: 5,
  escalonEnCurso: 1,
  preguntaEnCurso: 1,
  borrador: '',
  tecleado: '',
  segundosParaPista: 18,
  monedas: 0,
};

/** Lo que el temario sabe del tema y la IA no repite. */
export type DelTemario = {
  /** "tema 14 de 32": cuál es y de cuántos. */
  indice: number;
  total: number;
  familia: string;
  /** La frase en primera persona con la que se cierra el círculo. */
  quedaSabiendo: string;
  /** Cómo se llama la materia en pantalla: "Matemáticas", no "matematicas". */
  materiaNombre: string;
};

/** `0:18`, que es como la pantalla escribe una cuenta regresiva. */
function comoReloj(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * El estado de cada estación. La primera que no esté hecha es la actual, y las
 * de después quedan cerradas: el círculo se recorre en orden.
 *
 * Una estación cuyo contenido no se genero queda cerrada aunque le tocara ser
 * la actual. Sin esto el estudiante entra a una pantalla vacia y cree que la
 * app se rompio.
 */
function estadoDeLasEstaciones(
  redactado: TemaRedactado,
  progreso: Progreso,
): { estaciones: Estacion[]; faltan: ClaveEstacion[] } {
  const faltan = ORDEN_ESTACIONES.filter((clave) => !redactado[clave]);
  const primeraPendiente = ORDEN_ESTACIONES.find(
    (clave) => !progreso.hechas.includes(clave) && !faltan.includes(clave),
  );

  const estaciones = ORDEN_ESTACIONES.map((clave, i): Estacion => {
    let estado: EstadoEstacion = 'cerrada';
    if (progreso.hechas.includes(clave)) estado = 'hecha';
    else if (clave === primeraPendiente) estado = 'actual';
    return { numero: i + 1, clave, nombre: NOMBRES[clave], estado };
  });

  return { estaciones, faltan };
}

/**
 * Un renglón que dice, en la propia pantalla, que ese ejercicio no se generó.
 * Es preferible a un hueco mudo: el estudiante sabe que no es culpa suya.
 */
const FALTA = [{ tipo: 'texto' as const, valor: 'Este ejercicio todavía no se ha escrito.' }];

function adaptarVer(v: VerRedactado | null) {
  if (!v) return { pregunta: 'Falta el video de este tema.', resumen: '', duracion: undefined };
  return {
    pregunta: v.pregunta,
    resumen: v.resumen,
    // La duración sólo existe si venía escrita en el resultado de la búsqueda:
    // estimarla es inventarla, así que puede no venir y la píldora no se pinta.
    duracion: v.video?.duracion ?? undefined,
    video: v.video ? { url: v.video.url, titulo: v.video.titulo, canal: v.video.canal } : undefined,
  };
}

/**
 * La estación 2 muestra UNA pregunta del bloque, y la barra dice cuál de
 * cuántas. Ese aplanado es de aquí: la IA entrega la lista entera.
 */
function adaptarContacto(c: ContactoRedactado | null, progreso: Progreso) {
  if (!c || c.preguntas.length === 0) {
    return { enunciado: FALTA, opciones: [], indice: 1, total: 1 };
  }
  const i = Math.min(Math.max(1, progreso.preguntaEnCurso), c.preguntas.length);
  const pregunta = c.preguntas[i - 1];
  return {
    enunciado: pregunta.enunciado,
    // La pantalla no sabe cuál es la correcta, y así tiene que ser: quien
    // califica es `calificar.ts`, con el contenido redactado en la mano.
    opciones: pregunta.opciones.map((o) => ({ letra: o.letra, partes: o.partes })),
    indice: i,
    total: c.preguntas.length,
  };
}

function adaptarCompletar(c: CompletarRedactado | null, progreso: Progreso) {
  if (!c) {
    return { expresion: FALTA, pistaEn: comoReloj(0), pistas: progreso.pistasRestantes };
  }
  return {
    // Lo que lleva tecleado se pinta dentro del hueco, así que viaja en el
    // átomo y no aparte: `Expresion` ya sabe dibujarlo.
    expresion: c.expresion.map((parte) =>
      parte.tipo === 'hueco' ? { ...parte, valor: progreso.tecleado || undefined } : parte,
    ),
    pistaEn: comoReloj(progreso.segundosParaPista),
    pistas: progreso.pistasRestantes,
  };
}

/** Igual que la 2: la IA entrega los cinco escalones y aquí se aplana al que toca. */
function adaptarEscalera(e: EscaleraRedactada | null, progreso: Progreso) {
  if (!e || e.escalones.length === 0) {
    return {
      escalon: 1,
      escalones: 1,
      situacion: 'Este ejercicio todavía no se ha escrito.',
      expresion: FALTA,
      pregunta: '',
      pistas: progreso.pistasRestantes,
    };
  }
  const i = Math.min(Math.max(1, progreso.escalonEnCurso), e.escalones.length);
  const escalon = e.escalones[i - 1];
  return {
    escalon: i,
    escalones: e.escalones.length,
    situacion: escalon.situacion,
    expresion: escalon.expresion,
    pregunta: escalon.pregunta,
    pistas: progreso.pistasRestantes,
    respuestaInicial: progreso.tecleado || undefined,
  };
}

function adaptarError(e: ErrorRedactado | null, progreso: Progreso) {
  if (!e) {
    return {
      enunciado: FALTA,
      pasos: [],
      pasoMalo: 0,
      porQue: '',
      motivos: [],
      pistas: progreso.pistasRestantes,
    };
  }
  return {
    enunciado: e.enunciado,
    pasos: e.pasos.map((p) => ({ numero: p.numero, partes: p.partes })),
    pasoMalo: e.pasoMalo,
    porQue: e.porQue,
    // Sólo el texto: cuál es el bueno lo sabe `calificar.ts`, no la pantalla.
    motivos: e.motivos.map((m) => m.texto),
    pistas: e.pistas.length > 0 ? progreso.pistasRestantes : progreso.pistasRestantes,
  };
}

function adaptarExplicar(x: ExplicarRedactado | null, progreso: Progreso) {
  if (!x) {
    return {
      titulo: 'Este ejercicio todavía no se ha escrito.',
      aclaracion: '',
      nota: '',
      borrador: progreso.borrador,
    };
  }
  return {
    titulo: x.titulo,
    aclaracion: x.aclaracion,
    nota: x.nota,
    // La rúbrica no viaja a la pantalla: es para la segunda llamada que
    // califica lo que el estudiante escribió.
    borrador: progreso.borrador,
  };
}

/**
 * Junta el contenido redactado con el progreso y devuelve lo que las pantallas
 * ya saben pintar. `faltan` dice qué estaciones no se generaron, para que el
 * círculo las deje cerradas en vez de mandar al estudiante a una pantalla vacía.
 */
export function adaptar(
  redactado: TemaRedactado,
  delTemario: DelTemario,
  progreso: Progreso = progresoInicial,
): { tema: Tema; faltan: ClaveEstacion[] } {
  const { estaciones, faltan } = estadoDeLasEstaciones(redactado, progreso);

  const tema: Tema = {
    materia: delTemario.materiaNombre,
    indice: delTemario.indice,
    total: delTemario.total,
    familia: delTemario.familia,
    titulo: redactado.titulo,
    estaciones,
    ver: adaptarVer(redactado.ver),
    contacto: adaptarContacto(redactado.contacto, progreso),
    completar: adaptarCompletar(redactado.completar, progreso),
    escalera: adaptarEscalera(redactado.escalera, progreso),
    error: adaptarError(redactado.error, progreso),
    explicar: adaptarExplicar(redactado.explicar, progreso),
    cierre: {
      // La frase del cierre es el `quedaSabiendo` del temario tal cual: ya está
      // en primera persona y ya dice lo aprendido. La IA no la escribe.
      frase: delTemario.quedaSabiendo,
      monedas: progreso.monedas,
      guardian: GUARDIAN,
    },
  };

  return { tema, faltan };
}
