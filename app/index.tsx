import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  BotonPrincipal,
  CirculoTema,
  Cuerpo,
  IconoLlama,
  IconoMoneda,
  Marco,
  Pie,
} from '../src/componentes';
import type { Estacion } from '../src/contenido/tipos';
import { useAndamio } from '../src/estado/Andamio';
import { colores, espacio, fuentes, radios, TOCABLE } from '../src/tema';

/**
 * El círculo del tema. Es la pantalla a la que se vuelve siempre: dice en qué
 * estación va y deja entrar a las que ya llegó. Las de más adelante siguen
 * cerradas: el círculo se recorre en orden.
 */
export default function Circulo() {
  const { tema, perfil, materias, materia, repasarEstacion, repasarTema } = useAndamio();

  // Sin ninguna «actual», las seis están hechas: el círculo está cerrado.
  const actual = tema.estaciones.find((e) => e.estado === 'actual');

  const entrar = (estacion: Estacion) => {
    if (estacion.estado === 'cerrada') return;
    // Volver a una estación hecha la empieza de nuevo, no la deja en su último paso.
    if (estacion.estado === 'hecha') repasarEstacion(estacion.clave);
    router.push(`/estacion/${estacion.clave}`);
  };

  const elegirTema = () => router.push({ pathname: '/temas', params: { materia } });

  return (
    <Marco>
      <Cuerpo>
        <View style={estilos.cuentas}>
          <View style={estilos.cuenta}>
            <IconoLlama />
            <Text style={estilos.cifra}>{perfil.racha}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cambiar de tema"
            onPress={elegirTema}
            style={estilos.cambiar}
          >
            <Text style={estilos.cambiarTexto}>cambiar tema</Text>
          </Pressable>
          <View style={estilos.cuenta}>
            <IconoMoneda />
            <Text style={estilos.cifra}>{perfil.monedas}</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={estilos.materias}
          contentContainerStyle={estilos.materiasContenido}
        >
          {materias.map((m) => {
            const activa = m.clave === materia;
            return (
              <Pressable
                key={m.clave}
                accessibilityRole="tab"
                accessibilityLabel={`${m.nombre}, ${m.abribles} temas listos`}
                accessibilityState={{ selected: activa }}
                aria-selected={activa}
                onPress={() => router.push({ pathname: '/temas', params: { materia: m.clave } })}
                // La píldora del diseño mide ~33; el área tocable llega a 44 sin cambiarla.
                hitSlop={{ top: 6, bottom: 6 }}
                style={[estilos.materia, activa ? estilos.materiaActiva : estilos.materiaQuieta]}
              >
                <Text style={activa ? estilos.materiaTextoActivo : estilos.materiaTexto}>
                  {m.nombre}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={estilos.encabezado}>
          <Text style={estilos.migaja}>
            tema {tema.indice} de {tema.total} · {tema.familia}
          </Text>
          <Text style={estilos.titulo}>{tema.titulo}</Text>
        </View>

        <View style={estilos.zonaCirculo}>
          <CirculoTema estaciones={tema.estaciones} alTocar={entrar} />
        </View>
      </Cuerpo>

      <Pie>
        {actual ? (
          <BotonPrincipal onPress={() => entrar(actual)}>
            {tema.estaciones.some((e) => e.estado === 'hecha')
              ? 'seguir donde me quedé'
              : 'empezar el tema'}
          </BotonPrincipal>
        ) : (
          <BotonPrincipal onPress={repasarTema}>repasar este tema</BotonPrincipal>
        )}
      </Pie>
    </Marco>
  );
}

const estilos = StyleSheet.create({
  cuentas: {
    height: 56,
    paddingHorizontal: espacio.margenAncho,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cuenta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  cifra: {
    fontFamily: fuentes.cuerpoFuerte,
    fontSize: 15,
    color: colores.texto,
  },
  materias: {
    flexGrow: 0,
  },
  // Los 6 de arriba y de abajo son el área tocable de las píldoras (mide 33, la
  // regla pide 44); se descuentan del `paddingTop` del encabezado para que el
  // título no se mueva del diseño.
  materiasContenido: {
    paddingHorizontal: espacio.margenAncho,
    paddingVertical: 6,
    gap: 8,
  },
  materia: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: radios.pildora,
  },
  materiaActiva: {
    backgroundColor: colores.acento,
  },
  materiaQuieta: {
    backgroundColor: colores.superficie,
  },
  materiaTextoActivo: {
    fontFamily: fuentes.cuerpoFuerte,
    fontSize: 13,
    color: colores.sobreAcento,
  },
  materiaTexto: {
    fontFamily: fuentes.cuerpo,
    fontSize: 13,
    color: colores.textoTenue,
  },
  encabezado: {
    paddingHorizontal: espacio.margenAncho,
    paddingTop: 10,
  },
  migaja: {
    fontFamily: fuentes.cuerpo,
    fontSize: 12,
    color: colores.textoTenue,
  },
  // Va en la fila de arriba, que ya mide 56: ahí cabe un botón de 44 sin mover
  // nada del diseño.
  cambiar: {
    minHeight: TOCABLE,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cambiarTexto: {
    fontFamily: fuentes.cuerpoMedio,
    fontSize: 13,
    color: colores.acento,
  },
  titulo: {
    marginTop: 6,
    fontFamily: fuentes.display,
    fontSize: 28,
    lineHeight: 32,
    color: colores.texto,
  },
  zonaCirculo: {
    // flexGrow y no flex: dentro del Cuerpo, flex:1 deja el alto del círculo
    // fuera de la cuenta y la pantalla nunca llega a desplazarse hasta él.
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
