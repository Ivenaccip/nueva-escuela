import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  BarraEstacion,
  BloqueRespuesta,
  BotonPista,
  BotonPrincipal,
  Cuerpo,
  Expresion,
  leerExpresion,
  Marco,
  Pie,
} from '../../src/componentes';
import { respuestaDeMotivo, respuestaDePaso } from '../../src/contenido/calificar';
import { Guardia, useAndamio } from '../../src/estado/Andamio';
import { SEGUNDOS_PARA_PISTA } from '../../src/estado/modelo';
import { colores, espacio, fuentes, radios } from '../../src/tema';

/** Lo que se contesta tras «es ese»: con su propio título, porque hay dos maneras de fallar. */
type Resultado = { bien: boolean; titulo: string; texto: string | null };

/**
 * Estación 5 · cazar el error. Se lee una resolución ajena, se señala el paso
 * que está mal y se dice por qué. Aquí no se corrige nada: sólo se acusa.
 */
export default function CazarElError() {
  return (
    <Guardia clave="error">
      <Estacion />
    </Guardia>
  );
}

function Estacion() {
  const { tema, redactado, avance, marcarHecha, gastarPista } = useAndamio();
  const { enunciado, pasos, porQue, motivos, pistas } = tema.error;
  const contenido = redactado.error;

  // Sin ningún paso señalado al llegar: el diseño lo muestra con el malo ya
  // marcado, pero con calificación eso sería entregar la respuesta.
  const [senalado, setSenalado] = useState<number | null>(null);
  const [motivoElegido, setMotivoElegido] = useState<number | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const acertado = resultado?.bien === true;

  const senalar = (numero: number) => {
    if (acertado) return;
    setSenalado(numero);
    // El porqué se pregunta sobre un paso en concreto: cambiar de paso lo reinicia.
    setMotivoElegido(null);
    setResultado(null);
  };

  const elegirMotivo = (i: number) => {
    if (acertado) return;
    setMotivoElegido(i);
    setResultado(null);
  };

  const comprobar = () => {
    if (senalado === null || motivoElegido === null) return;
    const paso = respuestaDePaso(senalado, contenido);
    if (!paso.bien) {
      return setResultado({ bien: false, titulo: 'Ese no es el paso', texto: paso.texto });
    }
    const motivo = respuestaDeMotivo(motivoElegido, contenido);
    setResultado({
      bien: motivo.bien,
      titulo: motivo.bien ? 'Eso es: lo cazaste' : 'El paso sí, el porqué no',
      texto: motivo.texto,
    });
  };

  const seguir = () => {
    marcarHecha('error');
    router.replace('/estacion/explicar');
  };

  return (
    <Marco>
      <BarraEstacion estacion={5} pistas={pistas} />

      <Cuerpo desplazarCuando={resultado}>
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
                accessibilityState={{ selected: esteSenalado, disabled: acertado }}
                aria-selected={esteSenalado}
                disabled={acertado}
                onPress={() => senalar(paso.numero)}
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
          {/* El porqué se pregunta cuando ya hay un paso señalado: antes no hay de qué. */}
          {senalado === null ? (
            <Text style={estilos.indicacion}>Toca el paso que crees que está mal.</Text>
          ) : (
            <>
              <Text style={estilos.pregunta}>{porQue}</Text>
              <View style={estilos.motivos} accessibilityRole="radiogroup">
                {motivos.map((motivo, i) => {
                  const elegido = i === motivoElegido;
                  return (
                    <Pressable
                      key={i}
                      accessibilityRole="radio"
                      accessibilityLabel={motivo}
                      accessibilityState={{ checked: elegido, disabled: acertado }}
                      aria-checked={elegido}
                      disabled={acertado}
                      onPress={() => elegirMotivo(i)}
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
            </>
          )}
        </View>

        {resultado ? (
          <BloqueRespuesta
            bien={resultado.bien}
            titulo={resultado.titulo}
            texto={resultado.texto}
          />
        ) : null}

        <View style={estilos.zonaPista}>
          <BotonPista
            pistas={contenido.pistas}
            liberadas={avance.pistasLiberadas.error ?? 0}
            restantes={avance.pistasRestantes}
            alGastar={() => gastarPista('error')}
            espera={SEGUNDOS_PARA_PISTA}
          />
        </View>

        <View style={estilos.espaciador} />
      </Cuerpo>

      <Pie>
        <BotonPrincipal
          desactivado={!acertado && (senalado === null || motivoElegido === null)}
          onPress={acertado ? seguir : comprobar}
        >
          {acertado ? 'seguir' : 'es ese'}
        </BotonPrincipal>
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
  indicacion: {
    fontFamily: fuentes.cuerpo,
    fontSize: 15,
    color: colores.textoTenue,
  },
  zonaPista: {
    paddingHorizontal: espacio.margenAncho,
    paddingTop: 16,
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
