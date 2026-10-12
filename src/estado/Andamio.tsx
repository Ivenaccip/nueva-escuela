/**
 * El estado de la app, repartido a las pantallas.
 *
 * Aquí se juntan las tres cosas que antes vivían separadas o no vivían: el
 * contenido que sale de la API (`biblioteca`), lo que el estudiante lleva hecho
 * (`modelo`) y el disco donde se guarda (`almacen`). Las pantallas sólo hablan
 * con `useAndamio()`: piden el tema y avisan lo que pasó, sin saber de dónde
 * sale ni dónde queda.
 */

import { Redirect } from 'expo-router';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, Text, View } from 'react-native';

import type { Materia } from '../contenido/autoria';
import {
  armarTema,
  materiasAbribles,
  primerTema,
  redactadoDe,
  type MateriaAbrible,
  type TemaJugable,
} from '../contenido/biblioteca';
import { llaveDe, type ClaveEstacion, type Perfil, type Tema } from '../contenido/tipos';
import { colores, fuentes } from '../tema';
import { escribir, leer } from './almacen';
import {
  avanceNuevo,
  guardadoInicial,
  hoyLocal,
  rachaVisible,
  reducir,
  type Avance,
  type Guardado,
} from './modelo';

/** Cuánto se espera para escribir en el disco: lo bastante para no guardar cada tecla. */
const ESPERA_DE_GUARDADO = 300;

type Acciones = {
  elegirTema: (materia: Materia, numero: number) => void;
  /** Cierra una estación. Repetirla no paga dos veces. */
  marcarHecha: (clave: ClaveEstacion) => void;
  repasarEstacion: (clave: ClaveEstacion) => void;
  /** Destapa una pista y la descuenta. `llave` es el ejercicio: `completar`, `error`, `escalera-2`. */
  gastarPista: (llave: string) => void;
  siguientePregunta: () => void;
  siguienteEscalon: () => void;
  guardarBorrador: (texto: string) => void;
  cerrarTema: () => void;
  repasarTema: () => void;
};

type Valor = Acciones & {
  /** El tema abierto, armado con lo que lleva hecho. Es lo único que las pantallas pintan. */
  tema: Tema;
  /** El contenido redactado del mismo tema: lo que hace falta para calificar. */
  redactado: TemaJugable;
  avance: Avance;
  materia: Materia;
  numero: number;
  /** Racha y monedas de siempre, no las del tema. */
  perfil: Pick<Perfil, 'racha' | 'monedas'>;
  materias: MateriaAbrible[];
  /** Cuándo se cerró el círculo de ese tema, si alguna vez se cerró. */
  cerradoEn: (materia: Materia, numero: number) => string | undefined;
  /** Cuántas estaciones lleva hechas de ese tema, de 0 a 6. */
  hechasDe: (materia: Materia, numero: number) => number;
};

const Contexto = createContext<Valor | null>(null);

export function useAndamio(): Valor {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useAndamio se usa dentro de <AndamioProvider>.');
  return valor;
}

/**
 * Lo que había en el disco, con un tema abierto garantizado. Si el último que se
 * abrió ya no está en el catálogo (se regeneró) o nunca se abrió ninguno, se cae
 * al primero: el reductor sólo actúa sobre el tema abierto, y sin uno la primera
 * estación que se cerrara no se anotaría.
 */
function conTemaAbierto(g: Guardado): Guardado {
  if (g.ultimo && redactadoDe(g.ultimo.materia, g.ultimo.numero)) return g;
  const primero = primerTema();
  return primero ? reducir(g, { tipo: 'elegir', ...primero }) : g;
}

export function AndamioProvider({ children }: { children: ReactNode }) {
  const [guardado, despachar] = useReducer(reducir, undefined, guardadoInicial);
  const [cargado, setCargado] = useState(false);

  // Lo último que hay, para guardarlo de golpe cuando la app se va al fondo sin
  // esperar a que corra el temporizador.
  const ultimo = useRef(guardado);
  useEffect(() => {
    ultimo.current = guardado;
  }, [guardado]);

  useEffect(() => {
    let vigente = true;
    leer().then((g) => {
      if (!vigente) return;
      despachar({ tipo: 'cargar', guardado: conTemaAbierto(g) });
      setCargado(true);
    });
    return () => {
      vigente = false;
    };
  }, []);

  useEffect(() => {
    // Antes de cargar, `guardado` es el estado vacío: escribirlo borraría lo que hay.
    if (!cargado) return;
    const temporizador = setTimeout(() => escribir(guardado), ESPERA_DE_GUARDADO);
    return () => clearTimeout(temporizador);
  }, [guardado, cargado]);

  useEffect(() => {
    if (!cargado) return;
    const suscripcion = AppState.addEventListener('change', (estado) => {
      if (estado !== 'active') escribir(ultimo.current);
    });
    return () => suscripcion.remove();
  }, [cargado]);

  const abierto = guardado.ultimo;

  const avance = useMemo<Avance>(
    () => (abierto && guardado.avances[llaveDe(abierto.materia, abierto.numero)]) || avanceNuevo(),
    [guardado.avances, abierto],
  );

  const armado = useMemo(
    () => (abierto ? armarTema(abierto.materia, abierto.numero, avance) : null),
    [abierto, avance],
  );
  const redactado = abierto ? redactadoDe(abierto.materia, abierto.numero) : null;

  // Estables a propósito: una pantalla puede usarlas en un efecto (la 6 guarda su
  // borrador al desmontarse) sin que se vuelva a ejecutar con cada cambio de estado.
  const acciones = useMemo<Acciones>(
    () => ({
      elegirTema: (materia, numero) => despachar({ tipo: 'elegir', materia, numero }),
      marcarHecha: (clave) => despachar({ tipo: 'hecha', clave, hoy: hoyLocal() }),
      repasarEstacion: (clave) => despachar({ tipo: 'repasarEstacion', clave }),
      gastarPista: (llave) => despachar({ tipo: 'pista', llave }),
      siguientePregunta: () => despachar({ tipo: 'siguientePregunta' }),
      siguienteEscalon: () => despachar({ tipo: 'siguienteEscalon' }),
      guardarBorrador: (texto) => despachar({ tipo: 'borrador', texto }),
      cerrarTema: () => despachar({ tipo: 'cerrar', ahora: new Date().toISOString() }),
      repasarTema: () => despachar({ tipo: 'repasarTema' }),
    }),
    [],
  );

  const hoy = hoyLocal();

  const valor = useMemo<Valor | null>(() => {
    if (!armado || !abierto || !redactado) return null;
    return {
      ...acciones,
      tema: armado.tema,
      redactado,
      avance,
      materia: abierto.materia,
      numero: abierto.numero,
      perfil: { racha: rachaVisible(guardado, hoy), monedas: guardado.monedas },
      materias: materiasAbribles(),
      cerradoEn: (m, n) => guardado.cerrados[llaveDe(m, n)],
      hechasDe: (m, n) => guardado.avances[llaveDe(m, n)]?.hechas.length ?? 0,
    };
  }, [acciones, armado, abierto, redactado, avance, guardado, hoy]);

  // Sin esto el primer cuadro saldría con el estado vacío y saltaría al leer el disco.
  if (!cargado) return <View style={{ flex: 1, backgroundColor: colores.fondo }} />;

  if (!valor) {
    return (
      <View
        style={{ flex: 1, backgroundColor: colores.fondo, justifyContent: 'center', padding: 24 }}
      >
        <Text style={{ fontFamily: fuentes.cuerpo, fontSize: 16, color: colores.textoSuave }}>
          No hay ningún tema listo. Genera contenido con contenido/generar.mjs y corre
          contenido/indexar.mjs.
        </Text>
      </View>
    );
  }

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

/**
 * Deja pasar sólo a quien ya llegó hasta esa estación. El círculo se recorre en
 * orden, y una dirección escrita a mano (o una pestaña vieja del navegador) no
 * debe saltárselo: la estación 5 sin haber visto la 3 no tiene sentido.
 */
export function Guardia({ clave, children }: { clave: ClaveEstacion; children: ReactNode }) {
  const { tema } = useAndamio();
  const estacion = tema.estaciones.find((e) => e.clave === clave);
  if (!estacion || estacion.estado === 'cerrada') return <Redirect href="/" />;
  return <>{children}</>;
}

/** El cierre sólo se abre cuando el círculo está cerrado de verdad. */
export function GuardiaDelCierre({ children }: { children: ReactNode }) {
  const { avance } = useAndamio();
  if (!avance.cerradoEn) return <Redirect href="/" />;
  return <>{children}</>;
}
