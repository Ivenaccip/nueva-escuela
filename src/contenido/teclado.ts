/**
 * El caso `X3-teclado`: un tema cuya respuesta no cabe en las doce teclas de
 * dígitos elige otro teclado (fichas, opciones o texto) y escribe con él la
 * estación 3 y los escalones de la 4.
 *
 * El generador guarda esa salida en crudo en `casosAparte['X3-teclado']`. Aquí y
 * sólo aquí se vuelve lo que las pantallas ya saben calificar: una
 * `CompletarRedactado` y una `EscaleraRedactada` que además llevan su `entrada`.
 * Es una función pura, sin React: se prueba sin levantar la app.
 */

import type {
  ComoSeCompara,
  CompletarRedactado,
  EntradaRedactada,
  EscalonRedactado,
  EscaleraRedactada,
  Ficha,
  Materia,
  NoSePuede,
  OpcionDeRespuesta,
  Pista,
  RespuestaTecleada,
  TecladoDelTema,
  TemaRedactado,
} from './autoria';
import type { EntradaDePantalla, ParteMat } from './tipos';

/** La clave bajo la que `generar.mjs` guarda la salida del caso. */
export const CLAVE_X3 = 'X3-teclado';

/** Lo que el modelo escribe como respuesta del hueco, antes de adaptarlo. */
type RespuestaCruda = {
  correcta: string;
  enAtomos?: ParteMat[];
  comoSeLee: string;
  aceptaTambien?: string[];
  opciones?: OpcionDeRespuesta[];
};

/** La salida de `X3-respuesta-no-numerica`, tal como se guarda. */
export type CasoTecladoCrudo = {
  teclado: TecladoDelTema;
  fichas?: Ficha[];
  comoSeCompara?: Partial<ComoSeCompara>;
  completar: {
    pasoDelCanon: number;
    expresion: ParteMat[];
    respuesta: RespuestaCruda;
    pistas: Pista[];
    siTecleaElError?: { tecleado: string; queSeLeDice: string } | null;
  };
  escalera: {
    situacion: string;
    expresion: ParteMat[];
    pregunta: string;
    respuesta: RespuestaCruda;
    pistas: Pista[];
  }[];
  noSePuede: NoSePuede;
};

/** Teclado de dígitos con comparación exacta: lo que hay cuando el tema no trae nada. */
export const ENTRADA_DE_DIGITOS: EntradaRedactada = {
  teclado: 'digitos',
  fichas: [],
  comoSeCompara: { ignoraMayusculas: false, ignoraAcentos: false, ignoraEspaciosDeMas: false },
};

/** ¿El tema trae un caso de teclado que se pueda servir? */
export function casoDeTeclado(tema: TemaRedactado): CasoTecladoCrudo | null {
  const caso = tema.casosAparte?.[CLAVE_X3] as CasoTecladoCrudo | undefined;
  if (!caso || caso.noSePuede) return null;
  if (!caso.completar || !Array.isArray(caso.escalera) || caso.escalera.length === 0) return null;
  return caso;
}

function entradaDe(caso: CasoTecladoCrudo): EntradaRedactada {
  return {
    teclado: caso.teclado,
    fichas: caso.teclado === 'fichas' ? (caso.fichas ?? []) : [],
    comoSeCompara: { ...ENTRADA_DE_DIGITOS.comoSeCompara, ...caso.comoSeCompara },
  };
}

function respuestaDe(cruda: RespuestaCruda): RespuestaTecleada {
  return {
    tecleado: cruda.correcta,
    aceptaTambien: cruda.aceptaTambien ?? [],
    comoSeLee: cruda.comoSeLee,
    enAtomos: cruda.enAtomos,
    opciones: cruda.opciones && cruda.opciones.length > 0 ? cruda.opciones : undefined,
  };
}

/** Una copia del tema con la estación 3 y la 4 escritas con el teclado del caso. */
export function aplicarTeclado(tema: TemaRedactado): TemaRedactado {
  const caso = casoDeTeclado(tema);
  if (!caso) return tema;

  const entrada = entradaDe(caso);
  const base = { temaNumero: tema.temaNumero, materia: tema.materia as Materia };

  const completar: CompletarRedactado = {
    ...base,
    pasoDelCanon: caso.completar.pasoDelCanon,
    queFalta: '',
    expresion: caso.completar.expresion,
    respuesta: respuestaDe(caso.completar.respuesta),
    pistas: caso.completar.pistas,
    siTecleaElError: caso.completar.siTecleaElError ?? null,
    entrada,
    noSePuede: null,
  };

  const escalones: EscalonRedactado[] = caso.escalera.map((e) => ({
    situacion: e.situacion,
    expresion: e.expresion,
    pregunta: e.pregunta,
    respuesta: respuestaDe(e.respuesta),
    pistas: e.pistas,
    pasoDelCanon: caso.completar.pasoDelCanon,
    esInverso: false,
    entrada,
  }));
  const escalera: EscaleraRedactada = { ...base, escalones, noSePuede: null };

  return { ...tema, completar, escalera };
}

/**
 * Lo que la pantalla necesita del teclado, sin la respuesta. Un tema sin
 * `entrada` es de dígitos.
 */
export function entradaDePantalla(
  entrada: EntradaRedactada | undefined,
  respuesta: RespuestaTecleada,
): EntradaDePantalla {
  switch (entrada?.teclado) {
    case 'fichas':
      return { modo: 'fichas', fichas: entrada.fichas };
    case 'opciones':
      return { modo: 'opciones', opciones: (respuesta.opciones ?? []).map((o) => o.etiqueta) };
    case 'texto':
      return { modo: 'texto' };
    default:
      return { modo: 'digitos' };
  }
}
