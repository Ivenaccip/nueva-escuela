import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  BarraEstacion,
  BloqueRespuesta,
  BotonPista,
  BotonPrincipal,
  Cuerpo,
  EntradaDeRespuesta,
  Expresion,
  Marco,
  Pie,
  Tarjeta,
  usePuestas,
} from '../../src/componentes';
import { respuestaDeEscalon, type Respuesta } from '../../src/contenido/calificar';
import { Guardia, useAndamio } from '../../src/estado/Andamio';
import { SEGUNDOS_PARA_PISTA } from '../../src/estado/modelo';
import { colores, espacio, fuentes, radios } from '../../src/tema';

/** Amarra la etiqueta con el campo para quien navega con lector de pantalla. */
const ID_CAMPO = 'respuesta-escalera';

/**
 * Estación 4 · escalera. El mismo procedimiento en cinco situaciones cada vez
 * más difíciles: cada escalón se sube sólo si se contesta bien, y al último se
 * cierra la estación.
 */
export default function Escalera() {
  const { tema } = useAndamio();
  // Cada escalón es una pantalla nueva: con `key` se monta limpio, sin la
  // respuesta ni el comentario del anterior.
  return (
    <Guardia clave="escalera">
      <Escalon key={tema.escalera.escalon} />
    </Guardia>
  );
}

function Escalon() {
  const { tema, redactado, avance, marcarHecha, gastarPista, siguienteEscalon } = useAndamio();
  const escalera = tema.escalera;
  const numero = tema.estaciones.find((e) => e.clave === 'escalera')?.numero ?? 4;
  const contenido = redactado.escalera.escalones[escalera.escalon - 1];
  const llave = `escalera-${escalera.escalon}`;
  const esElUltimo = escalera.escalon >= escalera.escalones;

  const entrada = escalera.entrada;
  const puestas = usePuestas();
  const respuesta = puestas.escrito;
  const [resultado, setResultado] = useState<Respuesta | null>(null);
  const acertado = resultado?.bien === true;

  // Lo que se contestó era sobre lo que había escrito antes: al cambiarlo, deja de valer.
  const cambiar = (hacer: () => void) => {
    if (acertado) return;
    setResultado(null);
    hacer();
  };

  // Con dígitos el campo es del sistema y acepta letras, pero la estación 3 sólo
  // teclea dígitos y diagonal, y el contrato pide lo mismo aquí: se filtra al escribir.
  const escribirEnElCampo = (texto: string) =>
    cambiar(() =>
      puestas.escribir(entrada.modo === 'digitos' ? texto.replace(/[^0-9/]/g, '') : texto),
    );

  const comprobar = () => {
    if (respuesta !== '') setResultado(respuestaDeEscalon(respuesta, contenido));
  };

  // Con fichas el teclado va abajo y el campo sólo muestra lo escrito; con opciones
  // no hay campo, la elección está en la lista; con dígitos o texto el campo se teclea.
  const campoSeTeclea = entrada.modo === 'digitos' || entrada.modo === 'texto';

  const seguir = () => {
    if (!esElUltimo) return siguienteEscalon();
    marcarHecha('escalera');
    router.replace('/estacion/error');
  };

  return (
    <Marco>
      <BarraEstacion estacion={numero} pistas={escalera.pistas} />

      <KeyboardAvoidingView
        style={estilos.cuerpo}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Cuerpo desplazarCuando={resultado}>
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

          {entrada.modo === 'opciones' ? null : (
            <View style={estilos.zonaCampo}>
              <Text nativeID={ID_CAMPO} style={estilos.etiqueta}>
                tu respuesta
              </Text>
              {campoSeTeclea ? (
                <TextInput
                  value={respuesta}
                  onChangeText={escribirEnElCampo}
                  editable={!acertado}
                  accessibilityLabel="tu respuesta"
                  accessibilityLabelledBy={ID_CAMPO}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType={entrada.modo === 'digitos' ? 'numbers-and-punctuation' : 'default'}
                  returnKeyType="done"
                  onSubmitEditing={acertado ? seguir : comprobar}
                  selectionColor={colores.acento}
                  style={[estilos.campo, resultado && !resultado.bien && estilos.campoFallado]}
                />
              ) : (
                <View
                  accessibilityRole="text"
                  accessibilityLabel={`tu respuesta: ${respuesta || 'vacía'}`}
                  style={[estilos.campo, resultado && !resultado.bien && estilos.campoFallado]}
                >
                  <Text style={estilos.campoLeido}>{respuesta}</Text>
                </View>
              )}
            </View>
          )}

          {resultado ? (
            <BloqueRespuesta
              bien={resultado.bien}
              titulo={resultado.bien ? 'Eso es' : 'Todavía no'}
              texto={
                resultado.bien ? null : (resultado.texto ?? 'Prueba otra vez, o pide una pista.')
              }
            />
          ) : null}

          <View style={estilos.zonaPista}>
            <BotonPista
              pistas={contenido.pistas}
              liberadas={avance.pistasLiberadas[llave] ?? 0}
              restantes={avance.pistasRestantes}
              alGastar={() => gastarPista(llave)}
              espera={SEGUNDOS_PARA_PISTA}
            />
          </View>

          <View style={estilos.espaciador} />
        </Cuerpo>

        <Pie>
          {campoSeTeclea ? null : (
            <EntradaDeRespuesta
              entrada={entrada}
              escrito={respuesta}
              resultado={resultado}
              poner={(tecla) => cambiar(() => puestas.poner(tecla))}
              borrar={() => cambiar(puestas.borrar)}
              elegir={(etiqueta) => cambiar(() => puestas.elegir(etiqueta))}
              escribir={escribirEnElCampo}
              alEnviar={acertado ? seguir : comprobar}
            />
          )}
          <BotonPrincipal
            desactivado={!acertado && respuesta === ''}
            onPress={acertado ? seguir : comprobar}
          >
            {!acertado ? 'comprobar' : esElUltimo ? 'seguir' : 'subir al siguiente'}
          </BotonPrincipal>
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
  campoFallado: {
    borderColor: colores.error,
  },
  // El campo de lectura (fichas) es un View: la letra va en su hijo.
  campoLeido: {
    fontFamily: fuentes.cuerpo,
    fontSize: 24,
    lineHeight: 56,
    color: colores.texto,
  },
  zonaPista: {
    paddingHorizontal: espacio.margenAncho,
    paddingTop: 16,
  },
  espaciador: {
    flex: 1,
  },
});
