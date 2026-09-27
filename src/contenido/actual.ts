/**
 * El tema que las pantallas están mostrando ahora mismo.
 *
 * Aquí se junta todo: el contenido redactado que salió de la API, el temario
 * que dice qué tema es y de cuántos, y el progreso del estudiante. Lo que sale
 * es un `Tema` de `tipos.ts`, que es lo único que las pantallas conocen.
 *
 * Es el reemplazo de `demo.ts`. El relleno del diseño sigue ahí y sirve de
 * respaldo: si el tema elegido no tiene contenido generado, se muestra el demo
 * en vez de una pantalla vacía.
 *
 * Todavía no hay forma de escoger tema desde la app ni de guardar el progreso:
 * falta la navegación y falta dónde persistirlo. Mientras tanto, se cambia
 * `TEMA_ACTIVO` y se recarga.
 */

import { adaptar, progresoInicial, type DelTemario, type Progreso } from './adaptar';
import type { TemaRedactado } from './autoria';
import { perfil as perfilDemo, tema as temaDemo } from './demo';
import type { ClaveEstacion, Perfil, Tema } from './tipos';

import temario from '../../contenido/temarios/matematicas.json';
import t1 from '../../contenido/temas/matematicas-1.json';
import t3 from '../../contenido/temas/matematicas-3.json';
import t5 from '../../contenido/temas/matematicas-5.json';
import t7 from '../../contenido/temas/matematicas-7.json';
import t8 from '../../contenido/temas/matematicas-8.json';
import t9 from '../../contenido/temas/matematicas-9.json';
import t13 from '../../contenido/temas/matematicas-13.json';
import t14 from '../../contenido/temas/matematicas-14.json';
import t17 from '../../contenido/temas/matematicas-17.json';
import t18 from '../../contenido/temas/matematicas-18.json';

/**
 * Los diez de Matemáticas que tienen las seis estaciones. Los otros diez del
 * temario esperan componentes de UI que no existen (recta numérica, tabla,
 * teclado de fichas), así que no se cargan: pesarían en el bundle sin poder
 * abrirse.
 *
 * Se importan uno por uno a propósito. Metro empaqueta lo que ve escrito, así
 * que no hay forma de cargar una carpeta entera sin un plugin.
 */
const GENERADOS = [t1, t3, t5, t7, t8, t9, t13, t14, t17, t18] as unknown as TemaRedactado[];

/** Cuál se muestra. Se cambia aquí mientras no haya pantalla para escogerlo. */
export const TEMA_ACTIVO = 9;

type TemaDelTemario = {
  numero: number;
  titulo: string;
  familia: string;
  quedaSabiendo: string;
};

const catalogo = temario as unknown as {
  nombre: string;
  totalTemas: number;
  temas: TemaDelTemario[];
};

function delTemarioDe(numero: number): DelTemario | null {
  const t = catalogo.temas.find((x) => x.numero === numero);
  if (!t) return null;
  return {
    indice: t.numero,
    total: catalogo.totalTemas,
    familia: t.familia,
    quedaSabiendo: t.quedaSabiendo,
    materiaNombre: catalogo.nombre,
  };
}

/** Arma el tema pedido. Devuelve `null` si no hay contenido generado para él. */
export function armarTema(
  numero: number,
  progreso: Progreso = progresoInicial,
): { tema: Tema; faltan: ClaveEstacion[] } | null {
  const redactado = GENERADOS.find((t) => t.temaNumero === numero);
  const delTemario = delTemarioDe(numero);
  if (!redactado || !delTemario) return null;
  return adaptar(redactado, delTemario, progreso);
}

const armado = armarTema(TEMA_ACTIVO);

/**
 * Lo que importan las pantallas. Si el tema activo no tiene contenido, cae al
 * relleno del diseño: vale más ver la interfaz con el ejemplo de siempre que
 * una pantalla en blanco.
 */
export const tema: Tema = armado?.tema ?? temaDemo;

/** Las estaciones sin contenido generado. El círculo las deja cerradas. */
export const faltan: ClaveEstacion[] = armado?.faltan ?? [];

/** Es contenido generado y no el relleno del diseño. */
export const esContenidoReal = armado !== null;

/**
 * El perfil sigue siendo de relleno: la racha y las monedas son estado del
 * estudiante y no hay dónde guardarlas todavía.
 */
export const perfil: Perfil = perfilDemo;
