import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ParteMat } from '../contenido/tipos';
import { colores, fuentes, radios } from '../tema';
import { Fraccion } from './Fraccion';

type Props = {
  partes: ParteMat[];
  /** Tamaño del texto suelto; las fracciones salen proporcionales. */
  tamano?: number;
  color?: string;
  /** Fuente del texto suelto. Los enunciados van en display; lo demás en cuerpo. */
  fuente?: string;
  /**
   * Lo que el estudiante lleva escrito en el hueco. Con algo escrito el hueco
   * se enciende en ámbar; vacío se queda punteado.
   */
  valorHueco?: string;
  /** Centra el renglón. Se usa dentro de las tarjetas de enunciado. */
  centrado?: boolean;
};

/**
 * Cómo suena una expresión leída en voz alta. Un lector de pantalla no puede
 * con una fracción apilada, así que se la dictamos: "3 entre 5".
 */
export function leerExpresion(partes: ParteMat[]): string {
  return partes
    .map((parte) => {
      if (parte.tipo === 'texto') return parte.valor;
      if (parte.tipo === 'fraccion') return `${parte.arriba} entre ${parte.abajo}`;
      return parte.valor ? `hueco con ${parte.valor}` : 'hueco por llenar';
    })
    .join(' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
}

/** Signos que van pegados a lo que viene antes, sin espacio. */
const PEGADOS = /^[.,;:!?)»”]/;

type Atomo = {
  nodo: ReactNode;
  /** Va pegado al átomo anterior: es puntuación, no una palabra nueva. */
  pegado: boolean;
};

/**
 * Escribe una expresión matemática mezclando texto y fracciones de verdad,
 * en vez de aplanarla a "3/5 ÷ 1/4".
 *
 * El texto se parte en palabras para que el renglón fluya y corte solo donde
 * toca, como lo haría un párrafo. Si no, una frase larga bajaría entera al
 * siguiente renglón por ser un solo bloque.
 */
export function Expresion({
  partes,
  tamano = 20,
  color = colores.texto,
  fuente = fuentes.cuerpo,
  valorHueco,
  centrado = false,
}: Props) {
  const espacio = Math.round(tamano * 0.28);
  const atomos: Atomo[] = [];

  partes.forEach((parte, i) => {
    if (parte.tipo === 'texto') {
      const palabras = parte.valor.split(/\s+/).filter(Boolean);
      palabras.forEach((palabra, j) => {
        atomos.push({
          pegado: j === 0 && PEGADOS.test(palabra),
          nodo: (
            <Text
              key={`t${i}-${j}`}
              style={[estilos.texto, { fontFamily: fuente, fontSize: tamano, color }]}
            >
              {palabra}
            </Text>
          ),
        });
      });
      return;
    }

    if (parte.tipo === 'fraccion') {
      atomos.push({
        pegado: false,
        nodo: (
          <Fraccion
            key={`f${i}`}
            arriba={parte.arriba}
            abajo={parte.abajo}
            tamano={tamano}
            color={color}
            fuente={fuente}
          />
        ),
      });
      return;
    }

    const escrito = valorHueco ?? parte.valor ?? '';
    const lleno = escrito.length > 0;

    atomos.push({
      pegado: false,
      nodo: (
        <View
          key={`h${i}`}
          accessibilityRole="text"
          accessibilityLabel={lleno ? `hueco con ${escrito}` : 'hueco por llenar'}
          style={[
            estilos.hueco,
            {
              minWidth: parte.ancho ?? Math.round(tamano * 3.5),
              height: parte.alto ?? Math.round(tamano * 1.93),
              borderStyle: lleno ? 'solid' : 'dashed',
              borderColor: lleno ? colores.acento : colores.bordeHueco,
            },
          ]}
        >
          {lleno ? (
            <Text
              style={[estilos.texto, { fontSize: Math.round(tamano * 0.84), color: colores.texto }]}
            >
              {escrito}
            </Text>
          ) : null}
        </View>
      ),
    });
  });

  return (
    <View
      style={[estilos.fila, { rowGap: Math.round(tamano * 0.3) }, centrado && estilos.centrada]}
    >
      {atomos.map((atomo, i) => (
        <View key={i} style={{ marginLeft: i === 0 || atomo.pegado ? 0 : espacio }}>
          {atomo.nodo}
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  centrada: {
    justifyContent: 'center',
  },
  texto: {
    fontFamily: fuentes.cuerpo,
  },
  hueco: {
    backgroundColor: colores.fondo,
    borderWidth: 2,
    borderRadius: radios.hueco,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
});
