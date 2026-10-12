import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { comoReloj } from '../contenido/adaptar';
import type { Pista } from '../contenido/autoria';
import { ANCHO_MARCO, colores, espacio, fuentes, TOCABLE } from '../tema';
import { BotonPrincipal } from './BotonPrincipal';
import { usePieSeguro } from './Marco';
import { Tarjeta } from './Tarjeta';

type Props = {
  visible: boolean;
  /** Sólo las que ya se destaparon, en su orden. */
  pistas: Pista[];
  /** Cuántas puede tener el ejercicio en total. */
  total: number;
  /** Hay una nueva que pedir ahora mismo. */
  puedePedir: boolean;
  /** Segundos para la siguiente, cuando todavía no se libera. */
  segundos: number;
  /** Al tema ya no le quedan pistas. */
  sinPistas: boolean;
  alPedir: () => void;
  alCerrar: () => void;
};

/**
 * Donde se leen las pistas. Es una hoja que sube sobre la estación y la deja a
 * la vista, porque la pista se lee mirando el ejercicio. Leer una ya pagada no
 * cuesta nada; sólo pedir otra cuesta.
 */
export function HojaPista({
  visible,
  pistas,
  total,
  puedePedir,
  segundos,
  sinPistas,
  alPedir,
  alCerrar,
}: Props) {
  const abajo = usePieSeguro();
  const quedanEnElEjercicio = pistas.length < total;

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={alCerrar}>
      <View style={estilos.fondo}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar las pistas"
          onPress={alCerrar}
          style={StyleSheet.absoluteFill}
        />

        <View style={[estilos.zona, { paddingBottom: abajo }]}>
          <Tarjeta style={estilos.hoja}>
            <Text style={estilos.titulo}>
              {pistas.length === 1 ? 'tu pista' : `tus ${pistas.length} pistas`}
            </Text>

            <ScrollView style={estilos.lista} showsVerticalScrollIndicator={false}>
              {pistas.map((pista, i) => (
                <View key={pista.orden} style={[estilos.pista, i > 0 && estilos.pistaSiguiente]}>
                  <Text style={estilos.etiqueta}>
                    pista {i + 1} de {total}
                  </Text>
                  <Text style={estilos.texto}>{pista.texto}</Text>
                </View>
              ))}
            </ScrollView>

            {quedanEnElEjercicio && puedePedir ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Pedir otra pista"
                onPress={alPedir}
                style={({ pressed }) => [estilos.pedir, pressed && estilos.pedirTocado]}
              >
                <Text style={estilos.pedirTexto}>pedir otra pista</Text>
              </Pressable>
            ) : quedanEnElEjercicio ? (
              <Text style={estilos.aviso}>
                {sinPistas
                  ? 'Se te acabaron las pistas de este tema.'
                  : `Otra pista en ${comoReloj(segundos)}.`}
              </Text>
            ) : (
              <Text style={estilos.aviso}>Ésas son todas las de este ejercicio.</Text>
            )}
          </Tarjeta>

          <View style={estilos.boton}>
            <BotonPrincipal onPress={alCerrar}>entendido</BotonPrincipal>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: colores.velo,
  },
  // En escritorio la hoja se queda del ancho del teléfono, no de la ventana.
  zona: {
    width: '100%',
    maxWidth: ANCHO_MARCO,
    paddingHorizontal: espacio.margenAncho,
  },
  hoja: {
    padding: 20,
  },
  titulo: {
    fontFamily: fuentes.cuerpo,
    fontSize: 13,
    color: colores.acento,
  },
  lista: {
    marginTop: 14,
    maxHeight: 300,
  },
  pista: {},
  pistaSiguiente: {
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  etiqueta: {
    fontFamily: fuentes.cuerpo,
    fontSize: 12,
    color: colores.textoTenue,
  },
  texto: {
    marginTop: 6,
    fontFamily: fuentes.cuerpo,
    fontSize: 16,
    lineHeight: 25,
    color: colores.texto,
  },
  pedir: {
    marginTop: 18,
    minHeight: TOCABLE,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colores.acento,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pedirTocado: {
    backgroundColor: colores.superficieAlta,
  },
  pedirTexto: {
    fontFamily: fuentes.cuerpoFuerte,
    fontSize: 14,
    color: colores.acento,
  },
  aviso: {
    marginTop: 18,
    fontFamily: fuentes.cuerpo,
    fontSize: 13,
    color: colores.textoTenue,
  },
  boton: {
    marginTop: 12,
  },
});
