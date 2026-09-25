import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ParteMat } from '../contenido/tipos';
import { colores, fuentes, radios } from '../tema';
import { Fraccion } from './Fraccion';

type Props = {
  partes: ParteMat[];
  /** Tamaño del texto suelto; las fracciones salen proporcionales. */
  tamano?: number;
  color?: string;
  /** Fuente del texto suelto. Los enunciados van en display; lo demás en cuerpo. */
  fuente?: string;
  /**
   * Lo que el estudiante lleva escrito en el hueco. Con algo escrito el hueco
   * se enciende en ámbar; vacío se queda punteado.
   */
  valorHueco?: string;
  /** Centra el renglón. Se usa dentro de las tarjetas de enunciado. */
  centrado?: boolean;
};

/** Una respuesta tecleada que es una fracción: "12/5". El teclado no da más. */
const TECLEADA_FRACCION = /^(\d+)\/(\d+)$/;

/** Una carga se escribe en `sup` igual que un exponente: "2+", "+", "−". */
const CARGA = /^(\d*)([+−-])$/;

/** "Ca a la 2 más" no se entiende; una carga se dicta "Ca dos más". */
function leerSuperindice(valor: string, sup: string): string {
  const carga = CARGA.exec(sup);
  if (!carga) return `${valor} a la ${sup}`;
  const signo = carga[2] === '+' ? 'más' : 'menos';
  return carga[1] ? `${valor} ${carga[1]} ${signo}` : `${valor} ${signo}`;
}

/**
 * Cómo suena una expresión leída en voz alta. Un lector de pantalla no puede
 * con una fracción apilada ni con un subíndice, así que se los dictamos:
 * "3 entre 5", "H sub 2", "Ca 2 más".
 */
export function leerExpresion(partes: ParteMat[]): string {
  return partes
    .map((parte) => {
      if (parte.tipo === 'texto') return parte.valor;
      if (parte.tipo === 'fraccion') return `${parte.arriba} entre ${parte.abajo}`;
      if (parte.tipo === 'simbolo') {
        if (parte.sub) return `${parte.valor} sub ${parte.sub}`;
        if (parte.sup) return leerSuperindice(parte.valor, parte.sup);
        return parte.valor;
      }
      if (!parte.valor) return 'hueco por llenar';
      const fraccion = TECLEADA_FRACCION.exec(parte.valor);
      if (fraccion) return `hueco con ${fraccion[1]} entre ${fraccion[2]}`;
      return `hueco con ${parte.valor}`;
    })
    .join(' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
}

/** Signos que van pegados a lo que viene antes, sin espacio. */
const PEGADOS = /^[.,;:!?)»”]/;

type Atomo = {
  nodo: ReactNode;
  /** Va pegado al átomo anterior: es puntuación, no una palabra nueva. */
  pegado: boolean;
};

/**
 * Escribe una expresión matemática mezclando texto y fracciones de verdad,
 * en vez de aplanarla a "3/5 ÷ 1/4".
 *
 * El texto se parte en palabras para que el renglón fluya y corte solo donde
 * toca, como lo haría un párrafo. Si no, una frase larga bajaría entera al
 * siguiente renglón por ser un solo bloque.
 */
export function Expresion({
  partes,
  tamano = 20,
  color = colores.texto,
  fuente = fuentes.cuerpo,
  valorHueco,
  centrado = false,
}: Props) {
  const espacio = Math.round(tamano * 0.28);
  const atomos: Atomo[] = [];

  partes.forEach((parte, i) => {
    if (parte.tipo === 'texto') {
      const palabras = parte.valor.split(/\s+/).filter(Boolean);
      palabras.forEach((palabra, j) => {
        atomos.push({
          pegado: j === 0 && PEGADOS.test(palabra),
          nodo: (
            <Text
              key={`t${i}-${j}`}
              style={[estilos.texto, { fontFamily: fuente, fontSize: tamano, color }]}
            >
              {palabra}
            </Text>
          ),
        });
      });
      return;
    }

    if (parte.tipo === 'fraccion') {
      atomos.push({
        pegado: false,
        nodo: (
          <Fraccion
            key={`f${i}`}
            arriba={parte.arriba}
            abajo={parte.abajo}
            tamano={tamano}
            color={color}
            fuente={fuente}
          />
        ),
      });
      return;
    }

    if (parte.tipo === 'simbolo') {
      // El sub y el sup son la misma columna, arrimada al símbolo y alineada
      // arriba con él: el sup se queda en el techo de la caja y el sub se empuja
      // con `marginTop` hasta el pie. Se fijan los interlineados igual que en
      // `Fraccion`, y sin márgenes negativos: uno arriba se saldría de la caja
      // del átomo y recortaría el renglón de encima.
      const pegado = Math.round(tamano * 0.62);
      const altoBase = Math.round(tamano * 1.3);
      const base = { fontFamily: fuente, fontSize: tamano, lineHeight: altoBase, color };
      const chica = { fontFamily: fuente, fontSize: pegado, lineHeight: pegado, color };
      const alPie = altoBase - pegado;

      atomos.push({
        pegado: false,
        nodo: (
          <View
            key={`s${i}`}
            accessibilityRole="text"
            accessibilityLabel={leerExpresion([parte])}
            style={estilos.simbolo}
          >
            <Text style={[estilos.texto, base]}>{parte.valor}</Text>
            <View>
              {parte.sup ? <Text style={[estilos.texto, chica]}>{parte.sup}</Text> : null}
              {parte.sub ? (
                <Text
                  style={[
                    estilos.texto,
                    chica,
                    { marginTop: parte.sup ? alPie - pegado : alPie },
                  ]}
                >
                  {parte.sub}
                </Text>
              ) : null}
            </View>
          </View>
        ),
      });
      return;
    }

    const escrito = valorHueco ?? parte.valor ?? '';
    const lleno = escrito.length > 0;
    const comoFraccion = TECLEADA_FRACCION.exec(escrito);

    atomos.push({
      pegado: false,
      nodo: (
        <View
          key={`h${i}`}
          accessibilityRole="text"
          accessibilityLabel={leerExpresion([{ ...parte, valor: escrito || undefined }])}
          style={[
            estilos.hueco,
            {
              minWidth: parte.ancho ?? Math.round(tamano * 3.5),
              height: parte.alto ?? Math.round(tamano * 1.93),
              borderStyle: lleno ? 'solid' : 'dashed',
              borderColor: lleno ? colores.acento : colores.bordeHueco,
            },
          ]}
        >
          {/* Una respuesta como "12/5" se apila: "12/5" en una línea es justo
              lo que Fraccion existe para evitar, y encima queda desalineada
              con las fracciones apiladas del mismo renglón. */}
          {comoFraccion ? (
            <Fraccion
              arriba={comoFraccion[1]}
              abajo={comoFraccion[2]}
              tamano={Math.round(tamano * 0.84)}
              color={colores.texto}
              fuente={fuente}
            />
          ) : lleno ? (
            <Text
              style={[estilos.texto, { fontSize: Math.round(tamano * 0.84), color: colores.texto }]}
            >
              {escrito}
            </Text>
          ) : null}
        </View>
      ),
    });
  });

  return (
    <View
      style={[estilos.fila, { rowGap: Math.round(tamano * 0.3) }, centrado && estilos.centrada]}
    >
      {atomos.map((atomo, i) => (
        <View key={i} style={{ marginLeft: i === 0 || atomo.pegado ? 0 : espacio }}>
          {atomo.nodo}
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  centrada: {
    justifyContent: 'center',
  },
  texto: {
    fontFamily: fuentes.cuerpo,
  },
  // El sub y el sup cuelgan del símbolo, así que la fila se alinea arriba.
  simbolo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  hueco: {
    backgroundColor: colores.fondo,
    borderWidth: 2,
    borderRadius: radios.hueco,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
});
