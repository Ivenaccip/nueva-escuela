import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  BarraEstacion,
  BloqueRespuesta,
  BotonPrincipal,
  Cuerpo,
  Expresion,
  leerExpresion,
  Marco,
  Pie,
} from '../../src/componentes';
import { respuestaDeContacto, type Respuesta } from '../../src/contenido/calificar';
import { Guardia, useAndamio } from '../../src/estado/Andamio';
import { colores, espacio, fuentes, radios } from '../../src/tema';

/**
 * Estación 2 · primer contacto. Es el primer intento del tema y va sin
 * penalización: se marca una opción y se lee qué revela, acierte o no. Avanzar
 * nunca se bloquea aquí; lo que cuenta es lo que la opción enseña.
 */
export default function Contacto() {
  const { tema } = useAndamio();
  // Cada pregunta del bloque es una pantalla nueva: con `key` se monta limpia,
  // sin opción marcada ni respuesta de la anterior.
  return (
    <Guardia clave="contacto">
      <Pregunta key={tema.contacto.indice} />
    </Guardia>
  );
}

function Pregunta() {
  const { tema, redactado, marcarHecha, siguientePregunta } = useAndamio();
  const { enunciado, opciones, indice, total } = tema.contacto;
  const opcionesRedactadas = redactado.contacto.preguntas[indice - 1].opciones;
  const letraCorrecta = opcionesRedactadas.find((o) => o.esCorrecta)?.letra;

  // Sin nada marcado al llegar: una opción ya elegida de antemano regalaría el
  // «comprobar» a quien no leyó. Las tarjetas se ven tocables por su borde.
  const [elegida, setElegida] = useState<string | undefined>();
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);

  const comprobar = () => {
    const opcion = opcionesRedactadas.find((o) => o.letra === elegida);
    if (opcion) setRespuesta(respuestaDeContacto(opcion));
  };

  const seguir = () => {
    if (indice < total) return siguientePregunta();
    marcarHecha('contacto');
    router.replace('/estacion/completar');
  };

  return (
    <Marco>
      <BarraEstacion estacion={2} />

      <Cuerpo desplazarCuando={respuesta}>
        <View style={estilos.meta}>
          <Text style={estilos.etiqueta}>estación 2 · sin penalización</Text>
          <Text style={estilos.etiqueta}>
            {indice} de {total}
          </Text>
        </View>

        <View style={estilos.enunciado}>
          <Expresion partes={enunciado} tamano={24} fuente={fuentes.display} />
        </View>

        <View style={estilos.opciones} accessibilityRole="radiogroup">
          {opciones.map((opcion) => {
            const marcada = opcion.letra === elegida;
            // Ya respondida, la correcta se muestra en ámbar y la equivocada que
            // se eligió en rojo: ver cuál era es parte de lo que enseña esta estación.
            const esLaCorrecta = respuesta !== null && opcion.letra === letraCorrecta;
            const fallada = respuesta !== null && marcada && !respuesta.bien;
            return (
              <Pressable
                key={opcion.letra}
                accessibilityRole="radio"
                accessibilityState={{ checked: marcada, disabled: respuesta !== null }}
                aria-checked={marcada}
                accessibilityLabel={`Opción ${opcion.letra}: ${leerExpresion(opcion.partes)}`}
                disabled={respuesta !== null}
                onPress={() => setElegida(opcion.letra)}
                style={[
                  estilos.opcion,
                  marcada ? estilos.opcionMarcada : estilos.opcionQuieta,
                  esLaCorrecta && estilos.opcionCorrecta,
                  fallada && estilos.opcionFallada,
                ]}
              >
                <View
                  style={[
                    estilos.insignia,
                    marcada ? estilos.insigniaMarcada : estilos.insigniaQuieta,
                  ]}
                >
                  <Text
                    style={[estilos.letra, marcada ? estilos.letraMarcada : estilos.letraQuieta]}
                  >
                    {opcion.letra}
                  </Text>
                </View>
                {/* Sin esto, una opción que no quepa se saldría del borde en
                    vez de partirse, como pasa en la estación 5. */}
                <View style={estilos.contenidoOpcion}>
                  <Expresion
                    partes={opcion.partes}
                    tamano={20}
                    color={marcada ? colores.texto : colores.textoSuave}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>

        {respuesta ? (
          <BloqueRespuesta
            bien={respuesta.bien}
            titulo={respuesta.bien ? 'Esa es' : 'Esa no, y vale ver por qué'}
            texto={respuesta.texto}
          />
        ) : null}

        <View style={estilos.espaciador} />
      </Cuerpo>

      <Pie>
        <BotonPrincipal
          desactivado={!respuesta && elegida === undefined}
          onPress={respuesta ? seguir : comprobar}
        >
          {!respuesta ? 'comprobar' : indice < total ? 'siguiente pregunta' : 'seguir'}
        </BotonPrincipal>
      </Pie>
    </Marco>
  );
}

const estilos = StyleSheet.create({
  meta: {
    paddingHorizontal: espacio.margen,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etiqueta: {
    fontFamily: fuentes.cuerpo,
    fontSize: 12,
    color: colores.textoTenue,
  },
  enunciado: {
    paddingHorizontal: espacio.margen,
    paddingTop: 18,
  },
  opciones: {
    paddingHorizontal: espacio.margenAncho,
    paddingTop: 22,
    gap: 11,
  },
  contenidoOpcion: {
    flex: 1,
  },
  opcion: {
    // El diseño mide 64: con `minHeight` una opción de dos renglones crece en
    // vez de desbordarse, y la que cabe en uno se sigue viendo a 64 exactos.
    minHeight: 64,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: radios.opcion,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  opcionQuieta: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
  },
  opcionMarcada: {
    backgroundColor: colores.superficieAlta,
    borderColor: colores.acento,
  },
  // Después de responder, estos dos pisan el estilo de «marcada».
  opcionCorrecta: {
    backgroundColor: colores.superficieAlta,
    borderColor: colores.acento,
  },
  opcionFallada: {
    backgroundColor: colores.errorFondo,
    borderColor: colores.error,
  },
  insignia: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insigniaQuieta: {
    backgroundColor: colores.borde,
  },
  insigniaMarcada: {
    backgroundColor: colores.acento,
  },
  letra: {
    fontFamily: fuentes.cuerpoFuerte,
    fontSize: 13,
  },
  letraQuieta: {
    color: colores.textoSuave,
  },
  letraMarcada: {
    color: colores.sobreAcento,
  },
  espaciador: {
    flex: 1,
  },
});
