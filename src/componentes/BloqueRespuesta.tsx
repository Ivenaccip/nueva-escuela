import { StyleSheet, Text, View } from 'react-native';

import { colores, espacio, fuentes, radios } from '../tema';

type Props = {
  /** Acertó o no. Decide el color del borde: ámbar si sí, rojo si no. */
  bien: boolean;
  /** Lo primero que se lee: «Eso es», «Todavía no». */
  titulo: string;
  /** Lo que el contenido escribió para ese instante. Sin él, sólo queda el título. */
  texto: string | null;
};

/**
 * Lo que se contesta debajo de la tarjeta al comprobar. El texto es contenido
 * —`siTecleaElError`, `queRevela`, `siLoTocas`— y el borde es la única señal
 * que no depende de leerlo.
 */
export function BloqueRespuesta({ bien, titulo, texto }: Props) {
  return (
    <View style={estilos.zona}>
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={[estilos.bloque, bien ? estilos.bien : estilos.mal]}
      >
        <Text style={[estilos.titulo, { color: bien ? colores.acento : colores.error }]}>
          {titulo}
        </Text>
        {texto ? <Text style={estilos.texto}>{texto}</Text> : null}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  zona: {
    paddingHorizontal: espacio.margenAncho,
    paddingTop: 16,
  },
  bloque: {
    borderRadius: radios.tarjeta,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  bien: {
    backgroundColor: colores.superficie,
    borderColor: colores.acento,
  },
  mal: {
    backgroundColor: colores.errorFondo,
    borderColor: colores.error,
  },
  titulo: {
    fontFamily: fuentes.cuerpoFuerte,
    fontSize: 14,
  },
  texto: {
    marginTop: 6,
    fontFamily: fuentes.cuerpo,
    fontSize: 15,
    lineHeight: 23,
    color: colores.textoSuave,
  },
});
