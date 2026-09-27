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
import { perfil, tema } from '../src/contenido/actual';
import type { Estacion } from '../src/contenido/tipos';
import { colores, espacio, fuentes, radios } from '../src/tema';

/**
 * El círculo del tema. Es la pantalla a la que se vuelve siempre: dice en qué
 * estación va y deja entrar a cualquiera de las seis.
 */
export default function Circulo() {
  const actual = tema.estaciones.find((e) => e.estado === 'actual') ?? tema.estaciones[0];

  const entrar = (estacion: Estacion) => {
    router.push(`/estacion/${estacion.clave}`);
  };

  return (
    <Marco>
      <Cuerpo>
        <View style={estilos.cuentas}>
          <View style={estilos.cuenta}>
            <IconoLlama />
            <Text style={estilos.cifra}>{perfil.racha}</Text>
          </View>
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
          {perfil.materias.map((materia) => {
            const activa = materia === perfil.materiaActiva;
            return (
              <Pressable
                key={materia}
                accessibilityRole="tab"
                accessibilityState={{ selected: activa }}
                aria-selected={activa}
                style={[estilos.materia, activa ? estilos.materiaActiva : estilos.materiaQuieta]}
              >
                <Text style={activa ? estilos.materiaTextoActivo : estilos.materiaTexto}>
                  {materia}
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
        <BotonPrincipal onPress={() => entrar(actual)}>seguir donde me quedé</BotonPrincipal>
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
  materiasContenido: {
    paddingHorizontal: espacio.margenAncho,
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
    paddingTop: 22,
  },
  migaja: {
    fontFamily: fuentes.cuerpo,
    fontSize: 12,
    color: colores.textoTenue,
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
