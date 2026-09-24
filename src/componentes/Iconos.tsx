import Svg, { Circle, Path } from 'react-native-svg';

import { colores } from '../tema';

type PropsIcono = {
  tamano?: number;
  color?: string;
};

/** Racha de días. Va en rojo arriba a la izquierda del círculo. */
export function IconoLlama({ tamano = 18, color = colores.error }: PropsIcono) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2c1 4-2 5-2 8a4 4 0 0 0 8 0c0-1-.4-2-1-3 3 2 4 5 4 7a7 7 0 1 1-14 0c0-5 5-7 5-12z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Monedas ganadas. */
export function IconoMoneda({ tamano = 18, color = colores.acento }: PropsIcono) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />
      <Circle cx={12} cy={12} r={4.5} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

/** Estación ya hecha. */
export function IconoPalomita({ tamano = 23, color = colores.sobreAcento }: PropsIcono) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 13l4 4L19 7"
        stroke={color}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Volver al círculo. */
export function IconoVolver({ tamano = 21, color = colores.textoTenue }: PropsIcono) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18l-6-6 6-6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Reproducir el video. Es el único icono relleno. */
export function IconoReproducir({ tamano = 26, color = colores.sobreAcento }: PropsIcono) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 24 24">
      <Path d="M8 5.5v13l11-6.5z" fill={color} />
    </Svg>
  );
}

/** Pistas disponibles. */
export function IconoPista({ tamano = 17, color = colores.textoTenue }: PropsIcono) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Tecla de borrar del teclado. */
export function IconoBorrar({ tamano = 22, color = colores.texto }: PropsIcono) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6H9l-5 6 5 6h11a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zM17 9l-5 6M12 9l5 6"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Se escribió en la bitácora. */
export function IconoBitacora({ tamano = 15, color = colores.textoTenue }: PropsIcono) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
