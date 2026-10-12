/**
 * Lo que la app recuerda del estudiante, y cómo cambia.
 *
 * Es puro a propósito: sin React, sin disco, sin leer el catálogo. Una acción y
 * un estado entran, otro estado sale; el día de hoy también entra como dato, no
 * se pregunta al reloj aquí dentro. Por eso se puede probar sin levantar la app
 * (`Andamio.tsx` es lo único que sabe de React y `almacen.ts` lo único que sabe
 * del disco).
 *
 * `adaptar.ts` ya define `Progreso`, que es lo que necesita para pintar un tema.
 * Aquí se le agrega lo que sólo importa para recordar: qué pistas ya se
 * destaparon y cuándo se cerró el círculo.
 */

import { progresoInicial, type Progreso } from '../contenido/adaptar';
import type { Materia } from '../contenido/autoria';
import { llaveDe, ORDEN_ESTACIONES, type ClaveEstacion } from '../contenido/tipos';

/** Las monedas son decoración hasta que haya en qué gastarlas; los números son provisionales. */
export const MONEDAS_POR_ESTACION = 10;
export const MONEDAS_POR_PISTA_SIN_USAR = 2;

export const SEGUNDOS_PARA_PISTA = progresoInicial.segundosParaPista;

const VERSION = 1;
const MATERIAS: Materia[] = ['matematicas', 'biologia', 'fisica', 'quimica'];

/** Por dónde va el estudiante en un tema, más lo que hace falta para recordarlo. */
export type Avance = Progreso & {
  /**
   * Cuántas pistas lleva destapadas cada ejercicio. La llave es `completar`,
   * `error` o `escalera-<escalón>`: así una pista pagada no se cobra dos veces
   * si el estudiante sale de la estación y vuelve.
   */
  pistasLiberadas: Record<string, number>;
  /** Cuándo cerró el círculo, en ISO. Sin esto, el círculo sigue abierto. */
  cerradoEn?: string;
};

export type Guardado = {
  version: number;
  /** El último tema que abrió. `null` antes de abrir el primero. */
  ultimo: { materia: Materia; numero: number } | null;
  /** Todas las que lleva ganadas, en todos los temas. */
  monedas: number;
  racha: number;
  /** El último día que hizo algo, `AAAA-MM-DD` en hora local. */
  ultimoDia: string | null;
  avances: Record<string, Avance>;
  /** Los temas con el círculo cerrado, y cuándo. Sobrevive a repasar el tema. */
  cerrados: Record<string, string>;
};

export function avanceNuevo(): Avance {
  return { ...progresoInicial, hechas: [], pistasLiberadas: {} };
}

export function guardadoInicial(): Guardado {
  return {
    version: VERSION,
    ultimo: null,
    monedas: 0,
    racha: 0,
    ultimoDia: null,
    avances: {},
    cerrados: {},
  };
}

// ---------------------------------------------------------------------------
// Días y racha
// ---------------------------------------------------------------------------

/** El día de hoy en hora local, `2026-10-06`. La zona horaria cuenta: la racha es de calendario. */
export function hoyLocal(ahora: Date = new Date()): string {
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${ahora.getFullYear()}-${dos(ahora.getMonth() + 1)}-${dos(ahora.getDate())}`;
}

/** El día anterior. Se calcula en UTC sobre la fecha ya escrita, así el cambio de horario no la mueve. */
export function ayerDe(dia: string): string {
  const [y, m, d] = dia.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
}

function tocarRacha(g: Guardado, hoy: string): Pick<Guardado, 'racha' | 'ultimoDia'> {
  if (g.ultimoDia === hoy) return { racha: g.racha, ultimoDia: hoy };
  return { racha: g.ultimoDia === ayerDe(hoy) ? g.racha + 1 : 1, ultimoDia: hoy };
}

/**
 * La racha que se muestra. Si ayer no hizo nada, la guardada ya se rompió aunque
 * nadie la haya tocado todavía: se lee en cero en vez de prometer días que no hay.
 */
export function rachaVisible(g: Guardado, hoy: string): number {
  return g.ultimoDia === hoy || g.ultimoDia === ayerDe(hoy) ? g.racha : 0;
}

// ---------------------------------------------------------------------------
// Acciones
// ---------------------------------------------------------------------------

export type Accion =
  | { tipo: 'cargar'; guardado: Guardado }
  | { tipo: 'elegir'; materia: Materia; numero: number }
  | { tipo: 'hecha'; clave: ClaveEstacion; hoy: string }
  | { tipo: 'repasarEstacion'; clave: ClaveEstacion }
  | { tipo: 'pista'; llave: string }
  | { tipo: 'siguientePregunta' }
  | { tipo: 'siguienteEscalon' }
  | { tipo: 'borrador'; texto: string }
  | { tipo: 'cerrar'; ahora: string }
  | { tipo: 'repasarTema' };

/** El avance del tema abierto, con la llave bajo la que se guarda. */
export function avanceActivo(g: Guardado): { llave: string; avance: Avance } | null {
  if (!g.ultimo) return null;
  const llave = llaveDe(g.ultimo.materia, g.ultimo.numero);
  return { llave, avance: g.avances[llave] ?? avanceNuevo() };
}

function conAvance(g: Guardado, llave: string, avance: Avance, resto: Partial<Guardado> = {}) {
  return { ...g, ...resto, avances: { ...g.avances, [llave]: avance } };
}

export function reducir(g: Guardado, accion: Accion): Guardado {
  if (accion.tipo === 'cargar') return accion.guardado;

  if (accion.tipo === 'elegir') {
    const llave = llaveDe(accion.materia, accion.numero);
    return {
      ...g,
      ultimo: { materia: accion.materia, numero: accion.numero },
      avances: g.avances[llave] ? g.avances : { ...g.avances, [llave]: avanceNuevo() },
    };
  }

  const activo = avanceActivo(g);
  if (!activo) return g;
  const { llave, avance } = activo;

  switch (accion.tipo) {
    case 'hecha': {
      // Cerrar dos veces la misma estación no paga dos veces.
      if (avance.hechas.includes(accion.clave)) return g;
      return conAvance(
        g,
        llave,
        {
          ...avance,
          hechas: [...avance.hechas, accion.clave],
          monedas: avance.monedas + MONEDAS_POR_ESTACION,
        },
        { ...tocarRacha(g, accion.hoy), monedas: g.monedas + MONEDAS_POR_ESTACION },
      );
    }

    case 'repasarEstacion': {
      // Volver a una estación hecha la empieza de nuevo: sin esto, la 2 abriría en
      // su última pregunta y la 4 en su último escalón.
      if (accion.clave === 'contacto')
        return conAvance(g, llave, { ...avance, preguntaEnCurso: 1 });
      if (accion.clave === 'escalera') return conAvance(g, llave, { ...avance, escalonEnCurso: 1 });
      return g;
    }

    case 'pista': {
      if (avance.pistasRestantes <= 0) return g;
      return conAvance(g, llave, {
        ...avance,
        pistasRestantes: avance.pistasRestantes - 1,
        pistasLiberadas: {
          ...avance.pistasLiberadas,
          [accion.llave]: (avance.pistasLiberadas[accion.llave] ?? 0) + 1,
        },
      });
    }

    case 'siguientePregunta':
      return conAvance(g, llave, { ...avance, preguntaEnCurso: avance.preguntaEnCurso + 1 });

    case 'siguienteEscalon':
      return conAvance(g, llave, { ...avance, escalonEnCurso: avance.escalonEnCurso + 1 });

    case 'borrador':
      return conAvance(g, llave, { ...avance, borrador: accion.texto });

    case 'cerrar': {
      // Sólo cierra el círculo quien lo recorrió entero, y sólo una vez.
      if (avance.cerradoEn || avance.hechas.length < ORDEN_ESTACIONES.length) return g;
      const bono = avance.pistasRestantes * MONEDAS_POR_PISTA_SIN_USAR;
      return conAvance(
        g,
        llave,
        { ...avance, monedas: avance.monedas + bono, cerradoEn: accion.ahora },
        { monedas: g.monedas + bono, cerrados: { ...g.cerrados, [llave]: accion.ahora } },
      );
    }

    case 'repasarTema':
      return conAvance(g, llave, avanceNuevo());
  }
}

// ---------------------------------------------------------------------------
// Leer lo guardado
// ---------------------------------------------------------------------------

function entero(valor: unknown, porDefecto: number, minimo: number, maximo = Infinity): number {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return porDefecto;
  return Math.min(maximo, Math.max(minimo, Math.floor(valor)));
}

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function limpiarAvance(crudo: unknown): Avance {
  const base = avanceNuevo();
  if (!esRegistro(crudo)) return base;

  const liberadas: Record<string, number> = {};
  if (esRegistro(crudo.pistasLiberadas)) {
    for (const [llave, n] of Object.entries(crudo.pistasLiberadas)) {
      liberadas[llave] = entero(n, 0, 0);
    }
  }

  const avance: Avance = {
    ...base,
    hechas: Array.isArray(crudo.hechas)
      ? ORDEN_ESTACIONES.filter((clave) => (crudo.hechas as unknown[]).includes(clave))
      : [],
    pistasRestantes: entero(crudo.pistasRestantes, base.pistasRestantes, 0, base.pistasRestantes),
    escalonEnCurso: entero(crudo.escalonEnCurso, 1, 1),
    preguntaEnCurso: entero(crudo.preguntaEnCurso, 1, 1),
    borrador: typeof crudo.borrador === 'string' ? crudo.borrador : '',
    monedas: entero(crudo.monedas, 0, 0),
    pistasLiberadas: liberadas,
  };
  // La clave sólo existe cuando hay valor, igual que después de pasar por JSON.
  if (typeof crudo.cerradoEn === 'string') avance.cerradoEn = crudo.cerradoEn;
  return avance;
}

/**
 * Lo que había en el disco, o el estado de quien llega por primera vez. Un
 * archivo roto, de otra versión o a medio escribir no tira la app: se empieza de
 * cero, que es mejor que una pantalla que no abre.
 */
export function interpretar(texto: string | null): Guardado {
  if (!texto) return guardadoInicial();
  try {
    const crudo: unknown = JSON.parse(texto);
    if (!esRegistro(crudo) || crudo.version !== VERSION) return guardadoInicial();

    const ultimo = crudo.ultimo;
    const avances: Record<string, Avance> = {};
    if (esRegistro(crudo.avances)) {
      for (const [llave, valor] of Object.entries(crudo.avances))
        avances[llave] = limpiarAvance(valor);
    }
    const cerrados: Record<string, string> = {};
    if (esRegistro(crudo.cerrados)) {
      for (const [llave, fecha] of Object.entries(crudo.cerrados)) {
        if (typeof fecha === 'string') cerrados[llave] = fecha;
      }
    }

    return {
      version: VERSION,
      ultimo:
        esRegistro(ultimo) &&
        MATERIAS.includes(ultimo.materia as Materia) &&
        typeof ultimo.numero === 'number' &&
        Number.isFinite(ultimo.numero)
          ? { materia: ultimo.materia as Materia, numero: ultimo.numero }
          : null,
      monedas: entero(crudo.monedas, 0, 0),
      racha: entero(crudo.racha, 0, 0),
      ultimoDia: typeof crudo.ultimoDia === 'string' ? crudo.ultimoDia : null,
      avances,
      cerrados,
    };
  } catch {
    return guardadoInicial();
  }
}
