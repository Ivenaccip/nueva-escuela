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
 * Estación 5 · cazar el error. Se lee una resolución ajena, se señala el paso
 * que está mal y se dice por qué. Aquí no se corrige nada: sólo se acusa.
 */
export default function CazarElError() {
  const { enunciado, pasos, pasoMalo, porQue, motivos, pistas } = tema.error;

  // Arranca con el paso malo ya señalado, como en el diseño; el estudiante
  // puede mover la acusación a otro paso mientras no avance.
  const [senalado, setSenalado] = useState(pasoMalo);
  const [motivoElegido, setMotivoElegido] = useState<number | null>(null);

  return (
    <Marco>
      <BarraEstacion estacion={5} pistas={pistas} />

      <Cuerpo>
        <View style={estilos.encabezado}>
          <Text style={estilos.etiqueta}>estación 5 · cazar el error</Text>
          <View style={estilos.enunciado}>
            <Expresion partes={enunciado} tamano={22} fuente={fuentes.display} />
          </View>
        </View>

        <View style={estilos.pasos}>
          {pasos.map((paso) => {
            const esteSenalado = paso.numero === senalado;
            return (
              <Pressable
                key={paso.numero}
                accessibilityRole="button"
                accessibilityLabel={`Paso ${paso.numero}: ${leerExpresion(paso.partes)}`}
                accessibilityState={{ selected: esteSenalado }}
                onPress={() => setSenalado(paso.numero)}
                style={({ pressed }) => [
                  estilos.paso,
                  esteSenalado ? estilos.pasoSenalado : estilos.pasoQuieto,
                  pressed && !esteSenalado && estilos.pasoTocado,
                ]}
              >
                <View style={[estilos.insignia, esteSenalado && estilos.insigniaSenalada]}>
                  <Text style={[estilos.numero, esteSenalado && estilos.numeroSenalado]}>
                    {paso.numero}
                  </Text>
                </View>
                {/* Sin esto, un paso largo se saldría del borde en vez de partirse. */}
                <View style={estilos.contenidoPaso}>
                  <Expresion
                    partes={paso.partes}
                    tamano={17}
                    color={esteSenalado ? colores.texto : colores.textoSuave}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={estilos.porQue}>
          <Text style={estilos.pregunta}>{porQue}</Text>
          <View style={estilos.motivos} accessibilityRole="radiogroup">
            {motivos.map((motivo, i) => {
              const elegido = i === motivoElegido;
              return (
                <Pressable
                  key={motivo}
                  accessibilityRole="radio"
                  accessibilityLabel={motivo}
                  accessibilityState={{ checked: elegido }}
                  onPress={() => setMotivoElegido(i)}
                  style={({ pressed }) => [
                    estilos.motivo,
                    elegido && estilos.motivoElegido,
                    pressed && !elegido && estilos.motivoTocado,
                  ]}
                >
                  <Text style={[estilos.motivoTexto, elegido && estilos.motivoTextoElegido]}>
                    {motivo}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={estilos.espaciador} />
      </Cuerpo>

      <Pie>
        <BotonPrincipal onPress={() => router.push('/estacion/explicar')}>es ese</BotonPrincipal>
      </Pie>
    </Marco>
  );
}

const estilos = StyleSheet.create({
  contenidoPaso: {
    flex: 1,
  },
  encabezado: {
    paddingHorizontal: espacio.margen,
    paddingTop: 8,
  },
  etiqueta: {
    fontFamily: fuentes.cuerpo,
    fontSize: 12,
    color: colores.textoTenue,
  },
  enunciado: {
    marginTop: 10,
  },
  pasos: {
    paddingHorizontal: espacio.margenAncho,
    paddingTop: 22,
    gap: 9,
  },
  paso: {
    minHeight: 58,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radios.tecla,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  pasoQuieto: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
  },
  pasoTocado: {
    backgroundColor: colores.superficieAlta,
  },
  pasoSenalado: {
    backgroundColor: colores.errorFondo,
    borderColor: colores.error,
  },
  insignia: {
    width: 24,
    height: 24,
    borderRadius: radios.pildora,
    backgroundColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insigniaSenalada: {
    backgroundColor: colores.error,
  },
  numero: {
    fontFamily: fuentes.cuerpoFuerte,
    fontSize: 12,
    color: colores.textoSuave,
  },
  numeroSenalado: {
    color: colores.sobreAcento,
  },
  porQue: {
    paddingHorizontal: espacio.margenAncho,
    paddingTop: 24,
  },
  pregunta: {
    fontFamily: fuentes.cuerpo,
    fontSize: 15,
    color: colores.texto,
    marginBottom: 12,
  },
  motivos: {
    gap: 9,
  },
  motivo: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radios.tecla,
    backgroundColor: colores.superficie,
    borderWidth: 2,
    borderColor: colores.borde,
    justifyContent: 'center',
  },
  motivoTocado: {
    backgroundColor: colores.superficieAlta,
  },
  motivoElegido: {
    borderColor: colores.acento,
  },
  motivoTexto: {
    fontFamily: fuentes.cuerpo,
    fontSize: 15,
    color: colores.textoSuave,
    textAlign: 'left',
  },
  motivoTextoElegido: {
    color: colores.texto,
  },
  espaciador: {
    flex: 1,
  },
});
