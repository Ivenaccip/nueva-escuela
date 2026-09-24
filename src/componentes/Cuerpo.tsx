import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';

import { espacio } from '../tema';
import { usePieSeguro } from './Marco';

/**
 * La zona que va entre la barra y el botón. El diseño está medido para 844 de
 * alto y ahí cabe justo, pero en un teléfono más corto el contenido se
 * amontonaba encima del botón. Con esto se desplaza cuando hace falta y, cuando
 * sobra sitio, se reparte igual que en el diseño.
 */
export function Cuerpo({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      style={estilos.scroll}
      contentContainerStyle={estilos.contenido}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

type PropsPie = {
  children: ReactNode;
  /** Separación por encima del botón, cuando el diseño la pide. */
  arriba?: number;
  /** La pantalla ya trae su propio margen lateral y no hay que repetirlo. */
  sinMargen?: boolean;
  style?: ViewStyle;
};

/**
 * El botón que avanza, anclado abajo. Nunca se desplaza: es lo único que el
 * estudiante no debería tener que buscar dos veces.
 */
export function Pie({ children, arriba = 0, sinMargen = false, style }: PropsPie) {
  const abajo = usePieSeguro();
  return (
    <View
      style={[!sinMargen && estilos.margen, { paddingTop: arriba, paddingBottom: abajo }, style]}
    >
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  contenido: {
    flexGrow: 1,
  },
  margen: {
    paddingHorizontal: espacio.margenAncho,
  },
});
