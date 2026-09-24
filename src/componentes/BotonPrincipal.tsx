import { Pressable, StyleSheet, Text } from 'react-native';

import { ALTO_BOTON, colores, fuentes, radios } from '../tema';

type Props = {
  children: string;
  onPress?: () => void;
  /** Apagado mientras no se puede avanzar. */
  desactivado?: boolean;
};

/**
 * El botón ámbar que cierra cada pantalla. Mismo alto y mismo lugar en las
 * ocho: es lo único que el estudiante no tiene que volver a buscar.
 */
export function BotonPrincipal({ children, onPress, desactivado = false }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: desactivado }}
      disabled={desactivado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.boton,
        pressed && !desactivado && estilos.presionado,
        desactivado && estilos.desactivado,
      ]}
    >
      <Text style={[estilos.texto, desactivado && estilos.textoDesactivado]}>{children}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    height: ALTO_BOTON,
    borderRadius: radios.boton,
    backgroundColor: colores.acento,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presionado: {
    backgroundColor: colores.acentoClaro,
  },
  desactivado: {
    backgroundColor: colores.superficie,
  },
  texto: {
    fontFamily: fuentes.cuerpoFuerte,
    fontSize: 17,
    color: colores.sobreAcento,
  },
  textoDesactivado: {
    color: colores.textoTenue,
  },
});
