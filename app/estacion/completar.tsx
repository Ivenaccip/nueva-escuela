import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  BarraEstacion,
  BloqueRespuesta,
  BotonPista,
  BotonPrincipal,
  Cuerpo,
  Expresion,
  IconoBorrar,
  Marco,
  Pie,
  Tarjeta,
} from '../../src/componentes';
import { respuestaDeCompletar, type Respuesta } from '../../src/contenido/calificar';
import { Guardia, useAndamio } from '../../src/estado/Andamio';
import { SEGUNDOS_PARA_PISTA } from '../../src/estado/modelo';
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

/**
 * Estación 3 · completar el paso. El enunciado ya está resuelto casi entero y
 * falta un pedazo: el estudiante lo teclea abajo y lo ve aparecer en el hueco.
 */
export default function Completar() {
  return (
    <Guardia clave="completar">
      <Estacion />
    </Guardia>
  );
}

function Estacion() {
  const { tema, redactado, avance, marcarHecha, gastarPista } = useAndamio();
  const contenido = redactado.completar;

  const [escrito, setEscrito] = useState('');
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const acertada = respuesta?.bien === true;

  const teclear = (tecla: string) => {
    if (acertada) return;
    // Lo que se contestó era sobre lo que había escrito antes: al cambiarlo, deja de valer.
    setRespuesta(null);
    if (tecla === BORRAR) return setEscrito((antes) => antes.slice(0, -1));
    setEscrito((antes) => antes + tecla);
  };

  const comprobar = () => setRespuesta(respuestaDeCompletar(escrito, contenido));

  const seguir = () => {
    marcarHecha('completar');
    router.replace('/estacion/escalera');
  };

  return (
    <Marco>
      <BarraEstacion estacion={3} pistas={tema.completar.pistas} />

      <Cuerpo desplazarCuando={respuesta}>
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

        {respuesta ? (
          <BloqueRespuesta
            bien={respuesta.bien}
            titulo={respuesta.bien ? 'Eso es' : 'Todavía no'}
            texto={
              respuesta.bien ? null : (respuesta.texto ?? 'Prueba otra vez, o pide una pista.')
            }
          />
        ) : null}

        <View style={estilos.zonaPista}>
          <BotonPista
            pistas={contenido.pistas}
            liberadas={avance.pistasLiberadas.completar ?? 0}
            restantes={avance.pistasRestantes}
            alGastar={() => gastarPista('completar')}
            espera={SEGUNDOS_PARA_PISTA}
          />
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

        <BotonPrincipal
          desactivado={!acertada && escrito === ''}
          onPress={acertada ? seguir : comprobar}
        >
          {acertada ? 'seguir' : 'comprobar'}
        </BotonPrincipal>
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
