/**
 * Sistema de diseño de Andamio.
 *
 * Todos los valores salen del canvas de diseño original. No inventes tonos
 * nuevos: si necesitas un color que no está aquí, agrégalo a esta lista
 * primero para que web y móvil sigan viéndose igual.
 */

export const colores = {
  /** Fondo de toda la app. */
  fondo: '#14120F',
  /** Tarjetas, opciones sin elegir, teclas. */
  superficie: '#201D18',
  /** La misma superficie cuando el dedo la está tocando. */
  superficieAlta: '#2A2620',
  /** Borde de tarjetas y opciones. */
  borde: '#2E2A23',
  /** Borde apagado: puntos sin recorrer, tramos punteados del círculo. */
  bordeApagado: '#3A352C',
  /** Borde del hueco vacío que hay que rellenar. */
  bordeHueco: '#6E675C',

  /** Texto principal. */
  texto: '#F7F2E7',
  /** Texto de párrafo y de opciones sin elegir. */
  textoSuave: '#C9C1B2',
  /** Etiquetas, contadores, texto de apoyo. */
  textoTenue: '#9A9184',
  /** Notas al pie. */
  textoApenas: '#6E675C',

  /** Ámbar: lo hecho, lo que sigue, el botón que avanza. */
  acento: '#E8A33D',
  /** El ámbar al tocarlo. */
  acentoClaro: '#F5C070',
  /** Texto sobre ámbar. */
  sobreAcento: '#14120F',

  /** Rojo del error cazado y de la racha. */
  error: '#D9694A',
  /** Fondo del paso equivocado. */
  errorFondo: '#2E1A14',

  /** El escenario detrás del teléfono en escritorio: más oscuro que el fondo. */
  escenario: '#0B0A08',
  /** Lo que se oscurece detrás de una hoja que se abre encima, como la de pistas. */
  velo: 'rgba(11, 10, 8, 0.72)',
} as const;

export const fuentes = {
  /** Fraunces: títulos, enunciados, la frase de la bitácora. */
  display: 'Fraunces_600SemiBold',
  displayRegular: 'Fraunces_400Regular',
  /** IBM Plex Sans: todo lo demás. */
  cuerpo: 'IBMPlexSans_400Regular',
  cuerpoMedio: 'IBMPlexSans_500Medium',
  cuerpoFuerte: 'IBMPlexSans_600SemiBold',
} as const;

/** Ancho del lienzo del diseño. En web el marco se queda en esta medida. */
export const ANCHO_MARCO = 390;
/** Alto del lienzo del diseño, sólo para el marco de escritorio. */
export const ALTO_MARCO = 844;

export const espacio = {
  /** Margen lateral de las pantallas que respiran (24 en el diseño). */
  margen: 24,
  /** Margen lateral de lo que va a lo ancho: botones, tarjetas, rejillas. */
  margenAncho: 20,
} as const;

export const radios = {
  tecla: 14,
  opcion: 15,
  tarjeta: 18,
  boton: 16,
  campo: 15,
  hueco: 12,
  pildora: 999,
  /** Esquinas del marco del teléfono en escritorio. */
  marco: 28,
} as const;

/** Alto del botón que avanza, fijo en todas las pantallas. */
export const ALTO_BOTON = 56;
/** Mínimo tocable, igual en las dos plataformas. */
export const TOCABLE = 44;
