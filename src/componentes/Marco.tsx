import type { ReactNode } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ALTO_MARCO, ANCHO_MARCO, colores, radios } from '../tema';

/** A partir de aquí la ventana es de escritorio y el teléfono se centra. */
const CORTE_ESCRITORIO = 560;

/** true cuando estamos en un navegador de escritorio, no en el teléfono. */
export function useEsEscritorio() {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width >= CORTE_ESCRITORIO;
}

/**
 * Margen de abajo de cada pantalla. En el diseño son 28, pero en un teléfono
 * con barra de gestos hay que dejarle su espacio.
 */
export function usePieSeguro() {
  const insets = useSafeAreaInsets();
  const esEscritorio = useEsEscritorio();
  if (esEscritorio) return 28;
  return Math.max(28, insets.bottom + 10);
}

/**
 * El contenedor de toda pantalla. En el teléfono ocupa la pantalla entera;
 * en escritorio dibuja el marco de 390 centrado, como en el diseño.
 */
export function Marco({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const esEscritorio = useEsEscritorio();

  if (esEscritorio) {
    return (
      <View style={estilos.escenario}>
        <View
          style={[
            estilos.telefono,
            { height: Math.min(ALTO_MARCO, Math.max(560, height - 64)) },
          ]}
        >
          {children}
        </View>
      </View>
    );
  }

  return <View style={[estilos.lleno, { paddingTop: insets.top }]}>{children}</View>;
}

const estilos = StyleSheet.create({
  lleno: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  escenario: {
    flex: 1,
    backgroundColor: '#0B0A08',
    alignItems: 'center',
    justifyContent: 'center',
  },
  telefono: {
    width: ANCHO_MARCO,
    maxWidth: '100%',
    backgroundColor: colores.fondo,
    borderRadius: radios.marco,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colores.borde,
  },
});
