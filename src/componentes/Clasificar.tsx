import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PiezaDePantalla, ResultadoDePiezas } from '../contenido/tipos';
import { colores, fuentes, radios, TOCABLE } from '../tema';
import { leerExpresion } from './Expresion';
import { TextoDePieza } from './TextoDePieza';

type Categoria = { id: string; nombre: string };

type Props = {
  /** Dos o tres. Los nombres caben en una píldora: unas diez letras. */
  categorias: Categoria[];
  piezas: PiezaDePantalla[];
  /** Qué categoría le puso a cada pieza: `id` de pieza → `id` de categoría. */
  elegidas: Record<string, string>;
  resultado: ResultadoDePiezas | null;
  alElegir: (piezaId: string, categoriaId: string) => void;
};

/**
 * Clasificar: cada pieza trae sus categorías debajo y se toca una. Una sola
 * toque por pieza, sin arrastrar, y las categorías siempre a la vista.
 */
export function Clasificar({ categorias, piezas, elegidas, resultado, alElegir }: Props) {
  const cerrada = resultado?.bien === true;
  const malas = new Set(resultado && !resultado.bien ? resultado.malas : []);
  const hechas = piezas.filter((p) => elegidas[p.id] !== undefined).length;

  return (
    <View>
      <Text style={estilos.rotulo}>
        {hechas} de {piezas.length} clasificadas
      </Text>
      <View style={estilos.lista}>
        {piezas.map((pieza) => {
          const elegida = elegidas[pieza.id];
          const mala = malas.has(pieza.id);
          return (
            <View
              key={pieza.id}
              style={[
                estilos.tarjeta,
                elegida !== undefined && estilos.tarjetaClasificada,
                mala && estilos.tarjetaMala,
              ]}
            >
              <TextoDePieza
                partes={pieza.partes}
                tamano={18}
                color={elegida !== undefined ? colores.texto : colores.textoSuave}
              />
              <View style={estilos.pildoras} accessibilityRole="radiogroup">
                {categorias.map((categoria) => {
                  const marcada = elegida === categoria.id;
                  return (
                    <Pressable
                      key={categoria.id}
                      accessibilityRole="radio"
                      accessibilityLabel={`${leerExpresion(pieza.partes)}: ${categoria.nombre}`}
                      accessibilityState={{ checked: marcada, disabled: cerrada }}
                      aria-checked={marcada}
                      disabled={cerrada}
                      onPress={() => alElegir(pieza.id, categoria.id)}
                      style={({ pressed }) => [
                        estilos.pildora,
                        marcada && estilos.pildoraMarcada,
                        marcada && mala && estilos.pildoraMala,
                        pressed && !marcada && estilos.pildoraTocada,
                      ]}
                    >
                      <Text style={[estilos.pildoraTexto, marcada && estilos.pildoraTextoMarcada]}>
                        {categoria.nombre}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  rotulo: {
    marginBottom: 9,
    fontFamily: fuentes.cuerpo,
    fontSize: 13,
    color: colores.textoTenue,
  },
  lista: {
    gap: 9,
  },
  tarjeta: {
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 14,
    borderRadius: radios.tecla,
    borderWidth: 2,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
    gap: 12,
  },
  tarjetaClasificada: {
    borderColor: colores.acento,
  },
  tarjetaMala: {
    borderColor: colores.error,
    backgroundColor: colores.errorFondo,
  },
  pildoras: {
    flexDirection: 'row',
    gap: 8,
  },
  pildora: {
    flex: 1,
    height: TOCABLE,
    borderRadius: radios.hueco,
    borderWidth: 2,
    borderColor: colores.borde,
    backgroundColor: colores.fondo,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  pildoraTocada: {
    backgroundColor: colores.superficieAlta,
  },
  pildoraMarcada: {
    borderColor: colores.acento,
    backgroundColor: colores.superficieAlta,
  },
  pildoraMala: {
    borderColor: colores.error,
  },
  pildoraTexto: {
    fontFamily: fuentes.cuerpo,
    fontSize: 14,
    color: colores.textoSuave,
  },
  pildoraTextoMarcada: {
    fontFamily: fuentes.cuerpoFuerte,
    color: colores.texto,
  },
});
