import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import type { ParteMat } from '../contenido/tipos';
import { colores, fuentes, radios, TOCABLE } from '../tema';
import { Expresion, leerExpresion } from './Expresion';

type Props = {
  /** Cuántos tramos iguales hay entre un extremo y el otro: hay `divisiones + 1` marcas. */
  divisiones: number;
  /** Lo que vale cada marca (`divisiones + 1` entradas); es lo que se lee sobre la elegida. */
  marcas: ParteMat[][];
  /** Las marcas que llevan un número escrito debajo —por lo general, los extremos— y alargan su raya. */
  rotulos: { posicion: number; partes: ParteMat[] }[];
  /** La marca elegida, o `null` si todavía no hay ninguna. */
  posicion: number | null;
  estado?: 'libre' | 'bien' | 'mal';
  alElegir: (posicion: number) => void;
};

const MARGEN = 30;
const BURBUJA = 76;
const NUMERO = 56;
const Y_RECTA = 100;
const RADIO_MARCADOR = 12;

/**
 * La recta numérica. Se toca o se arrastra sobre ella y el marcador se pega a la
 * marca más cercana; para afinar están los dos pasos de abajo. Lo que vale la
 * marca elegida se escribe encima, apilado si es fracción.
 */
export function RectaNumerica({ divisiones, marcas, rotulos, posicion, estado = 'libre', alElegir }: Props) {
  const [ancho, setAncho] = useState(310);
  const largo = Math.max(1, ancho - MARGEN * 2);
  const xDe = (p: number) => MARGEN + (p / divisiones) * largo;
  const color = estado === 'mal' ? colores.error : colores.acento;
  const bloqueada = estado === 'bien';

  const elegirEn = (x: number) => {
    const cerca = Math.round(((x - MARGEN) / largo) * divisiones);
    alElegir(Math.max(0, Math.min(divisiones, cerca)));
  };

  return (
    <View
      onLayout={(e) => setAncho(e.nativeEvent.layout.width)}
      style={estilos.tarjeta}
    >
      <Svg width={ancho} height={150} style={estilos.dibujo}>
        <Line
          x1={MARGEN}
          x2={MARGEN + largo}
          y1={Y_RECTA}
          y2={Y_RECTA}
          stroke={colores.textoTenue}
          strokeWidth={3}
          strokeLinecap="round"
        />
        {Array.from({ length: divisiones + 1 }, (_, p) => {
          const alta = rotulos.some((r) => r.posicion === p);
          const medio = alta ? 14 : 8;
          return (
            <Line
              key={p}
              x1={xDe(p)}
              x2={xDe(p)}
              y1={Y_RECTA - medio}
              y2={Y_RECTA + medio}
              stroke={colores.textoTenue}
              strokeWidth={alta ? 3 : 2}
              strokeLinecap="round"
            />
          );
        })}
        {posicion !== null ? (
          <>
            <Line
              x1={xDe(posicion)}
              x2={xDe(posicion)}
              y1={62}
              y2={Y_RECTA - RADIO_MARCADOR}
              stroke={color}
              strokeWidth={2}
            />
            <Circle
              cx={xDe(posicion)}
              cy={Y_RECTA}
              r={RADIO_MARCADOR}
              fill={color}
              stroke={colores.superficie}
              strokeWidth={3}
            />
          </>
        ) : null}
      </Svg>

      {posicion !== null ? (
        <View
          style={[
            estilos.burbuja,
            estilos.sinToque,
            { left: Math.max(8, Math.min(ancho - 8 - BURBUJA, xDe(posicion) - BURBUJA / 2)) },
            { borderColor: color },
          ]}
        >
          <Expresion partes={marcas[posicion]} tamano={20} centrado />
        </View>
      ) : (
        <Text style={[estilos.invitacion, estilos.sinToque]}>
          toca la recta
        </Text>
      )}

      {rotulos.map((r) => (
        <View
          key={r.posicion}
          style={[estilos.numero, estilos.sinToque, { left: xDe(r.posicion) - NUMERO / 2 }]}
        >
          <Expresion partes={r.partes} tamano={19} color={colores.textoSuave} centrado />
        </View>
      ))}

      {/* Encima de todo, para que el dedo mande sobre el dibujo y no sobre sus partes. */}
      <View
        accessibilityRole="adjustable"
        accessibilityLabel="Recta numérica"
        accessibilityValue={{
          min: 0,
          max: divisiones,
          now: posicion ?? 0,
          text: posicion === null ? 'sin elegir' : leerExpresion(marcas[posicion]),
        }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => {
          if (bloqueada) return;
          const base = posicion ?? 0;
          if (e.nativeEvent.actionName === 'increment') alElegir(Math.min(divisiones, base + 1));
          if (e.nativeEvent.actionName === 'decrement') alElegir(Math.max(0, base - 1));
        }}
        onStartShouldSetResponder={() => !bloqueada}
        onMoveShouldSetResponder={() => !bloqueada}
        onResponderGrant={(e) => elegirEn(e.nativeEvent.locationX)}
        onResponderMove={(e) => elegirEn(e.nativeEvent.locationX)}
        style={estilos.zonaDeToque}
      />
    </View>
  );
}

type PropsPasos = {
  posicion: number | null;
  divisiones: number;
  deshabilitado?: boolean;
  alElegir: (posicion: number) => void;
};

/** Los dos pasos que acompañan a la recta, donde iría el teclado: afinan de una marca en una. */
export function PasosDeRecta({ posicion, divisiones, deshabilitado = false, alElegir }: PropsPasos) {
  const mover = (delta: number) => {
    if (posicion === null) return alElegir(delta > 0 ? 0 : divisiones);
    alElegir(Math.max(0, Math.min(divisiones, posicion + delta)));
  };
  return (
    <View style={estilos.pasos}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Una marca a la izquierda"
        accessibilityState={{ disabled: deshabilitado || posicion === 0 }}
        disabled={deshabilitado || posicion === 0}
        onPress={() => mover(-1)}
        style={({ pressed }) => [
          estilos.paso,
          pressed && estilos.pasoPresionado,
          posicion === 0 && estilos.pasoApagado,
        ]}
      >
        <Text style={estilos.pasoTexto}>{'−'}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Una marca a la derecha"
        accessibilityState={{ disabled: deshabilitado || posicion === divisiones }}
        disabled={deshabilitado || posicion === divisiones}
        onPress={() => mover(1)}
        style={({ pressed }) => [
          estilos.paso,
          pressed && estilos.pasoPresionado,
          posicion === divisiones && estilos.pasoApagado,
        ]}
      >
        <Text style={estilos.pasoTexto}>+</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    height: 176,
    borderRadius: radios.tarjeta,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    overflow: 'hidden',
  },
  dibujo: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  // Lo escrito encima de la recta no debe robarle el toque a la zona de abajo.
  sinToque: {
    pointerEvents: 'none',
  },
  zonaDeToque: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  burbuja: {
    position: 'absolute',
    top: 10,
    width: BURBUJA,
    height: 56,
    borderRadius: radios.hueco,
    borderWidth: 2,
    backgroundColor: colores.superficieAlta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invitacion: {
    position: 'absolute',
    top: 38,
    alignSelf: 'center',
    fontFamily: fuentes.cuerpo,
    fontSize: 14,
    color: colores.textoTenue,
  },
  numero: {
    position: 'absolute',
    top: 122,
    width: NUMERO,
    alignItems: 'center',
  },
  pasos: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 16,
  },
  paso: {
    flex: 1,
    height: 56,
    minWidth: TOCABLE,
    borderRadius: radios.tecla,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pasoPresionado: {
    backgroundColor: colores.superficieAlta,
  },
  pasoApagado: {
    opacity: 0.4,
  },
  pasoTexto: {
    fontFamily: fuentes.cuerpo,
    fontSize: 28,
    color: colores.texto,
  },
});
