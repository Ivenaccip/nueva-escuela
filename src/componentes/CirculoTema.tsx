import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { Estacion } from '../contenido/tipos';
import { colores, fuentes } from '../tema';
import { IconoPalomita } from './Iconos';

const LADO = 330;
const CENTRO = LADO / 2;
const RADIO = 118;
/** Nodo normal. El de la estación en curso es más grande. */
const NODO = 52;
const NODO_ACTUAL = 64;

/** Dónde cae la estación i sobre el anillo. La 1 va arriba y siguen a la derecha. */
function puntoDe(indice: number) {
  const angulo = ((-90 + indice * 60) * Math.PI) / 180;
  return {
    x: CENTRO + RADIO * Math.cos(angulo),
    y: CENTRO + RADIO * Math.sin(angulo),
  };
}

/** El tramo de anillo que va de una estación a la siguiente. */
function tramo(desde: number) {
  const a = puntoDe(desde);
  const b = puntoDe((desde + 1) % 6);
  return `M${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${RADIO} ${RADIO} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

type Props = {
  estaciones: Estacion[];
  /** Se llama al tocar una estación. */
  alTocar?: (estacion: Estacion) => void;
};

/**
 * El mapa del tema: seis estaciones sobre un anillo. El tramo entre dos
 * estaciones se pinta sólido cuando la de atrás ya está hecha, y punteado
 * mientras falte, así el avance se lee de una ojeada.
 */
export function CirculoTema({ estaciones, alTocar }: Props) {
  // Sin ninguna «actual» están las seis hechas: el rótulo del centro lo dice en
  // vez de seguir señalando la primera.
  const actual = estaciones.find((e) => e.estado === 'actual');

  return (
    <View style={estilos.lienzo}>
      <Svg
        width={LADO}
        height={LADO}
        viewBox={`0 0 ${LADO} ${LADO}`}
        style={StyleSheet.absoluteFill}
      >
        {estaciones.map((estacion, i) => {
          const recorrido = estacion.estado === 'hecha';
          return (
            <Path
              key={estacion.numero}
              d={tramo(i)}
              fill="none"
              stroke={recorrido ? colores.acento : colores.bordeApagado}
              strokeWidth={7}
              strokeLinecap="round"
              strokeDasharray={recorrido ? undefined : '2 9'}
            />
          );
        })}
      </Svg>

      {estaciones.map((estacion, i) => {
        const punto = puntoDe(i);
        const esActual = estacion.estado === 'actual';
        const lado = esActual ? NODO_ACTUAL : NODO;

        return (
          <Pressable
            key={estacion.numero}
            accessibilityRole="button"
            accessibilityLabel={etiquetaDe(estacion)}
            accessibilityState={{ disabled: estacion.estado === 'cerrada' }}
            onPress={() => alTocar?.(estacion)}
            style={({ pressed }) => [
              estilos.nodo,
              {
                left: punto.x - lado / 2,
                top: punto.y - lado / 2,
                width: lado,
                height: lado,
                borderRadius: lado / 2,
                opacity: pressed ? 0.75 : 1,
              },
              estacion.estado === 'hecha' && estilos.nodoHecho,
              esActual && estilos.nodoActual,
              estacion.estado === 'cerrada' && estilos.nodoCerrado,
            ]}
          >
            {estacion.estado === 'hecha' ? (
              <IconoPalomita />
            ) : (
              <Text style={esActual ? estilos.numeroActual : estilos.numeroCerrado}>
                {estacion.numero}
              </Text>
            )}
          </Pressable>
        );
      })}

      <View style={estilos.centro}>
        {actual ? (
          <>
            <Text style={estilos.centroEtiqueta}>vas en</Text>
            <Text style={estilos.centroNombre}>{actual.nombre}</Text>
            <Text style={estilos.centroEtiqueta}>
              {actual.numero} de {estaciones.length}
            </Text>
          </>
        ) : (
          <>
            <Text style={estilos.centroEtiqueta}>el círculo está</Text>
            <Text style={estilos.centroNombre}>cerrado</Text>
            <Text style={estilos.centroEtiqueta}>
              {estaciones.length} de {estaciones.length}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

function etiquetaDe(estacion: Estacion) {
  const estado =
    estacion.estado === 'hecha'
      ? 'hecha'
      : estacion.estado === 'actual'
        ? 'es la que sigue'
        : 'aún cerrada';
  return `Estación ${estacion.numero}, ${estacion.nombre.toLowerCase()}, ${estado}`;
}

const estilos = StyleSheet.create({
  lienzo: {
    width: LADO,
    height: LADO,
  },
  nodo: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodoHecho: {
    backgroundColor: colores.acento,
  },
  nodoActual: {
    backgroundColor: colores.fondo,
    borderWidth: 3,
    borderColor: colores.acento,
  },
  nodoCerrado: {
    backgroundColor: colores.superficie,
    borderWidth: 2,
    borderColor: colores.borde,
  },
  numeroActual: {
    fontFamily: fuentes.cuerpoFuerte,
    fontSize: 22,
    color: colores.acento,
  },
  numeroCerrado: {
    fontFamily: fuentes.cuerpoMedio,
    fontSize: 18,
    color: colores.textoTenue,
  },
  centro: {
    // El rótulo no debe robarle el toque a los nodos que tiene debajo.
    pointerEvents: 'none',
    position: 'absolute',
    left: 81,
    top: 136,
    width: 168,
    alignItems: 'center',
  },
  centroEtiqueta: {
    fontFamily: fuentes.cuerpo,
    fontSize: 12,
    color: colores.textoTenue,
  },
  centroNombre: {
    marginTop: 3,
    marginBottom: 3,
    fontFamily: fuentes.displayRegular,
    fontSize: 20,
    color: colores.texto,
  },
});
