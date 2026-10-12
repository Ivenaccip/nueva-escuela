import { router } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  BarraEstacion,
  BotonPrincipal,
  Cuerpo,
  IconoReproducir,
  Marco,
  Pie,
  Tarjeta,
} from '../../src/componentes';
import { Guardia, useAndamio } from '../../src/estado/Andamio';
import { colores, espacio, fuentes, TOCABLE } from '../../src/tema';

/** A dónde lleva esta estación, tanto por el botón como por el atajo. */
const SIGUIENTE = '/estacion/contacto';

/**
 * Estación 1 · ver el video. La única estación sin pistas y sin respuesta que
 * dar: aquí el estudiante nada más mira y decide si ya lo sabía.
 */
export default function VerElVideo() {
  return (
    <Guardia clave="ver">
      <Estacion />
    </Guardia>
  );
}

function Estacion() {
  const { tema, marcarHecha } = useAndamio();
  const video = tema.ver.video;

  const avanzar = () => {
    marcarHecha('ver');
    router.replace(SIGUIENTE);
  };

  // El video vive en YouTube: se abre allá, en su app o en el navegador. Incrustarlo
  // pediría un WebView distinto por plataforma, y para el prototipo no vale lo que cuesta.
  const reproducir = () => {
    if (video) Linking.openURL(video.url).catch(() => {});
  };

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
            {video ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Reproducir el video «${video.titulo}», de ${video.canal}. Se abre en YouTube.`}
                onPress={reproducir}
                style={({ pressed }) => [estilos.reproducir, pressed && estilos.reproducirTocado]}
              >
                <IconoReproducir />
              </Pressable>
            ) : (
              <Text style={estilos.sinVideo}>
                Este tema todavía no tiene un video en español. Lee el resumen de abajo y sigue.
              </Text>
            )}

            {/* Sin duración no se pinta la píldora: una vacía sobre el video se
                ve como un error de la app, y la duración sólo existe si venía
                escrita en el resultado de la búsqueda. */}
            {video && tema.ver.duracion ? (
              <View style={estilos.duracion}>
                <Text style={estilos.duracionTexto}>{tema.ver.duracion}</Text>
              </View>
            ) : null}

            {/* De quién es el video y adónde lleva: el estudiante no lo escogió. */}
            {video ? (
              <Text numberOfLines={1} style={estilos.canal}>
                {video.canal} · YouTube
              </Text>
            ) : null}
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
  sinVideo: {
    paddingHorizontal: 28,
    textAlign: 'center',
    fontFamily: fuentes.cuerpo,
    fontSize: 15,
    lineHeight: 24,
    color: colores.textoTenue,
  },
  // A la izquierda de la píldora de duración, que ocupa los últimos ~60 px.
  canal: {
    position: 'absolute',
    left: 14,
    right: 84,
    bottom: 16,
    fontFamily: fuentes.cuerpo,
    fontSize: 12,
    color: colores.textoTenue,
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
