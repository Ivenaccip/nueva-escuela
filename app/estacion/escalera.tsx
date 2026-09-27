import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  BarraEstacion,
  BotonPrincipal,
  Cuerpo,
  Expresion,
  Marco,
  Pie,
  Tarjeta,
} from '../../src/componentes';
import { tema } from '../../src/contenido/actual';
import { colores, espacio, fuentes, radios } from '../../src/tema';

/** Amarra la etiqueta con el campo para quien navega con lector de pantalla. */
const ID_CAMPO = 'respuesta-escalera';

/**
 * Estación 4 · escalera. La misma división de siempre, pero de cabeza: se ve el
 * resultado y falta el divisor. Aquí el estudiante escribe la fracción con sus
 * dedos; si acertó o no se decide cuando llegue el contenido de verdad.
 */
export default function Escalera() {
  const escalera = tema.escalera;
  const numero = tema.estaciones.find((e) => e.clave === 'escalera')?.numero ?? 4;
  // Arranca con lo que el diseño muestra ya tecleado; se borra a mano.
  const [respuesta, setRespuesta] = useState(escalera.respuestaInicial ?? '');

  return (
    <Marco>
      <BarraEstacion estacion={numero} pistas={escalera.pistas} />

      <KeyboardAvoidingView
        style={estilos.cuerpo}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Cuerpo>
          <View style={estilos.cabecera}>
            <View style={estilos.filaCabecera}>
              <Text style={estilos.migaja}>estación {numero} · escalera</Text>
              <View style={estilos.pildora}>
                <Text style={estilos.pildoraTexto}>subiste al {escalera.escalon}</Text>
              </View>
            </View>

            <View
              style={estilos.escalones}
              accessibilityRole="progressbar"
              accessibilityLabel={`Escalón ${escalera.escalon} de ${escalera.escalones}`}
            >
              {Array.from({ length: escalera.escalones }, (_, i) => (
                <View
                  key={i}
                  style={[
                    estilos.escalon,
                    {
                      backgroundColor: i < escalera.escalon ? colores.acento : colores.bordeApagado,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={estilos.zonaSituacion}>
            <Text style={estilos.situacion}>{escalera.situacion}</Text>
          </View>

          <View style={estilos.zonaTarjeta}>
            <Tarjeta style={estilos.tarjeta}>
              {/* Sin valorHueco: el hueco se queda punteado, esperando la fracción. */}
              <Expresion partes={escalera.expresion} tamano={32} centrado />
            </Tarjeta>
          </View>

          <View style={estilos.zonaPregunta}>
            <Text style={estilos.pregunta}>{escalera.pregunta}</Text>
          </View>

          <View style={estilos.zonaCampo}>
            <Text nativeID={ID_CAMPO} style={estilos.etiqueta}>
              tu respuesta
            </Text>
            <TextInput
              value={respuesta}
              onChangeText={setRespuesta}
              accessibilityLabel="tu respuesta"
              accessibilityLabelledBy={ID_CAMPO}
              autoCapitalize="none"
              autoCorrect={false}
              selectionColor={colores.acento}
              style={estilos.campo}
            />
          </View>

          <View style={estilos.espaciador} />
        </Cuerpo>

        <Pie>
          <BotonPrincipal onPress={() => router.push('/estacion/error')}>comprobar</BotonPrincipal>
        </Pie>
      </KeyboardAvoidingView>
    </Marco>
  );
}

const estilos = StyleSheet.create({
  cuerpo: {
    flex: 1,
  },
  cabecera: {
    paddingHorizontal: espacio.margen,
    paddingTop: 8,
  },
  filaCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  migaja: {
    fontFamily: fuentes.cuerpo,
    fontSize: 12,
    color: colores.textoTenue,
  },
  pildora: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radios.pildora,
    backgroundColor: colores.acento,
  },
  pildoraTexto: {
    fontFamily: fuentes.cuerpoFuerte,
    fontSize: 12,
    color: colores.sobreAcento,
  },
  escalones: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 6,
  },
  escalon: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  zonaSituacion: {
    paddingHorizontal: espacio.margen,
    paddingTop: 30,
  },
  situacion: {
    fontFamily: fuentes.displayRegular,
    fontSize: 21,
    lineHeight: 29,
    color: colores.texto,
  },
  zonaTarjeta: {
    paddingHorizontal: espacio.margenAncho,
    paddingTop: 24,
  },
  tarjeta: {
    paddingVertical: 34,
    paddingHorizontal: espacio.margenAncho,
  },
  zonaPregunta: {
    paddingHorizontal: espacio.margen,
    paddingTop: 22,
  },
  pregunta: {
    fontFamily: fuentes.cuerpo,
    fontSize: 16,
    lineHeight: 26,
    color: colores.textoSuave,
  },
  zonaCampo: {
    paddingHorizontal: espacio.margenAncho,
    paddingTop: 18,
  },
  etiqueta: {
    marginBottom: 8,
    fontFamily: fuentes.cuerpo,
    fontSize: 13,
    color: colores.textoTenue,
  },
  campo: {
    height: 60,
    borderRadius: radios.campo,
    backgroundColor: colores.superficie,
    borderWidth: 2,
    borderColor: colores.acento,
    paddingHorizontal: 18,
    fontFamily: fuentes.cuerpo,
    fontSize: 24,
    color: colores.texto,
  },
  espaciador: {
    flex: 1,
  },
});
