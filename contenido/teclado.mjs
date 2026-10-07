// Lo que el caso `X3-teclado` tiene que cumplir además de validar contra su esquema.
//
// El esquema dice si la forma está bien. Esto dice si el teclado sirve: cosas que
// validan perfecto y dejan un hueco que nadie puede llenar (una `correcta` con una
// ficha que no existe), una opción de más, o un `enAtomos` que pinta otra cosa
// distinta de lo que se teclea.
//
// Lo comparten `generar.mjs` (antes de guardar: lo que encuentra se devuelve al
// modelo en la vuelta de corrección), `indexar.mjs` y `tanda.mjs` (sobre lo ya
// guardado) y `auditar.mjs`. Son funciones puras: no leen ni escriben nada.
//
// El teclado en sí vive en `src/componentes/Teclado.tsx`, y cómo se califica lo
// tecleado en `src/contenido/calificar.ts`. Aquí sólo se espeja lo imprescindible.

import { resultadoSinCifra } from './forma.mjs';

/** La clave bajo la que `generar.mjs` guarda la salida, en `casosAparte`. */
export const CLAVE_X3 = 'X3-teclado';

export const TECLADOS = ['digitos', 'fichas', 'opciones', 'texto'];

/** Con 15 fichas y borrar son 16 celdas: la cuadrícula de 4x4 de `Teclado.tsx`. */
export const MIN_FICHAS = 3;
export const MAX_FICHAS = 15;

/** Es el tope de `correcta` en el esquema y de `MAXIMO_ESCRITO` en `Teclado.tsx`. */
const MAX_ESCRITO = 24;

/** Lo que escribe el teclado de dígitos: un entero o una fracción. */
const TECLEABLE = /^[0-9]+(\/[0-9]+)?$/;

const SIN_REGLA = { ignoraMayusculas: false, ignoraAcentos: false, ignoraEspaciosDeMas: false };

// ---------------------------------------------------------------------------
// El ruteo
// ---------------------------------------------------------------------------

/**
 * A qué caso aparte manda el canon al tema (CONTRATO.md §3), o `null` si el tema va
 * por 03-completar y 04-escalera.
 *
 * Un canon que se llama `numero` o `fraccion` y no trae ni una cifra en su resultado
 * es en realidad una frase (el sondeo de Biología encontró varios): se rutea a X3 en
 * vez de pedir dígitos que nadie puede teclear.
 */
export function casoDelCanon(canon) {
  if (!canon) return null;
  if (canon.notacion === 'tabla') return 'X1-tabla';
  if (canon.notacion === 'figura') return 'X2-figura';
  if (canon.formaDeRespuesta === 'trazo') return 'X2-figura';
  if (canon.formaDeRespuesta === 'palabra' || canon.formaDeRespuesta === 'expresion') {
    return CLAVE_X3;
  }
  if (resultadoSinCifra(canon)) return CLAVE_X3;
  return null;
}

/**
 * El `noSePuede` del canon, si todavía vale.
 *
 * Los canon escritos cuando el único teclado era el de dígitos llenaron `noSePuede`
 * por regla en cuanto la respuesta era una `palabra` o una `expresion` («el teclado
 * no tiene letras»). Con los cuatro teclados eso ya no es un límite: el tema se rutea
 * a X3 y ese aviso quedó viejo. Cualquier otro `noSePuede` sigue valiendo.
 */
export function noSePuedeVigente(canon) {
  if (!canon?.noSePuede) return null;
  const esDelTecladoViejo =
    canon.notacion === 'lineal' &&
    (canon.formaDeRespuesta === 'palabra' || canon.formaDeRespuesta === 'expresion');
  return esDelTecladoViejo ? null : canon.noSePuede;
}

/** El caso X3 guardado en el tema, o `null`. */
export const casoDeTeclado = (tema) => tema?.casosAparte?.[CLAVE_X3] ?? null;

// ---------------------------------------------------------------------------
// Armar, aplanar y comparar
// ---------------------------------------------------------------------------

/**
 * ¿Se puede escribir `cadena` tocando fichas? Programación dinámica y no un recorrido
 * voraz, porque hay etiquetas que son prefijo de otras: con `C` y `Ca`, «CaCl2» se
 * arma de una manera y un recorrido que se come la `C` primero se atora en `a`.
 */
export function seArma(cadena, etiquetas) {
  const n = cadena.length;
  if (n === 0) return false;
  const llega = new Array(n + 1).fill(false);
  llega[0] = true;
  for (let i = 0; i < n; i += 1) {
    if (!llega[i]) continue;
    for (const e of etiquetas) {
      if (typeof e === 'string' && e.length > 0 && cadena.startsWith(e, i)) llega[i + e.length] = true;
    }
  }
  return llega[n];
}

const sinEspacios = (s) => s.replace(/\s+/g, '').replace(/[−–—]/g, '-');
const plegar = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Lo que dice `enAtomos` una vez aplanado: `valor` + `sub` + `sup`, y también
 * `valor` + `sup` + `sub`, porque quien lo escribe no sabe en qué orden lo lee quien
 * teclea (`C` con 12 arriba y 6 abajo es «C126» o «C612»). Una fracción apilada se
 * aplana a `a/b`, que es lo que da el teclado. Sin espacios.
 */
export function aplanar(partes) {
  let candidatos = [''];
  for (const p of partes ?? []) {
    let opciones;
    if (p?.tipo === 'texto') opciones = [String(p.valor ?? '')];
    else if (p?.tipo === 'fraccion') opciones = [`${p.arriba}/${p.abajo}`];
    else if (p?.tipo === 'simbolo') {
      opciones = [
        ...new Set([
          `${p.valor ?? ''}${p.sub ?? ''}${p.sup ?? ''}`,
          `${p.valor ?? ''}${p.sup ?? ''}${p.sub ?? ''}`,
        ]),
      ];
    } else opciones = [''];
    candidatos = candidatos.flatMap((c) => opciones.map((o) => c + o)).slice(0, 64);
  }
  return candidatos.map(sinEspacios);
}

/**
 * Lo tecleado, listo para comparar: el mismo cálculo que `normalizar` de
 * `src/contenido/calificar.ts`. Con un teclado que no es de texto, `regla` es
 * `undefined` y la comparación es exacta salvo los espacios, el menos y los ceros.
 */
export function normalizarComoLaApp(tecleado, regla) {
  let limpio = tecleado.replace(/[−–—]/g, '-');
  if (regla?.ignoraEspaciosDeMas) limpio = limpio.trim().replace(/\s+/g, ' ');
  else if (!regla) limpio = limpio.replace(/\s+/g, '');
  if (regla?.ignoraMayusculas) limpio = limpio.toLowerCase();
  if (regla?.ignoraAcentos) limpio = limpio.normalize('NFD').replace(/[̀-ͯ]/g, '');
  const sinCeros = limpio.split('/').map((p) => p.replace(/^(-?)0+(?=\d)/, '$1'));
  if (sinCeros.length === 2 && sinCeros[1] === '1') return sinCeros[0];
  return sinCeros.join('/');
}

const escaparParaRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** ¿`texto` trae `buscada` como palabra suelta, sin pegarse a letras ni cifras? */
function traeLiteral(texto, buscada) {
  const re = new RegExp(
    `(?<![\\p{L}\\p{N}])${escaparParaRegex(buscada)}(?![\\p{L}\\p{N}])`,
    'iu',
  );
  return re.test(texto);
}

// ---------------------------------------------------------------------------
// Los «exactamente uno» que el esquema no puede expresar
// ---------------------------------------------------------------------------

/** El renglón que mira cada hueco y cada respuesta de las estaciones 3 y 4. */
const sitios = (caso) => [
  ['completar', caso?.completar],
  ...(Array.isArray(caso?.escalera) ? caso.escalera : []).map((e, i) => [`escalera[${i}]`, e]),
];

/**
 * Cada renglón con un solo hueco y, con el teclado `opciones`, cada respuesta con una
 * sola opción correcta. Mismo formato que `UNO_SOLO` de `generar.mjs`: `[dónde,
 * cuántos, campo]`, y está mal todo lo que no sea 1.
 */
export function unoSoloDeTeclado(caso) {
  if (!caso || caso.noSePuede) return [];
  const filas = [];
  for (const [donde, e] of sitios(caso)) {
    if (!e) continue;
    const huecos = (Array.isArray(e.expresion) ? e.expresion : []).filter(
      (p) => p?.tipo === 'hueco',
    ).length;
    filas.push([`${donde}.expresion`, huecos, 'hueco']);
    if (caso.teclado === 'opciones') {
      const buenas = (Array.isArray(e.respuesta?.opciones) ? e.respuesta.opciones : []).filter(
        (o) => o?.esCorrecta,
      ).length;
      filas.push([`${donde}.respuesta.opciones`, buenas, 'esCorrecta']);
    }
  }
  return filas;
}

// ---------------------------------------------------------------------------
// La comprobación
// ---------------------------------------------------------------------------

/**
 * Todo lo que tiene que cumplir un caso X3 que va a servirse, además del esquema.
 * Devuelve una lista de frases, una por problema: vacía si está bien. Con
 * `noSePuede` lleno devuelve vacía: ese tema no se publica, y exigirle un teclado
 * impecable sólo gastaría una corrección en algo que nadie va a ver.
 *
 * Los mensajes dicen qué campo está mal y qué hacer, porque el generador se los
 * devuelve al modelo tal cual.
 */
export function problemasDeTeclado(caso) {
  if (!caso || typeof caso !== 'object') return ['el caso no es un objeto'];
  if (caso.noSePuede) return [];

  const malos = [];
  const teclado = caso.teclado;
  if (!TECLADOS.includes(teclado)) {
    return [`teclado "${teclado}" no es uno de ${TECLADOS.join(', ')}`];
  }

  // Las fichas
  const fichas = Array.isArray(caso.fichas) ? caso.fichas : [];
  const etiquetas = fichas.map((f) => f?.etiqueta);
  if (teclado === 'fichas') {
    if (fichas.length < MIN_FICHAS || fichas.length > MAX_FICHAS) {
      malos.push(
        `fichas: hay ${fichas.length} y con teclado "fichas" tienen que ser de ${MIN_FICHAS} a ` +
          `${MAX_FICHAS}. Con más de ${MAX_FICHAS} el tema no cabe: llena noSePuede.`,
      );
    }
    const vistas = new Set();
    for (const [i, e] of etiquetas.entries()) {
      if (typeof e !== 'string' || !/^\S{1,4}$/.test(e)) {
        malos.push(`fichas[${i}]: la etiqueta ${JSON.stringify(e)} tiene que ser de 1 a 4 caracteres sin espacios`);
      } else if (vistas.has(e)) {
        malos.push(`fichas[${i}]: la etiqueta "${e}" está repetida`);
      } else vistas.add(e);
    }
  } else if (fichas.length > 0) {
    malos.push(`fichas: con teclado "${teclado}" tiene que ir vacío y trae ${fichas.length}`);
  }

  // Lo que perdona la comparación: sólo el teclado de texto decide algo.
  const regla = teclado === 'texto' ? { ...SIN_REGLA, ...caso.comoSeCompara } : undefined;
  const igual = (a, b) => normalizarComoLaApp(a, regla) === normalizarComoLaApp(b, regla);

  /** Que lo escrito se pueda producir con el teclado elegido. */
  const sePuedeEscribir = (cadena, donde) => {
    if (typeof cadena !== 'string' || cadena.length === 0) {
      malos.push(`${donde}: está vacío`);
    } else if (cadena.length > MAX_ESCRITO) {
      malos.push(`${donde}: "${cadena}" mide ${cadena.length} y el hueco aguanta ${MAX_ESCRITO}`);
    } else if (teclado === 'digitos' && !TECLEABLE.test(cadena)) {
      malos.push(
        `${donde}: "${cadena}" no casa con ^[0-9]+(/[0-9]+)?$. Con teclado "digitos" sólo se ` +
          'escriben dígitos y una diagonal; si la respuesta necesita otro carácter, el teclado es "fichas".',
      );
    } else if (teclado === 'fichas' && !seArma(cadena, etiquetas)) {
      const pista =
        cadena.includes('-') && etiquetas.includes('−')
          ? ' El menos es − (U+2212), no un guion.'
          : '';
      malos.push(
        `${donde}: "${cadena}" no se puede armar con las fichas del tema (${etiquetas.join(' ')}). ` +
          `Añade a fichas la que falta (hasta ${MAX_FICHAS}) o cambia lo que se pide.${pista}`,
      );
    }
  };

  // Cada hueco: el de la 3 y el de cada escalón
  for (const [donde, e] of sitios(caso)) {
    if (!e || typeof e !== 'object') {
      malos.push(`${donde}: falta`);
      continue;
    }
    const r = e.respuesta;
    if (!r || typeof r !== 'object') {
      malos.push(`${donde}.respuesta: falta`);
      continue;
    }
    const correcta = r.correcta;
    const acepta = Array.isArray(r.aceptaTambien) ? r.aceptaTambien : [];
    const opciones = Array.isArray(r.opciones) ? r.opciones : [];

    if (teclado === 'opciones') {
      if (opciones.length < 2 || opciones.length > 4) {
        malos.push(`${donde}.respuesta.opciones: hay ${opciones.length} y con teclado "opciones" tienen que ser de 2 a 4`);
      }
      const etiquetasDeOpciones = opciones.map((o) => o?.etiqueta);
      if (new Set(etiquetasDeOpciones).size !== etiquetasDeOpciones.length) {
        malos.push(`${donde}.respuesta.opciones: dos opciones tienen la misma etiqueta`);
      }
      const buenas = opciones.filter((o) => o?.esCorrecta);
      if (buenas.length === 1 && buenas[0].etiqueta !== correcta) {
        malos.push(
          `${donde}.respuesta.correcta es "${correcta}" y la opción correcta se llama ` +
            `"${buenas[0].etiqueta}": tienen que ser la misma, letra por letra`,
        );
      }
      const equivocadas = new Set(opciones.filter((o) => !o?.esCorrecta).map((o) => o?.etiqueta));
      for (const a of acepta) {
        if (equivocadas.has(a)) {
          malos.push(`${donde}.respuesta.aceptaTambien: "${a}" es la etiqueta de una opción equivocada`);
        }
      }
    } else {
      if (opciones.length > 0) {
        malos.push(`${donde}.respuesta.opciones: con teclado "${teclado}" tiene que ir vacío y trae ${opciones.length}`);
      }
      sePuedeEscribir(correcta, `${donde}.respuesta.correcta`);
      acepta.forEach((a, i) => sePuedeEscribir(a, `${donde}.respuesta.aceptaTambien[${i}]`));
    }

    // Lo que se pinta una vez contestada tiene que ser lo que se tecleó.
    if (Array.isArray(r.enAtomos) && r.enAtomos.length > 0 && typeof correcta === 'string') {
      const candidatos = aplanar(r.enAtomos);
      const metas = [correcta, ...acepta].filter((m) => typeof m === 'string');
      const coincide =
        teclado === 'digitos' || teclado === 'fichas'
          ? (c, m) => c === sinEspacios(m)
          : (c, m) => plegar(c) === plegar(sinEspacios(m));
      if (!candidatos.some((c) => metas.some((m) => coincide(c, m)))) {
        malos.push(
          `${donde}.respuesta.enAtomos aplanado da "${candidatos[0]}" y la respuesta es ` +
            `"${correcta}": lo que se pinta tiene que ser lo que se teclea (valor + sub + sup, sin espacios)`,
        );
      }
    }

    // La tercera pista casi la da, pero no la escribe.
    const tercera = e.pistas?.[2]?.texto;
    if (typeof tercera === 'string' && typeof correcta === 'string' && correcta.length >= 3) {
      if (traeLiteral(tercera, correcta)) {
        malos.push(
          `${donde}.pistas[2] escribe la respuesta ("${correcta}"): la tercera pista deja un solo ` +
            'movimiento por hacer, no lo hace por el estudiante',
        );
      }
    }
  }

  // El error típico que se le contesta al estudiante en la estación 3
  const error = caso.completar?.siTecleaElError;
  if (error && typeof error === 'object') {
    const donde = 'completar.siTecleaElError.tecleado';
    const correcta = caso.completar?.respuesta?.correcta;
    const acepta = Array.isArray(caso.completar?.respuesta?.aceptaTambien)
      ? caso.completar.respuesta.aceptaTambien
      : [];
    // Con `opciones` no se teclea: lo que sale de equivocarse es el `queRevela` de cada opción.
    if (teclado !== 'opciones') sePuedeEscribir(error.tecleado, donde);
    if (typeof error.tecleado === 'string' && typeof correcta === 'string') {
      if (igual(error.tecleado, correcta)) {
        malos.push(`${donde}: "${error.tecleado}" es la respuesta correcta; tiene que ser el error típico, otra cosa`);
      }
      for (const a of acepta) {
        if (typeof a === 'string' && igual(error.tecleado, a)) {
          malos.push(`${donde}: "${error.tecleado}" es una de las aceptaTambien; el error típico nunca cuenta como bien`);
        }
      }
    }
  }

  // Cada renglón con su hueco, y cada respuesta con su opción buena
  for (const [donde, cuantos, campo] of unoSoloDeTeclado(caso)) {
    if (cuantos !== 1) malos.push(`${donde}: hay ${cuantos} con ${campo} y tiene que haber exactamente 1`);
  }

  return malos;
}
