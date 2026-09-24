import { StyleSheet, Text, View } from 'react-native';

import type { ParteMat } from '../contenido/tipos';
import { colores, fuentes, radios } from '../tema';
import { Fraccion } from './Fraccion';

type Props = {
  partes: ParteMat[];
  /** Tamaño del texto suelto; las fracciones salen proporcionales. */
  tamano?: number;
  color?: string;
  /**
   * Lo que el estudiante lleva escrito en el hueco. Con algo escrito el hueco
   * se enciende en ámbar; vacío se queda punteado.
   */
  valorHueco?: string;
  /** Centra el renglón. Se usa dentro de las tarjetas de enunciado. */
  centrado?: boolean;
};

/**
 * Escribe una expresión matemática mezclando texto y fracciones de verdad,
 * en vez de aplanarla a "3/5 ÷ 1/4".
 */
export function Expresion({
  partes,
  tamano = 20,
  color = colores.texto,
  valorHueco,
  centrado = false,
}: Props) {
  return (
    <View style={[estilos.fila, centrado && estilos.centrada]}>
      {partes.map((parte, i) => {
        if (parte.tipo === 'texto') {
          return (
            <Text key={i} style={[estilos.texto, { fontSize: tamano, color }]}>
              {parte.valor}
            </Text>
          );
        }

        if (parte.tipo === 'fraccion') {
          return <Fraccion key={i} arriba={parte.arriba} abajo={parte.abajo} tamano={tamano} color={color} />;
        }

        const escrito = valorHueco ?? parte.valor ?? '';
        const lleno = escrito.length > 0;
        const alto = Math.round(tamano * 1.75);

        return (
          <View
            key={i}
            accessibilityRole="text"
            accessibilityLabel={lleno ? `hueco con ${escrito}` : 'hueco por llenar'}
            style={[
              estilos.hueco,
              {
                minWidth: parte.ancho ?? Math.round(tamano * 2.5),
                height: alto,
                borderRadius: radios.hueco,
                borderStyle: lleno ? 'solid' : 'dashed',
                borderColor: lleno ? colores.acento : colores.bordeHueco,
              },
            ]}
          >
            {lleno ? (
              <Text style={[estilos.texto, { fontSize: Math.round(tamano * 0.84), color: colores.texto }]}>
                {escrito}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
});
