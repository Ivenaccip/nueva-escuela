import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { BarraEstacion, BotonPrincipal, Cuerpo, Marco, Pie } from '../../src/componentes';
import { tema } from '../../src/contenido/demo';
import { colores, espacio, fuentes, radios } from '../../src/tema';

/**
 * Estación 6 · explicarlo. La última: el estudiante escribe con sus palabras
 * lo que entendió. No hay nada que elegir ni que copiar, y por eso tampoco se
 * evalúa aquí: la respuesta se juzga cuando llegue el contenido de verdad.
 */
export default function Explicar() {
  // Lo escrito vive en la pantalla; el borrador inicial viene del contenido.
  const [escrito, setEscrito] = useState(tema.explicar.borrador);

  return (
    <Marco>
      {/* Sin prop `pistas` a propósito: para explicar no hay ayuda, y eso es
          justo lo que se mide. */}
      <BarraEstacion estacion={6} />

      <KeyboardAvoidingView
        style={estilos.cuerpo}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Cuerpo>
          <View style={estilos.encabezado}>
            <Text style={estilos.migaja}>estación 6 · la última</Text>
            <Text style={estilos.titulo}>{tema.explicar.titulo}</Text>
            <Text style={estilos.aclaracion}>{tema.explicar.aclaracion}</Text>
          </View>

          <View style={estilos.zonaCampo}>
            <Text style={estilos.etiqueta}>lo que entendiste</Text>
            <TextInput
              accessibilityLabel="Explica con tus palabras lo que entendiste"
              multiline
              value={escrito}
              onChangeText={setEscrito}
              style={estilos.campo}
              textAlignVertical="top"
              selectionColor={colores.acento}
            />
          </View>
        </Cuerpo>

        {/* Sin margen propio: la nota va a 24 y el botón a 20, cada uno con el
            suyo, como en el diseño. */}
        <Pie sinMargen>
          <View style={estilos.zonaNota}>
            <Text style={estilos.nota}>{tema.explicar.nota}</Text>
          </View>

          <View style={estilos.zonaBoton}>
            <BotonPrincipal onPress={() => router.push('/cierre')}>listo</BotonPrincipal>
          </View>
        </Pie>
      </KeyboardAvoidingView>
    </Marco>
  );
}

const estilos = StyleSheet.create({
  cuerpo: {
    flex: 1,
  },
  encabezado: {
    paddingHorizontal: espacio.margen,
    paddingTop: 14,
  },
  migaja: {
    fontFamily: fuentes.cuerpo,
    fontSize: 12,
    color: colores.textoTenue,
  },
  titulo: {
    marginTop: 12,
    fontFamily: fuentes.display,
    fontSize: 28,
    lineHeight: 35,
    color: colores.texto,
  },
  aclaracion: {
    marginTop: 14,
    fontFamily: fuentes.cuerpo,
    fontSize: 15,
    lineHeight: 24,
    color: colores.textoTenue,
  },
  zonaCampo: {
    // flexGrow y no flex: dentro del Cuerpo crece cuando sobra alto, pero nunca
    // se encoge por debajo del campo, que es lo que impedía desplazarse.
    flexGrow: 1,
    paddingHorizontal: espacio.margenAncho,
    paddingTop: 24,
  },
  etiqueta: {
    marginBottom: 10,
    fontFamily: fuentes.cuerpo,
    fontSize: 13,
    color: colores.textoTenue,
  },
  campo: {
    // El flex reparte el alto que sobra; cuando no sobra ninguno, el campo se
    // quedaría en nada. La minHeight es el alto que tiene en el lienzo de 844.
    flex: 1,
    minHeight: 300,
    borderRadius: radios.tarjeta,
    backgroundColor: colores.superficie,
    borderWidth: 2,
    borderColor: colores.acento,
    padding: 18,
    fontFamily: fuentes.cuerpo,
    fontSize: 16,
    lineHeight: 26,
    color: colores.texto,
  },
  zonaNota: {
    paddingHorizontal: espacio.margen,
    paddingTop: 14,
  },
  nota: {
    fontFamily: fuentes.cuerpo,
    fontSize: 13,
    lineHeight: 20,
    color: colores.textoApenas,
  },
  zonaBoton: {
    paddingHorizontal: espacio.margenAncho,
    paddingTop: 18,
  },
});
