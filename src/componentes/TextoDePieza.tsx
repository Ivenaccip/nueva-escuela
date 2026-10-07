import { Text } from 'react-native';

import type { ParteMat } from '../contenido/tipos';
import { fuentes } from '../tema';
import { Expresion } from './Expresion';

type Props = {
  partes: ParteMat[];
  tamano: number;
  color: string;
};

/**
 * Lo escrito en una pieza. Una frase suelta va como párrafo de verdad: en
 * `Expresion` cada palabra es un átomo con su propio margen, y la que abre el
 * renglón de abajo lo conserva, así que el renglón sale sangrado. Si hay un
 * símbolo o una fracción, sí hace falta `Expresion`.
 */
export function TextoDePieza({ partes, tamano, color }: Props) {
  if (partes.every((parte) => parte.tipo === 'texto')) {
    const frase = partes.map((parte) => (parte.tipo === 'texto' ? parte.valor : '')).join(' ');
    return (
      <Text
        style={{
          fontFamily: fuentes.cuerpo,
          fontSize: tamano,
          lineHeight: Math.round(tamano * 1.4),
          color,
        }}
      >
        {frase}
      </Text>
    );
  }
  return <Expresion partes={partes} tamano={tamano} color={color} />;
}
