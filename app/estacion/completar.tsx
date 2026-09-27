import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  BarraEstacion,
  BotonPrincipal,
  Cuerpo,
  Expresion,
  IconoBorrar,
  IconoPista,
  Marco,
  Pie,
  Tarjeta,
} from '../../src/componentes';
import { tema } from '../../src/contenido/actual';
import { colores, espacio, fuentes, radios } from '../../src/tema';

/** La tecla que borra en vez de escribir. */
const BORRAR = 'borrar';

/** El teclado va por filas de tres para que las columnas salgan parejas solas. */
const FILAS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['/', '0', BORRAR],
];

/** El único radio del diseño que el tema no lleva; el resto sí sale de `radios`. */
const RADIO_PISTA = 13;

/** Lo que el diseño muestra a medio teclear. Es contenido, así que vive en demo. */
const HUECO = tema.completar.expresion.find((parte) => parte.tipo === 'hueco');

/**
 * Estación 3 · completar el paso. El enunciado ya está resuelto casi entero y
 * falta un pedazo: el estudiante lo teclea abajo y lo ve aparecer en el hueco.
 *
 * Aquí nadie revisa si está bien. Comprobar sólo avanza; la evaluación llega
 * junto con el contenido de verdad.
 */
export default function Completar() {
  const [escrito, setEscrito] = useState(HUECO?.valor ?? '');

  const teclear = (tecla: string) => {
    if (tecla === BORRAR) return setEscrito((antes) => antes.slice(0, -1));
    setEscrito((antes) => antes + tecla);
  };

  return (
    <Marco>
      <BarraEstacion estacion={3} pistas={tema.completar.pistas} />

      <Cuerpo>
        <View style={estilos.etiqueta}>
          <Text style={estilos.etiquetaTexto}>estación 3 · completar el paso</Text>
        </View>

        <View style={estilos.zonaTarjeta}>
          <Tarjeta style={estilos.tarjeta}>
            <Expresion
              partes={tema.completar.expresion}
              tamano={30}
              centrado
              valorHueco={escrito}
            />
          </Tarjeta>
        </View>

        <View style={estilos.zonaPista}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Pedir una pista, disponible en ${tema.completar.pistaEn}`}
            style={({ pressed }) => [estilos.pista, pressed && estilos.pistaPresionada]}
          >
            <IconoPista tamano={16} />
            <Text style={estilos.pistaTexto}>una pista en {tema.completar.pistaEn}</Text>
          </Pressable>
        </View>

        <View style={estilos.espaciador} />
      </Cuerpo>

      {/* El teclado se ancla junto al botón: sin él la pantalla no se puede usar. */}
      <Pie>
        <View style={estilos.teclado}>
          {FILAS.map((fila) => (
            <View key={fila.join('')} style={estilos.filaTeclas}>
              {fila.map((tecla) => {
                const esBorrar = tecla === BORRAR;
                return (
                  <Pressable
                    key={tecla}
                    accessibilityRole="button"
                    accessibilityLabel={esBorrar ? 'Borrar' : tecla === '/' ? 'diagonal' : tecla}
                    onPress={() => teclear(tecla)}
                    style={({ pressed }) => [estilos.tecla, pressed && estilos.teclaPresionada]}
                  >
                    {esBorrar ? (
                      <IconoBorrar tamano={22} />
                    ) : (
                      <Text style={estilos.teclaTexto}>{tecla}</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <BotonPrincipal onPress={() => router.push('/estacion/escalera')}>comprobar</BotonPrincipal>
      </Pie>
    </Marco>
  );
}

const estilos = StyleSheet.create({
  etiqueta: {
    paddingHorizontal: espacio.margen,
    paddingTop: 8,
  },
  etiquetaTexto: {
    fontFamily: fuentes.cuerpo,
    fontSize: 12,
    color: colores.textoTenue,
  },
  zonaTarjeta: {
    paddingHorizontal: espacio.margenAncho,
    paddingTop: 26,
  },
  tarjeta: {
    paddingVertical: 30,
    paddingHorizontal: espacio.margenAncho,
  },
  zonaPista: {
    paddingHorizontal: espacio.margenAncho,
    paddingTop: 16,
  },
  pista: {
    height: 46,
    borderRadius: RADIO_PISTA,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colores.borde,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pistaPresionada: {
    backgroundColor: colores.superficie,
  },
  pistaTexto: {
    fontFamily: fuentes.cuerpo,
    fontSize: 14,
    color: colores.textoTenue,
  },
  // Empuja el teclado al fondo sin fijarle una altura a lo de arriba.
  espaciador: {
    flex: 1,
  },
  // El margen lateral ya lo pone el Pie; aquí sólo queda el hueco hasta el botón.
  teclado: {
    paddingBottom: 16,
    gap: 10,
  },
  filaTeclas: {
    flexDirection: 'row',
    gap: 10,
  },
  tecla: {
    flex: 1,
    height: 56,
    borderRadius: radios.tecla,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teclaPresionada: {
    backgroundColor: colores.superficieAlta,
  },
  teclaTexto: {
    fontFamily: fuentes.cuerpo,
    fontSize: 22,
    color: colores.texto,
  },
});
