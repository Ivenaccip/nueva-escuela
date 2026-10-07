// GENERADO por `node contenido/indexar.mjs`. No se edita a mano.
//
// Los temas que la app puede abrir: seis estaciones (la 3 y la 4 pueden venir del
// caso `X3-teclado`), y ninguna con `noSePuede` lleno salvo la 1, que sin video se
// publica igual. Para meter uno nuevo, se genera su JSON en `contenido/temas/` y
// se vuelve a correr el script.

import type { Materia, TemaRedactado } from './autoria';

import temario_matematicas from '../../contenido/temarios/matematicas.json';
import temario_biologia from '../../contenido/temarios/biologia.json';
import temario_quimica from '../../contenido/temarios/quimica.json';

import matematicas_1 from '../../contenido/temas/matematicas-1.json';
import matematicas_2 from '../../contenido/temas/matematicas-2.json';
import matematicas_3 from '../../contenido/temas/matematicas-3.json';
import matematicas_5 from '../../contenido/temas/matematicas-5.json';
import matematicas_6 from '../../contenido/temas/matematicas-6.json';
import matematicas_7 from '../../contenido/temas/matematicas-7.json';
import matematicas_8 from '../../contenido/temas/matematicas-8.json';
import matematicas_9 from '../../contenido/temas/matematicas-9.json';
import matematicas_11 from '../../contenido/temas/matematicas-11.json';
import matematicas_12 from '../../contenido/temas/matematicas-12.json';
import matematicas_13 from '../../contenido/temas/matematicas-13.json';
import matematicas_14 from '../../contenido/temas/matematicas-14.json';
import matematicas_17 from '../../contenido/temas/matematicas-17.json';
import matematicas_18 from '../../contenido/temas/matematicas-18.json';
import biologia_2 from '../../contenido/temas/biologia-2.json';
import biologia_3 from '../../contenido/temas/biologia-3.json';
import biologia_7 from '../../contenido/temas/biologia-7.json';
import biologia_10 from '../../contenido/temas/biologia-10.json';
import biologia_11 from '../../contenido/temas/biologia-11.json';
import biologia_12 from '../../contenido/temas/biologia-12.json';
import biologia_13 from '../../contenido/temas/biologia-13.json';
import biologia_24 from '../../contenido/temas/biologia-24.json';
import biologia_26 from '../../contenido/temas/biologia-26.json';
import biologia_33 from '../../contenido/temas/biologia-33.json';
import quimica_1 from '../../contenido/temas/quimica-1.json';
import quimica_2 from '../../contenido/temas/quimica-2.json';
import quimica_4 from '../../contenido/temas/quimica-4.json';
import quimica_9 from '../../contenido/temas/quimica-9.json';
import quimica_11 from '../../contenido/temas/quimica-11.json';
import quimica_12 from '../../contenido/temas/quimica-12.json';
import quimica_13 from '../../contenido/temas/quimica-13.json';
import quimica_14 from '../../contenido/temas/quimica-14.json';
import quimica_15 from '../../contenido/temas/quimica-15.json';
import quimica_24 from '../../contenido/temas/quimica-24.json';
import quimica_28 from '../../contenido/temas/quimica-28.json';
import quimica_31 from '../../contenido/temas/quimica-31.json';
import quimica_34 from '../../contenido/temas/quimica-34.json';

/** Lo que el temario sabe de un tema y la IA no repite. */
export type EntradaDelTemario = {
  numero: number;
  titulo: string;
  familia: string;
  quedaSabiendo: string;
};

export type MateriaDelCatalogo = {
  /** Como se lee en pantalla: "Matemáticas". */
  nombre: string;
  /** Cuántos temas tiene el temario entero, los abribles y los que no. */
  totalTemas: number;
  temario: EntradaDelTemario[];
  /** Sólo los que se pueden recorrer completos. */
  redactados: TemaRedactado[];
};

export const CATALOGO: Partial<Record<Materia, MateriaDelCatalogo>> = {
  matematicas: {
    nombre: temario_matematicas.nombre,
    totalTemas: temario_matematicas.totalTemas,
    temario: temario_matematicas.temas as unknown as EntradaDelTemario[],
    redactados: [
      matematicas_1 as unknown as TemaRedactado,
      matematicas_2 as unknown as TemaRedactado,
      matematicas_3 as unknown as TemaRedactado,
      matematicas_5 as unknown as TemaRedactado,
      matematicas_6 as unknown as TemaRedactado,
      matematicas_7 as unknown as TemaRedactado,
      matematicas_8 as unknown as TemaRedactado,
      matematicas_9 as unknown as TemaRedactado,
      matematicas_11 as unknown as TemaRedactado,
      matematicas_12 as unknown as TemaRedactado,
      matematicas_13 as unknown as TemaRedactado,
      matematicas_14 as unknown as TemaRedactado,
      matematicas_17 as unknown as TemaRedactado,
      matematicas_18 as unknown as TemaRedactado,
    ],
  },
  biologia: {
    nombre: temario_biologia.nombre,
    totalTemas: temario_biologia.totalTemas,
    temario: temario_biologia.temas as unknown as EntradaDelTemario[],
    redactados: [
      biologia_2 as unknown as TemaRedactado,
      biologia_3 as unknown as TemaRedactado,
      biologia_7 as unknown as TemaRedactado,
      biologia_10 as unknown as TemaRedactado,
      biologia_11 as unknown as TemaRedactado,
      biologia_12 as unknown as TemaRedactado,
      biologia_13 as unknown as TemaRedactado,
      biologia_24 as unknown as TemaRedactado,
      biologia_26 as unknown as TemaRedactado,
      biologia_33 as unknown as TemaRedactado,
    ],
  },
  quimica: {
    nombre: temario_quimica.nombre,
    totalTemas: temario_quimica.totalTemas,
    temario: temario_quimica.temas as unknown as EntradaDelTemario[],
    redactados: [
      quimica_1 as unknown as TemaRedactado,
      quimica_2 as unknown as TemaRedactado,
      quimica_4 as unknown as TemaRedactado,
      quimica_9 as unknown as TemaRedactado,
      quimica_11 as unknown as TemaRedactado,
      quimica_12 as unknown as TemaRedactado,
      quimica_13 as unknown as TemaRedactado,
      quimica_14 as unknown as TemaRedactado,
      quimica_15 as unknown as TemaRedactado,
      quimica_24 as unknown as TemaRedactado,
      quimica_28 as unknown as TemaRedactado,
      quimica_31 as unknown as TemaRedactado,
      quimica_34 as unknown as TemaRedactado,
    ],
  },
};
