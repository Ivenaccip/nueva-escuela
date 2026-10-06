/**
 * Formas del contenido. El contenido real de los ejercicios entra por aquí:
 * mientras no llegue, `demo.ts` llena estas mismas formas con el ejemplo de
 * división de fracciones del diseño.
 */

/** Las seis estaciones, en orden. La clave es también la ruta. */
export type ClaveEstacion = 'ver' | 'contacto' | 'completar' | 'escalera' | 'error' | 'explicar';

export const ORDEN_ESTACIONES: ClaveEstacion[] = [
  'ver',
  'contacto',
  'completar',
  'escalera',
  'error',
  'explicar',
];

/** La llave con la que se guarda el progreso de un tema: `matematicas-9`. */
export function llaveDe(materia: string, numero: number): string {
  return `${materia}-${numero}`;
}

export type EstadoEstacion = 'hecha' | 'actual' | 'cerrada';

export type Estacion = {
  numero: number;
  clave: ClaveEstacion;
  /** Como se lee en el centro del círculo: "Escalera", "Ver el video". */
  nombre: string;
  estado: EstadoEstacion;
};

/**
 * Un trozo de expresión matemática. Se arman en fila para escribir cosas
 * como 3/5 ÷ 1/4 = 3/5 × [hueco] sin recurrir a una imagen.
 */
export type ParteMat =
  | { tipo: 'texto'; valor: string }
  | { tipo: 'fraccion'; arriba: string | number; abajo: string | number }
  /**
   * Un símbolo con lo que lleva pegado arriba o abajo. Con este átomo solo salen
   * el subíndice, el superíndice, la carga, la unidad con exponente y la
   * variable con letra: H₂, 2³, Ca²⁺, cm³, v_f. Sin él, toda Química y toda
   * Física llegan sin cómo escribirse.
   */
  | { tipo: 'simbolo'; valor: string; sub?: string; sup?: string }
  /**
   * El espacio que el estudiante tiene que llenar. `ancho` y `alto` son las
   * medidas finales del recuadro, bordes incluidos: el diseño las fija por
   * ejercicio y no salen del tamaño de letra.
   */
  | { tipo: 'hueco'; valor?: string; ancho?: number; alto?: number };

/** Estación 1 · ver el video. */
export type ContenidoVer = {
  pregunta: string;
  /**
   * Lo que dura, tal cual se muestra sobre el video. Es opcional porque sólo se
   * sabe si venía escrita en el resultado de la búsqueda: estimarla es
   * inventarla. Sin ella la píldora no se pinta, en vez de pintarse vacía.
   */
  duracion?: string;
  resumen: string;
  /** El video que se encontró, ya comprobado contra el oEmbed de YouTube. */
  video?: { url: string; titulo: string; canal: string };
};

/** Estación 2 · primer contacto, sin penalización. */
export type ContenidoContacto = {
  enunciado: ParteMat[];
  opciones: { letra: string; partes: ParteMat[] }[];
  /** Cuál de las preguntas del bloque es ésta. */
  indice: number;
  total: number;
};

/** Estación 3 · completar el paso. */
export type ContenidoCompletar = {
  expresion: ParteMat[];
  /** Segundos que faltan para que se libere una pista. */
  pistaEn: string;
  pistas: number;
};

/** Estación 4 · escalera. */
export type ContenidoEscalera = {
  /** El escalón en que va, de 1 a `escalones`. */
  escalon: number;
  escalones: number;
  situacion: string;
  expresion: ParteMat[];
  pregunta: string;
  pistas: number;
  /** Lo que el diseño muestra ya tecleado en el campo. */
  respuestaInicial?: string;
};

/** Estación 5 · cazar el error. */
export type ContenidoError = {
  enunciado: ParteMat[];
  pasos: { numero: number; partes: ParteMat[] }[];
  /** Cuál de los pasos está mal, por su número. */
  pasoMalo: number;
  /** Se pregunta una vez que el paso está marcado. */
  porQue: string;
  motivos: string[];
  pistas: number;
};

/** Estación 6 · explicarlo. Sin pistas, a propósito. */
export type ContenidoExplicar = {
  titulo: string;
  aclaracion: string;
  nota: string;
  /** Con lo que arranca el campo. Vacío cuando el estudiante empieza de cero. */
  borrador: string;
};

/** El cierre del círculo. */
export type ContenidoCierre = {
  frase: string;
  monedas: number;
  guardian: string;
};

export type Tema = {
  materia: string;
  /** "tema 14 de 32". */
  indice: number;
  total: number;
  /** La familia a la que pertenece: "fracciones". */
  familia: string;
  titulo: string;
  estaciones: Estacion[];
  ver: ContenidoVer;
  contacto: ContenidoContacto;
  completar: ContenidoCompletar;
  escalera: ContenidoEscalera;
  error: ContenidoError;
  explicar: ContenidoExplicar;
  cierre: ContenidoCierre;
};

export type Perfil = {
  /** Días seguidos. */
  racha: number;
  monedas: number;
  materias: string[];
  materiaActiva: string;
};
