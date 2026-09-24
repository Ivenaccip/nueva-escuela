import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colores, radios } from '../tema';

type Props = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
};

/** La superficie donde vive el enunciado: fondo apagado y borde fino. */
export function Tarjeta({ children, style }: Props) {
  return <View style={[estilos.tarjeta, style]}>{children}</View>;
}

const estilos = StyleSheet.create({
  tarjeta: {
    borderRadius: radios.tarjeta,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
  },
});
