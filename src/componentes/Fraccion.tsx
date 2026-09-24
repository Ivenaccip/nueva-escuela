import { StyleSheet, Text, View } from 'react-native';

import { colores, fuentes } from '../tema';

type Props = {
  arriba: string | number;
  abajo: string | number;
  /** Tamaño del texto que la rodea; la fracción sale un poco más chica. */
  tamano?: number;
  color?: string;
  /** Fuente de las cifras. En un enunciado hereda la del enunciado. */
  fuente?: string;
};

/**
 * Una fracción de verdad: numerador sobre denominador, con su raya.
 * En el diseño se escribe así siempre, nunca "3/5" en una línea.
 */
export function Fraccion({
  arriba,
  abajo,
  tamano = 20,
  color = colores.texto,
  fuente = fuentes.cuerpo,
}: Props) {
  const tamanoCifra = Math.round(tamano * 0.78);
  const grosorRaya = Math.max(1.5, tamano * 0.08);
  // El diseño aprieta el interlineado de las cifras a 1.12. Sin fijarlo, cada
  // cifra toma el natural de la fuente (~1.3) y la fracción crece lo bastante
  // para empujar hacia abajo todo lo que lleve debajo.
  const altoCifra = Math.round(tamanoCifra * 1.12);
  const cifra = { fontFamily: fuente, fontSize: tamanoCifra, lineHeight: altoCifra, color };

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${arriba} entre ${abajo}`}
      style={estilos.columna}
    >
      <Text style={[estilos.cifra, cifra]}>{arriba}</Text>
      <View style={[estilos.raya, { height: grosorRaya, backgroundColor: color }]} />
      <Text style={[estilos.cifra, cifra]}>{abajo}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  columna: {
    alignItems: 'center',
  },
  cifra: {
    paddingHorizontal: 5,
  },
  raya: {
    alignSelf: 'stretch',
    borderRadius: 1,
  },
});
