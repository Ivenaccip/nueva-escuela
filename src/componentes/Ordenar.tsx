import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PiezaDePantalla, ResultadoDePiezas } from '../contenido/tipos';
import { colores, fuentes, radios } from '../tema';
import { leerExpresion } from './Expresion';
import { TextoDePieza } from './TextoDePieza';

type Props = {
  /** Todas las piezas, ya mezcladas. */
  piezas: PiezaDePantalla[];
  /** Los `id` que lleva puestos, en el orden en que los puso. */
  orden: string[];
  resultado: ResultadoDePiezas | null;
  /** Una pieza suelta se pone al final; una puesta se quita junto con las que le siguen. */
  alTocar: (id: string) => void;
};

type Estado = 'suelta' | 'puesta' | 'mala' | 'buena';

/**
 * Ordenar una secuencia. Lo que se va eligiendo sube a «tu orden», numerado y
 * unido por un hilo; lo que falta se queda abajo. Así, a mitad de camino, lo
 * armado se lee de corrido y no hay que buscar el «2» entre piezas revueltas.
 */
export function Ordenar({ piezas, orden, resultado, alTocar }: Props) {
  const cerrada = resultado?.bien === true;
  const malas = new Set(resultado && !resultado.bien ? resultado.malas : []);
  const puestas = orden
    .map((id) => piezas.find((p) => p.id === id))
    .filter((p): p is PiezaDePantalla => p !== undefined);
  const sueltas = piezas.filter((p) => !orden.includes(p.id));

  return (
    <View>
      <Text style={estilos.rotulo}>tu orden</Text>
      <View>
        {puestas.map((pieza, i) => (
          <View key={pieza.id}>
            {i > 0 ? <View style={[estilos.hilo, cerrada && estilos.hiloCerrado]} /> : null}
            <Paso
              pieza={pieza}
              numero={i + 1}
              estado={cerrada ? 'buena' : malas.has(pieza.id) ? 'mala' : 'puesta'}
              bloqueada={cerrada}
              leyenda={`Lugar ${i + 1}: ${leerExpresion(pieza.partes)}. Toca para quitarlo de ahí.`}
              alTocar={() => alTocar(pieza.id)}
            />
          </View>
        ))}
        {sueltas.length > 0 ? (
          <View>
            {puestas.length > 0 ? <View style={estilos.hilo} /> : null}
            <View
              accessibilityRole="text"
              accessibilityLabel={`Falta el lugar ${puestas.length + 1}`}
              style={estilos.ranura}
            >
              <View style={estilos.insignia}>
                <Text style={estilos.numero}>{puestas.length + 1}</Text>
              </View>
              <Text style={estilos.ranuraTexto}>el que sigue</Text>
            </View>
          </View>
        ) : null}
      </View>

      {sueltas.length > 0 ? (
        <>
          <Text style={[estilos.rotulo, estilos.rotuloSueltas]}>por ordenar</Text>
          <View style={estilos.sueltas}>
            {sueltas.map((pieza) => (
              <Paso
                key={pieza.id}
                pieza={pieza}
                estado="suelta"
                bloqueada={false}
                leyenda={`${leerExpresion(pieza.partes)}. Toca para ponerlo en el lugar ${puestas.length + 1}.`}
                alTocar={() => alTocar(pieza.id)}
              />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

type PropsPaso = {
  pieza: PiezaDePantalla;
  numero?: number;
  estado: Estado;
  bloqueada: boolean;
  leyenda: string;
  alTocar: () => void;
};

function Paso({ pieza, numero, estado, bloqueada, leyenda, alTocar }: PropsPaso) {
  const marcada = estado !== 'suelta';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={leyenda}
      accessibilityState={{ disabled: bloqueada }}
      disabled={bloqueada}
      onPress={alTocar}
      style={({ pressed }) => [
        estilos.paso,
        estado === 'suelta' && estilos.pasoSuelto,
        (estado === 'puesta' || estado === 'buena') && estilos.pasoPuesto,
        estado === 'mala' && estilos.pasoMalo,
        pressed && estado === 'suelta' && estilos.pasoTocado,
      ]}
    >
      <View
        style={[
          estilos.insignia,
          marcada && estilos.insigniaPuesta,
          estado === 'mala' && estilos.insigniaMala,
        ]}
      >
        {numero !== undefined ? (
          <Text style={[estilos.numero, estilos.numeroPuesto]}>{numero}</Text>
        ) : null}
      </View>
      <View style={estilos.contenido}>
        <TextoDePieza
          partes={pieza.partes}
          tamano={17}
          color={marcada ? colores.texto : colores.textoSuave}
        />
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  rotulo: {
    marginBottom: 9,
    fontFamily: fuentes.cuerpo,
    fontSize: 13,
    color: colores.textoTenue,
  },
  rotuloSueltas: {
    marginTop: 26,
  },
  sueltas: {
    gap: 9,
  },
  paso: {
    minHeight: 58,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radios.tecla,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  pasoSuelto: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
  },
  pasoTocado: {
    backgroundColor: colores.superficieAlta,
  },
  pasoPuesto: {
    backgroundColor: colores.superficie,
    borderColor: colores.acento,
  },
  pasoMalo: {
    backgroundColor: colores.errorFondo,
    borderColor: colores.error,
  },
  contenido: {
    flex: 1,
  },
  insignia: {
    width: 24,
    height: 24,
    borderRadius: radios.pildora,
    backgroundColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insigniaPuesta: {
    backgroundColor: colores.acento,
  },
  insigniaMala: {
    backgroundColor: colores.error,
  },
  numero: {
    fontFamily: fuentes.cuerpoFuerte,
    fontSize: 12,
    color: colores.textoSuave,
  },
  numeroPuesto: {
    color: colores.sobreAcento,
  },
  // El hilo pasa por el centro de las insignias: 2 de borde + 16 de margen + 12 de radio − 1.
  hilo: {
    width: 2,
    height: 9,
    marginLeft: 29,
    backgroundColor: colores.bordeApagado,
  },
  hiloCerrado: {
    backgroundColor: colores.acento,
  },
  ranura: {
    minHeight: 58,
    paddingHorizontal: 16,
    borderRadius: radios.tecla,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colores.bordeHueco,
    backgroundColor: colores.fondo,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  ranuraTexto: {
    fontFamily: fuentes.cuerpo,
    fontSize: 15,
    color: colores.textoTenue,
  },
});
