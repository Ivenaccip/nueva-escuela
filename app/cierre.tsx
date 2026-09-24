import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import {
  BotonPrincipal,
  Cuerpo,
  IconoBitacora,
  IconoMoneda,
  Marco,
  Pie,
  Tarjeta,
} from '../src/componentes';
import { tema } from '../src/contenido/demo';
import { colores, espacio, fuentes } from '../src/tema';

const LADO = 160;
const CENTRO = LADO / 2;
const RADIO = 62;
const NODO = 11;

/** Las seis estaciones sobre el anillo: la 1 arriba y las demás cada 60°. */
const ESTACIONES = Array.from({ length: 6 }, (_, i) => {
  const angulo = ((-90 + i * 60) * Math.PI) / 180;
  return {
    x: CENTRO + RADIO * Math.cos(angulo),
    y: CENTRO + RADIO * Math.sin(angulo),
  };
});

/**
 * El cierre del círculo. Es la única pantalla sin barra ni pistas: aquí ya no
 * hay nada que resolver, sólo lo que quedó — la frase de la bitácora, las
 * monedas y el aviso de que el tema volverá.
 */
export default function Cierre() {
  return (
    <Marco>
      <View style={estilos.pantalla}>
        <Cuerpo>
          {/* El margen lateral vive aquí dentro: el ScrollView va de borde a borde. */}
          <View style={estilos.columna}>
            <View style={estilos.respiro} />

            <View style={estilos.zonaEmblema}>
              <Svg
                width={LADO}
                height={LADO}
                viewBox={`0 0 ${LADO} ${LADO}`}
                accessibilityRole="image"
                accessibilityLabel="El círculo del tema, con sus seis estaciones completas"
              >
                <Circle
                  cx={CENTRO}
                  cy={CENTRO}
                  r={RADIO}
                  fill="none"
                  stroke={colores.acento}
                  strokeWidth={5}
                />
                {ESTACIONES.map((punto, i) => (
                  <Circle key={i} cx={punto.x} cy={punto.y} r={NODO} fill={colores.acento} />
                ))}
              </Svg>
            </View>

            <Text style={estilos.sello}>círculo cerrado · {tema.titulo.toLowerCase()}</Text>

            <View style={estilos.bitacora}>
              <View style={estilos.etiqueta}>
                <IconoBitacora tamano={15} />
                <Text style={estilos.etiquetaTexto}>se escribió en tu bitácora</Text>
              </View>
              <Text style={estilos.frase}>{tema.cierre.frase}</Text>
            </View>

            <View style={estilos.monedas}>
              <IconoMoneda tamano={20} />
              <Text style={estilos.cifra}>+{tema.cierre.monedas}</Text>
              <Text style={estilos.unidad}>monedas</Text>
            </View>

            <View style={estilos.empuje} />

            <Tarjeta style={estilos.guardian}>
              <Text style={estilos.guardianTitulo}>El Guardián de la Memoria</Text>
              <Text style={estilos.guardianTexto}>{tema.cierre.guardian}</Text>
            </Tarjeta>
          </View>
        </Cuerpo>

        {/* sinMargen y margen propio: esta pantalla usa 24, no el ancho de serie. */}
        <Pie arriba={20} sinMargen style={estilos.piePantalla}>
          {/* replace y no push: el círculo se cierra, no queremos poder volver a él. */}
          <BotonPrincipal onPress={() => router.replace('/')}>volver al mapa</BotonPrincipal>
        </Pie>
      </View>
    </Marco>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
  },
  columna: {
    // Crece para llenar el alto del ScrollView; sin esto el empuje no reparte.
    flexGrow: 1,
    paddingHorizontal: espacio.margen,
  },
  respiro: {
    height: 48,
  },
  zonaEmblema: {
    alignItems: 'center',
  },
  sello: {
    paddingTop: 22,
    textAlign: 'center',
    fontFamily: fuentes.cuerpo,
    fontSize: 13,
    color: colores.textoTenue,
  },
  bitacora: {
    paddingTop: 30,
  },
  etiqueta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  etiquetaTexto: {
    fontFamily: fuentes.cuerpo,
    fontSize: 13,
    color: colores.textoTenue,
  },
  frase: {
    fontFamily: fuentes.displayRegular,
    fontSize: 23,
    lineHeight: 33,
    color: colores.texto,
  },
  monedas: {
    paddingTop: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cifra: {
    fontFamily: fuentes.cuerpoFuerte,
    fontSize: 17,
    color: colores.acento,
  },
  unidad: {
    fontFamily: fuentes.cuerpo,
    fontSize: 15,
    color: colores.textoTenue,
  },
  empuje: {
    flex: 1,
  },
  guardian: {
    padding: 20,
  },
  guardianTitulo: {
    marginBottom: 8,
    fontFamily: fuentes.cuerpo,
    fontSize: 13,
    color: colores.acento,
  },
  guardianTexto: {
    fontFamily: fuentes.cuerpo,
    fontSize: 15,
    lineHeight: 24,
    color: colores.textoSuave,
  },
  piePantalla: {
    paddingHorizontal: espacio.margen,
  },
});
