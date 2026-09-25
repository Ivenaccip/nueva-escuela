import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  BarraEstacion,
  BotonPrincipal,
  Cuerpo,
  Expresion,
  leerExpresion,
  Marco,
  Pie,
} from '../../src/componentes';
import { tema } from '../../src/contenido/demo';
import { colores, espacio, fuentes, radios } from '../../src/tema';

/**
 * Estación 2 · primer contacto. Es el primer intento del tema y va sin
 * penalización: aquí sólo se marca una opción, nadie califica todavía.
 */
export default function Contacto() {
  const { enunciado, opciones, indice, total } = tema.contacto;

  // El diseño arranca con la primera opción ya marcada; sin nada elegido la
  // pantalla se ve muerta y el estudiante no sabe que las tarjetas se tocan.
  const [elegida, setElegida] = useState(opciones[0]?.letra);

  return (
    <Marco>
      <BarraEstacion estacion={2} />

      <Cuerpo>
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
            return (
              <Pressable
                key={opcion.letra}
                accessibilityRole="radio"
                accessibilityState={{ checked: marcada }}
                aria-checked={marcada}
                accessibilityLabel={`Opción ${opcion.letra}: ${leerExpresion(opcion.partes)}`}
                onPress={() => setElegida(opcion.letra)}
                style={[estilos.opcion, marcada ? estilos.opcionMarcada : estilos.opcionQuieta]}
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

        <View style={estilos.espaciador} />
      </Cuerpo>

      <Pie>
        <BotonPrincipal onPress={() => router.push('/estacion/completar')}>
          comprobar
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
