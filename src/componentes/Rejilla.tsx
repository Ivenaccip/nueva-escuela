import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, fuentes, radios } from '../tema';

export type CeldaDeRejilla = { fila: number; columna: number };

type Props = {
  /** Lo que encabeza cada columna y cada fila: en un cuadro de Punnett, los gametos de cada padre. */
  columnas: string[];
  filas: string[];
  /** Lo escrito, `celdas[fila][columna]`; vacío si no hay nada. */
  celdas: string[][];
  activa: CeldaDeRejilla | null;
  /** Las celdas mal llenadas, tras comprobar. */
  malas?: CeldaDeRejilla[];
  cerrada?: boolean;
  /** Qué va arriba y qué a la izquierda, para quien no ve los encabezados. */
  leyenda?: string;
  alTocar: (celda: CeldaDeRejilla) => void;
};

const ANCHO_ENCABEZADO = 44;
const SEPARACION = 8;
const LADO_MAXIMO = 88;
const LADO_MINIMO = 52;

/**
 * Una tabla que se llena celda por celda. Los encabezados los pone el contenido y
 * las celdas se escriben con el teclado de fichas de abajo; la que se está
 * llenando se ve encendida. El código calcula lo que debe ir en cada una.
 */
export function Rejilla({
  columnas,
  filas,
  celdas,
  activa,
  malas = [],
  cerrada = false,
  leyenda,
  alTocar,
}: Props) {
  // El lado de la celda sale del ancho que hay: con cuatro columnas ya no caben 88.
  const [ancho, setAncho] = useState(310);
  const lado = Math.max(
    LADO_MINIMO,
    Math.min(
      LADO_MAXIMO,
      Math.floor((ancho - ANCHO_ENCABEZADO - SEPARACION * columnas.length) / columnas.length),
    ),
  );
  const esMala = (fila: number, columna: number) =>
    malas.some((m) => m.fila === fila && m.columna === columna);

  return (
    <View onLayout={(e) => setAncho(e.nativeEvent.layout.width)}>
      <View style={estilos.rejilla}>
        <View style={[estilos.fila, { gap: SEPARACION }]}>
          <View style={{ width: ANCHO_ENCABEZADO }} />
          {columnas.map((nombre, c) => (
            <View key={c} style={[estilos.encabezadoColumna, { width: lado }]}>
              <Text style={estilos.encabezado}>{nombre}</Text>
            </View>
          ))}
        </View>
        {filas.map((nombre, f) => (
          <View key={f} style={[estilos.fila, { gap: SEPARACION }]}>
            <View style={[estilos.encabezadoFila, { height: lado }]}>
              <Text style={estilos.encabezado}>{nombre}</Text>
            </View>
            {columnas.map((_, c) => {
              const escrito = celdas[f]?.[c] ?? '';
              const esActiva = activa?.fila === f && activa.columna === c;
              const mala = esMala(f, c);
              return (
                <Pressable
                  key={c}
                  accessibilityRole="button"
                  accessibilityLabel={`Fila ${f + 1}, columna ${c + 1}: ${escrito || 'vacía'}`}
                  accessibilityState={{ selected: esActiva, disabled: cerrada }}
                  aria-selected={esActiva}
                  disabled={cerrada}
                  onPress={() => alTocar({ fila: f, columna: c })}
                  style={[
                    estilos.celda,
                    { width: lado, height: lado },
                    escrito !== '' && estilos.celdaLlena,
                    esActiva && estilos.celdaActiva,
                    cerrada && estilos.celdaBuena,
                    mala && estilos.celdaMala,
                  ]}
                >
                  <Text style={[estilos.escrito, lado < 80 && estilos.escritoChico]}>{escrito}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
      {leyenda ? <Text style={estilos.leyenda}>{leyenda}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  rejilla: {
    alignSelf: 'center',
    gap: SEPARACION,
  },
  fila: {
    flexDirection: 'row',
  },
  encabezadoColumna: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  encabezadoFila: {
    width: ANCHO_ENCABEZADO,
    alignItems: 'center',
    justifyContent: 'center',
  },
  encabezado: {
    fontFamily: fuentes.display,
    fontSize: 24,
    color: colores.acento,
  },
  // Es el hueco de siempre: punteado mientras espera, sólido cuando ya lleva algo.
  celda: {
    borderRadius: radios.hueco,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colores.bordeHueco,
    backgroundColor: colores.fondo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celdaLlena: {
    borderStyle: 'solid',
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  celdaActiva: {
    borderStyle: 'solid',
    borderColor: colores.acento,
    backgroundColor: colores.superficieAlta,
  },
  celdaBuena: {
    borderStyle: 'solid',
    borderColor: colores.acento,
  },
  celdaMala: {
    borderStyle: 'solid',
    borderColor: colores.error,
    backgroundColor: colores.errorFondo,
  },
  escrito: {
    fontFamily: fuentes.cuerpoMedio,
    fontSize: 26,
    color: colores.texto,
  },
  // Misma letra en toda la tabla: con cuatro columnas ya no cabe la de 26, y que cada celda
  // cambie de tamaño según lo que lleva escrito se vería como un salto.
  escritoChico: {
    fontSize: 19,
  },
  leyenda: {
    marginTop: 14,
    textAlign: 'center',
    fontFamily: fuentes.cuerpo,
    fontSize: 13,
    color: colores.textoTenue,
  },
});
