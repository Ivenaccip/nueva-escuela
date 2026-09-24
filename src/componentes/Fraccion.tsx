import { StyleSheet, Text, View } from 'react-native';

import { colores, fuentes } from '../tema';

type Props = {
  arriba: string | number;
  abajo: string | number;
  /** Tamaño del texto que la rodea; la fracción sale un poco más chica. */
  tamano?: number;
  color?: string;
};

/**
 * Una fracción de verdad: numerador sobre denominador, con su raya.
 * En el diseño se escribe así siempre, nunca "3/5" en una línea.
 */
export function Fraccion({ arriba, abajo, tamano = 20, color = colores.texto }: Props) {
  const tamanoCifra = Math.round(tamano * 0.78);
  const grosorRaya = Math.max(1.5, tamano * 0.08);

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${arriba} entre ${abajo}`}
      style={estilos.columna}
    >
      <Text style={[estilos.cifra, { fontSize: tamanoCifra, color }]}>{arriba}</Text>
      <View style={[estilos.raya, { height: grosorRaya, backgroundColor: color }]} />
      <Text style={[estilos.cifra, { fontSize: tamanoCifra, color }]}>{abajo}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  columna: {
    alignItems: 'center',
    marginHorizontal: 3,
  },
  cifra: {
    fontFamily: fuentes.cuerpo,
    paddingHorizontal: 5,
    lineHeight: undefined,
  },
  raya: {
    alignSelf: 'stretch',
    borderRadius: 1,
  },
});
