import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  BarraEstacion,
  BotonPrincipal,
  Cuerpo,
  IconoReproducir,
  Marco,
  Pie,
  Tarjeta,
} from '../../src/componentes';
import { tema } from '../../src/contenido/demo';
import { colores, espacio, fuentes, TOCABLE } from '../../src/tema';

/** A dónde lleva esta estación, tanto por el botón como por el atajo. */
const SIGUIENTE = '/estacion/contacto';

/**
 * Estación 1 · ver el video. La única estación sin pistas y sin respuesta que
 * dar: aquí el estudiante nada más mira y decide si ya lo sabía.
 */
export default function VerElVideo() {
  const avanzar = () => router.push(SIGUIENTE);

  return (
    <Marco>
      <BarraEstacion estacion={1} />

      <Cuerpo>
        <View style={estilos.encabezado}>
          <Text style={estilos.migaja}>estación 1 · ver</Text>
          <Text style={estilos.titulo}>{tema.ver.pregunta}</Text>
        </View>

        <View style={estilos.zonaVideo}>
          <Tarjeta style={estilos.video}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reproducir el video"
              style={({ pressed }) => [estilos.reproducir, pressed && estilos.reproducirTocado]}
            >
              <IconoReproducir />
            </Pressable>

            <View style={estilos.duracion}>
              <Text style={estilos.duracionTexto}>{tema.ver.duracion}</Text>
            </View>
          </Tarjeta>
        </View>

        <View style={estilos.zonaResumen}>
          <Text style={estilos.resumen}>{tema.ver.resumen}</Text>
        </View>

        <View style={estilos.hueco} />
      </Cuerpo>

      {/* Sin margen del Pie: el atajo y el botón traen cada uno el suyo. */}
      <Pie sinMargen>
        <View style={estilos.zonaSaltar}>
          <Pressable
            accessibilityRole="button"
            onPress={avanzar}
            style={({ pressed }) => [estilos.saltar, pressed && estilos.saltarTocado]}
          >
            <Text style={estilos.saltarTexto}>¿Ya lo sabías? Sáltalo</Text>
          </Pressable>
        </View>

        <View style={estilos.boton}>
          <BotonPrincipal onPress={avanzar}>ya lo vi</BotonPrincipal>
        </View>
      </Pie>
    </Marco>
  );
}

const estilos = StyleSheet.create({
  encabezado: {
    paddingHorizontal: espacio.margen,
    paddingTop: 10,
  },
  migaja: {
    fontFamily: fuentes.cuerpo,
    fontSize: 12,
    color: colores.textoTenue,
  },
  titulo: {
    marginTop: 8,
    fontFamily: fuentes.display,
    fontSize: 27,
    lineHeight: 33,
    color: colores.texto,
  },
  zonaVideo: {
    paddingHorizontal: espacio.margenAncho,
    paddingTop: 26,
  },
  video: {
    height: 197,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reproducir: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colores.acento,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reproducirTocado: {
    backgroundColor: colores.acentoClaro,
  },
  duracion: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 7,
    backgroundColor: colores.fondo,
  },
  duracionTexto: {
    fontFamily: fuentes.cuerpo,
    fontSize: 12,
    color: colores.textoSuave,
  },
  zonaResumen: {
    paddingHorizontal: espacio.margen,
    paddingTop: 20,
  },
  resumen: {
    fontFamily: fuentes.cuerpo,
    fontSize: 15,
    lineHeight: 24,
    color: colores.textoSuave,
  },
  hueco: {
    flex: 1,
  },
  zonaSaltar: {
    paddingHorizontal: espacio.margen,
  },
  saltar: {
    minHeight: TOCABLE,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saltarTocado: {
    opacity: 0.6,
  },
  saltarTexto: {
    fontFamily: fuentes.cuerpo,
    fontSize: 15,
    color: colores.textoTenue,
  },
  boton: {
    marginTop: 16,
    paddingHorizontal: espacio.margenAncho,
  },
});
