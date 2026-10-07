/**
 * Las formas del contenido **redactado**: lo que devuelve la API.
 *
 * Es el espejo en TypeScript de `contenido/esquema/*.schema.json`. Si un campo
 * está aquí y no está en el esquema, o al revés, uno de los dos está mal: el
 * esquema manda, porque es el que viaja como `input_schema` de la herramienta.
 *
 * No es lo que consumen las pantallas. `tipos.ts` tiene las formas de la
 * pantalla, y esas mezclan contenido con estado del estudiante: `pistas: 5` es
 * cuántas le quedan, `escalon: 4` es en cuál va, `indice` es qué tema de la
 * materia. Nada de eso lo escribe la IA (`contenido/CONTRATO.md` §4).
 *
 * Entre este archivo y `tipos.ts` vive `src/contenido/adaptar.ts`: la única puerta
 * que recibe el `TemaRedactado` de las siete llamadas más el avance del estudiante
 * y devuelve el `Tema` que las pantallas ya saben pintar. Ahí y sólo ahí se derivan
 * `escalon`, `escalones` como número, `indice`, `total`, `pistas` como contador,
 * `pistaEn` y `estaciones[].estado`; ahí se aplana `escalones[i]` al escalón en
 * curso y `preguntas[i]` a la pregunta en curso; y ahí se arma el `cierre`, que no
 * lo escribe la IA.
 */

import type { ParteMat } from './tipos';

/** Las cuatro materias, con la clave del temario. */
export type Materia = 'matematicas' | 'biologia' | 'fisica' | 'quimica';

/** Lo que el hueco recibe del teclado de doce teclas: `^[0-9]+(/[0-9]+)?$`. */
export type Tecleado = string;

/**
 * La salida de emergencia. Va en `null` cuando todo salió bien, y llena cuando
 * el tema necesita algo que la pantalla no puede dibujar. Vale más un
 * `noSePuede` lleno que un ejercicio que se ve como cajas en blanco.
 */
export type NoSePuede = null | {
  que: string;
  porQue: string;
  queHagoConEsto: string;
};

/** Una pista, con su lugar en la escalera de pistas. Su texto es contenido. */
export type Pista = {
  orden: number;
  texto: string;
};

// ---------------------------------------------------------------------------
// Paso 0 · el canon
// ---------------------------------------------------------------------------

/** A qué prompt va el tema. `tabla` y `figura` no van a los de estación. */
export type Notacion = 'lineal' | 'tabla' | 'figura';

/** Qué teclea el estudiante en las estaciones 3 y 4. */
export type FormaDeRespuesta = 'numero' | 'fraccion' | 'palabra' | 'trazo';

export type PasoDelCanon = {
  numero: number;
  queSeHace: string;
  renglon: ParteMat[];
  porQue: string;
};

export type ErrorDelCanon = {
  enUnaFrase: string;
  creenciaDeAtras: string;
  /** De 1 a 5. Tiene que existir en `procedimiento.pasos`. */
  pasoQueCorrompe: number;
  renglonMalo: ParteMat[];
  resultadoMalo: ParteMat[];
  comoSeCacha: string;
};

/** Las otras confusiones de `errorTipico`, las que no caben en un paso. */
export type ErrorSecundario = {
  enUnaFrase: string;
  creenciaDeAtras: string;
};

export type Canon = {
  temaNumero: number;
  materia: Materia;
  titulo: string;
  notacion: Notacion;
  formaDeRespuesta: FormaDeRespuesta;
  procedimiento: {
    nombre: string;
    pasos: PasoDelCanon[];
  };
  ejemplo: {
    deQueVa: string;
    planteamiento: ParteMat[];
    resultado: ParteMat[];
    resultadoEnPalabras: string;
  };
  error: ErrorDelCanon;
  erroresSecundarios: ErrorSecundario[];
  vocabulario: { palabra: string; queEs: string; noEsLoMismoQue?: string }[];
  cotas: {
    numeros: string;
    unidades: string[];
    simbolos: ParteMat[];
  };
  noSePuede: NoSePuede;
};

// ---------------------------------------------------------------------------
// Estación 1 · ver el video
// ---------------------------------------------------------------------------

export type VariedadDeEspanol = 'Mexico' | 'America Latina' | 'España';

/**
 * Un video reportado por el modelo. Nada de esto se guarda sin validarlo: el
 * llamador comprueba `url` contra el oEmbed de YouTube y compara el `title` y
 * el `author_name` que devuelve con `titulo` y `canal`.
 */
export type VideoRedactado = {
  url: string;
  idDeYouTube: string;
  titulo: string;
  canal: string;
  variedadDeEspanol: VariedadDeEspanol;
  explicaElPorQue: boolean;
  dondeSalio: string;
  porQueEste: string;
  /** Opcional a propósito: se omite cuando el resultado no la traía escrita. */
  duracion?: string;
};

export type VerRedactado = {
  temaNumero: number;
  materia: Materia;
  pregunta: string;
  resumen: string;
  busqueda: {
    consulta: string;
    consultasAlternas: string[];
    criterios: string[];
    descarta: string[];
  };
  video: VideoRedactado | null;
  alternativas: VideoRedactado[];
  confianza: 'alta' | 'media' | 'baja';
  porQueEsaConfianza: string;
  noSePuede: NoSePuede;
};

// ---------------------------------------------------------------------------
// Estación 2 · primer contacto
// ---------------------------------------------------------------------------

export type OpcionRedactada = {
  letra: 'A' | 'B' | 'C' | 'D';
  partes: ParteMat[];
  esCorrecta: boolean;
  /** Exactamente una opción de todo el bloque lo lleva en `true`. */
  esElErrorTipico: boolean;
  queRevela: string;
};

export type PreguntaRedactada = {
  enunciado: ParteMat[];
  pasoDelCanon: number;
  opciones: OpcionRedactada[];
};

export type ContactoRedactado = {
  temaNumero: number;
  materia: Materia;
  /** Es una lista: el índice y el total los deriva la pantalla. */
  preguntas: PreguntaRedactada[];
  noSePuede: NoSePuede;
};

// ---------------------------------------------------------------------------
// Estación 3 · completar el paso
// ---------------------------------------------------------------------------

export type RespuestaTecleada = {
  tecleado: Tecleado;
  /** Otras escrituras del mismo número: `4` y `4/1`, `12/5` y `24/10`. */
  aceptaTambien: Tecleado[];
  comoSeLee: string;
  /**
   * La respuesta con átomos (`CaCl₂`), para pintarla bien una vez contestada.
   * Sólo la traen los temas con teclado propio.
   */
  enAtomos?: ParteMat[];
  /** Sólo con el teclado `opciones`: las etiquetas entre las que se elige. */
  opciones?: OpcionDeRespuesta[];
};

/** Una opción del teclado `opciones`. `queRevela` es lo que se le contesta al elegirla. */
export type OpcionDeRespuesta = {
  etiqueta: string;
  esCorrecta: boolean;
  queRevela: string;
};

/** Con qué contesta el estudiante. Ver `EntradaDePantalla` en `tipos.ts`. */
export type TecladoDelTema = 'digitos' | 'fichas' | 'opciones' | 'texto';

export type Ficha = { etiqueta: string; comoSeLee: string };

/** Qué perdona la comparación. Sólo el teclado `texto` decide algo aquí. */
export type ComoSeCompara = {
  ignoraMayusculas: boolean;
  ignoraAcentos: boolean;
  ignoraEspaciosDeMas: boolean;
};

/**
 * El teclado de un tema. Los temas de dígitos no lo traen: `entrada` ausente
 * quiere decir `digitos` con comparación exacta. Los que lo traen lo copian aquí
 * desde su caso `X3-teclado` (`src/contenido/teclado.ts`), igual en la estación 3
 * y en todos los escalones de la 4.
 */
export type EntradaRedactada = {
  teclado: TecladoDelTema;
  /** Vacío salvo con `fichas`. */
  fichas: Ficha[];
  comoSeCompara: ComoSeCompara;
};

export type CompletarRedactado = {
  temaNumero: number;
  materia: Materia;
  pasoDelCanon: number;
  queFalta: string;
  /** Exactamente un átomo `hueco`. */
  expresion: ParteMat[];
  respuesta: RespuestaTecleada;
  pistas: Pista[];
  siTecleaElError: { tecleado: Tecleado; queSeLeDice: string } | null;
  entrada?: EntradaRedactada;
  noSePuede: NoSePuede;
};

// ---------------------------------------------------------------------------
// Estación 4 · la escalera
// ---------------------------------------------------------------------------

export type EscalonRedactado = {
  situacion: string;
  /** Exactamente un átomo `hueco`. */
  expresion: ParteMat[];
  pregunta: string;
  respuesta: RespuestaTecleada;
  pistas: Pista[];
  pasoDelCanon: number;
  /** Le dieron el resultado y le falta un dato de entrada. */
  esInverso: boolean;
  entrada?: EntradaRedactada;
};

export type EscaleraRedactada = {
  temaNumero: number;
  materia: Materia;
  /** Es una lista: en cuál escalón va lo deriva la pantalla. */
  escalones: EscalonRedactado[];
  noSePuede: NoSePuede;
};

// ---------------------------------------------------------------------------
// Estación 5 · cazar el error
// ---------------------------------------------------------------------------

export type PasoRedactado = {
  numero: number;
  partes: ParteMat[];
  /** Lo que se contesta si el estudiante acusa este paso. */
  siLoTocas: string;
};

export type MotivoRedactado = {
  texto: string;
  /** Exactamente uno de los motivos lo lleva en `true`. */
  esElBueno: boolean;
  queRevela: string;
};

export type ErrorRedactado = {
  temaNumero: number;
  materia: Materia;
  enunciado: ParteMat[];
  pasos: PasoRedactado[];
  pasoMalo: number;
  /** Qué números de los pasos posteriores vienen del error. */
  arrastre: string;
  porQue: string;
  motivos: MotivoRedactado[];
  pistas: Pista[];
  noSePuede: NoSePuede;
};

// ---------------------------------------------------------------------------
// Estación 6 · explicarlo
// ---------------------------------------------------------------------------

export type IdeaQueCuenta = {
  idea: string;
  porQueImporta: string;
  comoSuenaDicha: string;
  /** Exactamente una en `true`: la que contesta el `titulo`. */
  esImprescindible: boolean;
};

export type Rubrica = {
  ideasQueCuentan: IdeaQueCuenta[];
  /**
   * Cuenta si aparecen al menos tantas ideas **y** entre ellas la
   * imprescindible. Son dos condiciones, no una.
   */
  minimoParaContar: number;
  suenanBienYNoDicen: { respuesta: string; queLaDelata: string; queLeFalta: string }[];
  contraargumentos: { siDice: string; seLeContesta: string; aDondeLoEmpuja: string }[];
  ejemploQueSiCuenta: string;
  noCuentaEnContra: string[];
};

export type ExplicarRedactado = {
  temaNumero: number;
  materia: Materia;
  titulo: string;
  aclaracion: string;
  nota: string;
  /** No la usa la pantalla: se guarda y se le manda a la segunda llamada. */
  rubrica: Rubrica;
  noSePuede: NoSePuede;
};

// ---------------------------------------------------------------------------
// El tema completo, tal como lo escribe `contenido/generar.mjs`
// ---------------------------------------------------------------------------

/**
 * Lo que queda en `contenido/temas/<materia>-<numero>.json`. Son las siete
 * llamadas guardadas juntas, sin adaptar. El cierre no está: no lo escribe la
 * IA (su frase es `quedaSabiendo` del temario y el resto es copy fijo).
 */
export type TemaRedactado = {
  materia: Materia;
  temaNumero: number;
  titulo: string;
  /** Cuándo se generó, en ISO. Para saber qué tanda hay que rehacer. */
  generadoEn: string;
  canon: Canon;
  ver: VerRedactado | null;
  contacto: ContactoRedactado | null;
  completar: CompletarRedactado | null;
  escalera: EscaleraRedactada | null;
  error: ErrorRedactado | null;
  explicar: ExplicarRedactado | null;
  /**
   * Las salidas de los casos aparte, cuando el canon ruteó el tema ahí. Sus
   * formas son las de `X1-tabla`, `X2-figura` y `X3-respuesta-no-numerica`, y
   * son las únicas tres que este archivo no espeja: piden componentes de UI que
   * hoy no existen, así que se guardan en crudo hasta que existan.
   */
  casosAparte?: Record<string, unknown>;
};
