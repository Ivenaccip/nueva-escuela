import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, fuentes, TOCABLE } from '../tema';
import { IconoPista, IconoVolver } from './Iconos';

type Props = {
  /** Cuál de las seis estaciones se está viendo, de 1 a 6. */
  estacion: number;
  /** Pistas que quedan. Sin este dato no se dibuja el contador. */
  pistas?: number;
  /** A dónde vuelve la flecha. Por defecto, al círculo. */
  alVolver?: () => void;
};

const TOTAL = 6;

/**
 * La barra de arriba de toda estación: la flecha al círculo, los seis puntos
 * del recorrido y, cuando la estación las permite, las pistas que quedan.
 *
 * La estación 6 no lleva contador a propósito: para explicar no hay ayuda.
 */
export function BarraEstacion({ estacion, pistas, alVolver }: Props) {
  const volver = () => {
    if (alVolver) return alVolver();
    if (router.canGoBack()) return router.back();
    router.replace('/');
  };

  return (
    <View style={estilos.barra}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Volver al círculo"
        onPress={volver}
        style={estilos.volver}
      >
        <IconoVolver />
      </Pressable>

      <View
        style={estilos.puntos}
        accessibilityRole="progressbar"
        accessibilityLabel={`Estación ${estacion} de ${TOTAL}`}
      >
        {Array.from({ length: TOTAL }, (_, i) => {
          const numero = i + 1;
          const esActual = numero === estacion;
          const recorrida = numero <= estacion;
          return (
            <View
              key={numero}
              style={[
                estilos.punto,
                esActual && estilos.puntoActual,
                { backgroundColor: recorrida ? colores.acento : colores.bordeApagado },
              ]}
            />
          );
        })}
      </View>

      <View style={estilos.pistas}>
        {pistas !== undefined ? (
          <>
            <IconoPista />
            <Text style={estilos.contador}>{pistas}</Text>
          </>
        ) : null}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    height: 60,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  volver: {
    width: TOCABLE,
    height: TOCABLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  puntos: {
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  punto: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  puntoActual: {
    width: 22,
  },
  pistas: {
    width: TOCABLE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  contador: {
    fontFamily: fuentes.cuerpo,
    fontSize: 14,
    color: colores.textoTenue,
  },
});
