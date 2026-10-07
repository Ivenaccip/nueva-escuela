import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PiezaDePantalla, ResultadoDePiezas } from '../contenido/tipos';
import { colores, fuentes, radios } from '../tema';
import { leerExpresion } from './Expresion';
import { TextoDePieza } from './TextoDePieza';

export type Par = { izquierda: string; derecha: string };

type Props = {
  izquierda: PiezaDePantalla[];
  /** Ya mezclada: su orden no dice quién va con quién. */
  derecha: PiezaDePantalla[];
  /** Las parejas hechas, en el orden en que se hicieron: de ahí sale su número. */
  pares: Par[];
  /** La de la izquierda que se tocó y espera su pareja. */
  tomada: string | null;
  /** `malas` son los `id` de la columna izquierda cuya pareja no es. */
  resultado: ResultadoDePiezas | null;
  alTocarIzquierda: (id: string) => void;
  alTocarDerecha: (id: string) => void;
};

/**
 * Emparejar: dos columnas, se toca una de la izquierda y luego su pareja. Cada
 * pareja lleva el mismo número en las dos puntas; el color no carga ningún
 * significado, así que se lee igual sin distinguirlos.
 */
export function Emparejar({
  izquierda,
  derecha,
  pares,
  tomada,
  resultado,
  alTocarIzquierda,
  alTocarDerecha,
}: Props) {
  const cerrada = resultado?.bien === true;
  const malas = new Set(resultado && !resultado.bien ? resultado.malas : []);
  const numeroIzq = (id: string) => pares.findIndex((p) => p.izquierda === id) + 1;
  const numeroDer = (id: string) => pares.findIndex((p) => p.derecha === id) + 1;
  const izquierdaDe = (derechaId: string) =>
    pares.find((p) => p.derecha === derechaId)?.izquierda ?? null;

  // Por filas y no por columnas: si un texto baja a dos renglones, su vecino crece con él.
  const filas = Math.max(izquierda.length, derecha.length);

  return (
    <View>
      <Text style={estilos.rotulo}>
        {tomada === null ? 'toca uno de la izquierda' : 'ahora toca su pareja'}
      </Text>
      <View style={estilos.columnas}>
        {Array.from({ length: filas }, (_, i) => {
          const a = izquierda[i];
          const b = derecha[i];
          return (
            <View key={i} style={estilos.fila}>
              {a ? (
                <Ficha
                  pieza={a}
                  numero={numeroIzq(a.id)}
                  estado={
                    cerrada
                      ? 'buena'
                      : malas.has(a.id)
                        ? 'mala'
                        : a.id === tomada
                          ? 'tomada'
                          : numeroIzq(a.id) > 0
                            ? resultado
                              ? 'buena'
                              : 'unida'
                            : 'suelta'
                  }
                  lado="izquierda"
                  bloqueada={cerrada}
                  leyenda={
                    numeroIzq(a.id) > 0
                      ? `${leerExpresion(a.partes)}, pareja ${numeroIzq(a.id)}. Toca para deshacer.`
                      : `${leerExpresion(a.partes)}. Toca para buscarle pareja.`
                  }
                  alTocar={() => alTocarIzquierda(a.id)}
                />
              ) : (
                <View style={estilos.vacia} />
              )}
              {b ? (
                <Ficha
                  pieza={b}
                  numero={numeroDer(b.id)}
                  estado={
                    cerrada
                      ? 'buena'
                      : malas.has(izquierdaDe(b.id) ?? '')
                        ? 'mala'
                        : numeroDer(b.id) > 0
                          ? resultado
                            ? 'buena'
                            : 'unida'
                          : 'suelta'
                  }
                  lado="derecha"
                  bloqueada={cerrada}
                  leyenda={
                    numeroDer(b.id) > 0
                      ? `${leerExpresion(b.partes)}, pareja ${numeroDer(b.id)}. Toca para deshacer.`
                      : tomada === null
                        ? `${leerExpresion(b.partes)}. Primero toca uno de la izquierda.`
                        : `${leerExpresion(b.partes)}. Toca para unirlo con el de la izquierda.`
                  }
                  alTocar={() => alTocarDerecha(b.id)}
                />
              ) : (
                <View style={estilos.vacia} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

type PropsFicha = {
  pieza: PiezaDePantalla;
  numero: number;
  estado: 'suelta' | 'tomada' | 'unida' | 'buena' | 'mala';
  lado: 'izquierda' | 'derecha';
  bloqueada: boolean;
  leyenda: string;
  alTocar: () => void;
};

function Ficha({ pieza, numero, estado, lado, bloqueada, leyenda, alTocar }: PropsFicha) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={leyenda}
      accessibilityState={{ selected: estado === 'tomada', disabled: bloqueada }}
      aria-selected={estado === 'tomada'}
      disabled={bloqueada}
      onPress={alTocar}
      style={({ pressed }) => [
        estilos.ficha,
        estado === 'tomada' && estilos.fichaTomada,
        estado === 'unida' && estilos.fichaUnida,
        estado === 'buena' && estilos.fichaBuena,
        estado === 'mala' && estilos.fichaMala,
        pressed && estado === 'suelta' && estilos.fichaTocada,
      ]}
    >
      <TextoDePieza
        partes={pieza.partes}
        tamano={16}
        color={estado === 'suelta' ? colores.textoSuave : colores.texto}
      />
      {numero > 0 ? (
        <View
          style={[
            estilos.insignia,
            lado === 'izquierda' ? estilos.insigniaIzquierda : estilos.insigniaDerecha,
            estado === 'mala' && estilos.insigniaMala,
          ]}
        >
          <Text style={estilos.numero}>{numero}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  rotulo: {
    marginBottom: 14,
    fontFamily: fuentes.cuerpo,
    fontSize: 13,
    color: colores.textoTenue,
  },
  columnas: {
    gap: 14,
  },
  fila: {
    flexDirection: 'row',
    gap: 12,
  },
  vacia: {
    flex: 1,
  },
  ficha: {
    flex: 1,
    minHeight: 68,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radios.tecla,
    borderWidth: 2,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
    justifyContent: 'center',
  },
  fichaTocada: {
    backgroundColor: colores.superficieAlta,
  },
  fichaTomada: {
    borderColor: colores.acento,
    backgroundColor: colores.superficieAlta,
  },
  fichaUnida: {
    borderColor: colores.bordeHueco,
  },
  fichaBuena: {
    borderColor: colores.acento,
  },
  fichaMala: {
    borderColor: colores.error,
    backgroundColor: colores.errorFondo,
  },
  // La insignia cuelga de la esquina de afuera: entre columnas sólo hay 12 y no cabría.
  insignia: {
    position: 'absolute',
    top: -10,
    width: 22,
    height: 22,
    borderRadius: radios.pildora,
    backgroundColor: colores.acento,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insigniaIzquierda: {
    left: -10,
  },
  insigniaDerecha: {
    right: -10,
  },
  insigniaMala: {
    backgroundColor: colores.error,
  },
  numero: {
    fontFamily: fuentes.cuerpoFuerte,
    fontSize: 12,
    color: colores.sobreAcento,
  },
});
