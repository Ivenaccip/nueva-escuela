import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BarraEstacion, BotonPrincipal, Cuerpo, Marco, Pie, Tarjeta } from '../../src/componentes';
import { Guardia, useAndamio } from '../../src/estado/Andamio';
import { colores, espacio, fuentes, radios } from '../../src/tema';

/**
 * Con menos que esto no hay una explicación, hay una palabra. No mide si está
 * bien —eso lo haría una segunda llamada a la API, que necesita la llave en un
 * servidor—, sólo que se intentó.
 */
const MINIMO_DE_CARACTERES = 40;

/**
 * Estación 6 · explicarlo. La última: el estudiante escribe con sus palabras lo
 * que entendió. Nadie lo califica en el prototipo: al terminar ve las ideas que
 * cuentan y decide él si las dijo.
 */
export default function Explicar() {
  return (
    <Guardia clave="explicar">
      <Estacion />
    </Guardia>
  );
}

function Estacion() {
  const { tema, redactado, guardarBorrador, marcarHecha, cerrarTema } = useAndamio();
  const { rubrica } = redactado.explicar;

  // Lo escrito vive en la pantalla; el borrador inicial viene de lo que ya llevaba.
  const [escrito, setEscrito] = useState(tema.explicar.borrador);
  const [revisando, setRevisando] = useState(false);
  const cuerpo = useRef<ScrollView>(null);
  const suficiente = escrito.trim().length >= MINIMO_DE_CARACTERES;

  // Guardar en cada tecla escribiría al disco sin parar. Se guarda al salir del
  // campo y al salir de la pantalla, que es cuando de verdad se podría perder.
  const ultimo = useRef(escrito);
  useEffect(() => {
    ultimo.current = escrito;
  }, [escrito]);
  useEffect(() => () => guardarBorrador(ultimo.current), [guardarBorrador]);

  const terminar = () => {
    if (!revisando) {
      guardarBorrador(escrito);
      setRevisando(true);
      return;
    }
    marcarHecha('explicar');
    cerrarTema();
    router.replace('/cierre');
  };

  return (
    <Marco>
      {/* Sin prop `pistas` a propósito: para explicar no hay ayuda, y eso es
          justo lo que se mide. */}
      <BarraEstacion estacion={6} />

      <KeyboardAvoidingView
        style={estilos.cuerpo}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Cuerpo controlador={cuerpo}>
          <View style={estilos.encabezado}>
            <Text style={estilos.migaja}>estación 6 · la última</Text>
            <Text style={estilos.titulo}>{tema.explicar.titulo}</Text>
            <Text style={estilos.aclaracion}>{tema.explicar.aclaracion}</Text>
          </View>

          <View style={estilos.zonaCampo}>
            <View style={estilos.filaEtiqueta}>
              <Text style={estilos.etiqueta}>lo que entendiste</Text>
              {!revisando && !suficiente ? (
                <Text style={estilos.contador}>
                  {escrito.trim().length} de {MINIMO_DE_CARACTERES}
                </Text>
              ) : null}
            </View>
            <TextInput
              accessibilityLabel="Explica con tus palabras lo que entendiste"
              multiline
              value={escrito}
              onChangeText={setEscrito}
              onBlur={() => guardarBorrador(escrito)}
              editable={!revisando}
              style={[estilos.campo, revisando && estilos.campoRevisando]}
              textAlignVertical="top"
              selectionColor={colores.acento}
            />
          </View>

          {revisando ? (
            // La rúbrica es más alta que lo visible: se lleva su comienzo arriba, porque
            // bajar hasta el final dejaría fuera justo el «compáralo con esto».
            <View
              style={estilos.zonaRevision}
              onLayout={(e) =>
                cuerpo.current?.scrollTo({ y: e.nativeEvent.layout.y - 8, animated: true })
              }
            >
              <Tarjeta style={estilos.revision}>
                <Text style={estilos.revisionTitulo}>compáralo con esto</Text>
                <Text style={estilos.revisionAviso}>
                  Nadie te califica aquí: tú decides si dijiste lo importante.
                </Text>

                {rubrica.ideasQueCuentan.map((idea) => (
                  <View key={idea.idea} style={estilos.idea}>
                    {idea.esImprescindible ? (
                      <Text style={estilos.imprescindible}>la que no puede faltar</Text>
                    ) : null}
                    <Text style={estilos.ideaTexto}>{idea.idea}</Text>
                    <Text style={estilos.ideaDicha}>Suena así: {idea.comoSuenaDicha}</Text>
                  </View>
                ))}

                <View style={estilos.ejemplo}>
                  <Text style={estilos.revisionAviso}>Una explicación que sí cuenta:</Text>
                  <Text style={estilos.ideaTexto}>{rubrica.ejemploQueSiCuenta}</Text>
                </View>
              </Tarjeta>
            </View>
          ) : null}
        </Cuerpo>

        {/* Sin margen propio: la nota va a 24 y el botón a 20, cada uno con el
            suyo, como en el diseño. */}
        <Pie sinMargen>
          <View style={estilos.zonaNota}>
            <Text style={estilos.nota}>{tema.explicar.nota}</Text>
          </View>

          <View style={estilos.zonaBoton}>
            <BotonPrincipal desactivado={!revisando && !suficiente} onPress={terminar}>
              {revisando ? 'cerrar el círculo' : 'listo'}
            </BotonPrincipal>
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
  filaEtiqueta: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etiqueta: {
    fontFamily: fuentes.cuerpo,
    fontSize: 13,
    color: colores.textoTenue,
  },
  contador: {
    fontFamily: fuentes.cuerpo,
    fontSize: 13,
    color: colores.textoApenas,
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
  // Al revisar, el campo cede alto para que la rúbrica quede a la vista.
  campoRevisando: {
    flex: 0,
    minHeight: 130,
    borderColor: colores.borde,
  },
  zonaRevision: {
    paddingHorizontal: espacio.margenAncho,
    paddingTop: 18,
    paddingBottom: 8,
  },
  revision: {
    padding: 20,
  },
  revisionTitulo: {
    fontFamily: fuentes.cuerpo,
    fontSize: 13,
    color: colores.acento,
  },
  revisionAviso: {
    marginTop: 6,
    fontFamily: fuentes.cuerpo,
    fontSize: 13,
    lineHeight: 20,
    color: colores.textoTenue,
  },
  idea: {
    marginTop: 18,
  },
  imprescindible: {
    marginBottom: 4,
    fontFamily: fuentes.cuerpoFuerte,
    fontSize: 12,
    color: colores.acento,
  },
  ideaTexto: {
    marginTop: 2,
    fontFamily: fuentes.cuerpo,
    fontSize: 15,
    lineHeight: 24,
    color: colores.texto,
  },
  ideaDicha: {
    marginTop: 4,
    fontFamily: fuentes.cuerpo,
    fontSize: 14,
    lineHeight: 22,
    color: colores.textoTenue,
  },
  ejemplo: {
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
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
