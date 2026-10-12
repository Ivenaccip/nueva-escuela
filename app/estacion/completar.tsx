import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import {
  BarraEstacion,
  BloqueRespuesta,
  BotonPista,
  BotonPrincipal,
  Cuerpo,
  EntradaDeRespuesta,
  Expresion,
  Marco,
  Pie,
  Tarjeta,
  usePuestas,
} from '../../src/componentes';
import { respuestaDeCompletar, type Respuesta } from '../../src/contenido/calificar';
import { Guardia, useAndamio } from '../../src/estado/Andamio';
import { SEGUNDOS_PARA_PISTA } from '../../src/estado/modelo';
import { colores, espacio, fuentes } from '../../src/tema';

/**
 * Estación 3 · completar el paso. El enunciado ya está resuelto casi entero y
 * falta un pedazo: el estudiante lo teclea abajo y lo ve aparecer en el hueco.
 */
export default function Completar() {
  return (
    <Guardia clave="completar">
      <Estacion />
    </Guardia>
  );
}

function Estacion() {
  const { tema, redactado, avance, marcarHecha, gastarPista } = useAndamio();
  const contenido = redactado.completar;

  const entrada = tema.completar.entrada;
  const puestas = usePuestas();
  const { escrito } = puestas;
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const acertada = respuesta?.bien === true;

  // Lo que se contestó era sobre lo que había escrito antes: al cambiarlo, deja de valer.
  const cambiar = (hacer: () => void) => {
    if (acertada) return;
    setRespuesta(null);
    hacer();
  };

  const comprobar = () => {
    if (escrito !== '') setRespuesta(respuestaDeCompletar(escrito, contenido));
  };

  const seguir = () => {
    marcarHecha('completar');
    router.replace('/estacion/escalera');
  };

  // Una vez contestada bien, el hueco se pinta con la respuesta escrita de verdad
  // (`CaCl₂`, no «CaCl2»), si el contenido la trae.
  const expresion =
    acertada && contenido.respuesta.enAtomos
      ? tema.completar.expresion.flatMap((parte) =>
          parte.tipo === 'hueco' ? contenido.respuesta.enAtomos! : [parte],
        )
      : tema.completar.expresion;

  return (
    <Marco>
      <BarraEstacion estacion={3} pistas={tema.completar.pistas} />

      <KeyboardAvoidingView
        style={estilos.cuerpo}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Cuerpo desplazarCuando={respuesta}>
          <View style={estilos.etiqueta}>
            <Text style={estilos.etiquetaTexto}>estación 3 · completar el paso</Text>
          </View>

          <View style={estilos.zonaTarjeta}>
            <Tarjeta style={estilos.tarjeta}>
              <Expresion partes={expresion} tamano={30} centrado valorHueco={escrito} />
            </Tarjeta>
          </View>

          {respuesta ? (
            <BloqueRespuesta
              bien={respuesta.bien}
              titulo={respuesta.bien ? 'Eso es' : 'Todavía no'}
              texto={
                respuesta.bien ? null : (respuesta.texto ?? 'Prueba otra vez, o pide una pista.')
              }
            />
          ) : null}

          <View style={estilos.zonaPista}>
            <BotonPista
              pistas={contenido.pistas}
              liberadas={avance.pistasLiberadas.completar ?? 0}
              restantes={avance.pistasRestantes}
              alGastar={() => gastarPista('completar')}
              espera={SEGUNDOS_PARA_PISTA}
            />
          </View>

          <View style={estilos.espaciador} />
        </Cuerpo>

        {/* El teclado se ancla junto al botón: sin él la pantalla no se puede usar. */}
        <Pie>
          <EntradaDeRespuesta
            entrada={entrada}
            escrito={escrito}
            resultado={respuesta}
            poner={(tecla) => cambiar(() => puestas.poner(tecla))}
            borrar={() => cambiar(puestas.borrar)}
            elegir={(etiqueta) => cambiar(() => puestas.elegir(etiqueta))}
            escribir={(texto) => cambiar(() => puestas.escribir(texto))}
            alEnviar={acertada ? seguir : comprobar}
          />

          <BotonPrincipal
            desactivado={!acertada && escrito === ''}
            onPress={acertada ? seguir : comprobar}
          >
            {acertada ? 'seguir' : 'comprobar'}
          </BotonPrincipal>
        </Pie>
      </KeyboardAvoidingView>
    </Marco>
  );
}

const estilos = StyleSheet.create({
  cuerpo: {
    flex: 1,
  },
  etiqueta: {
    paddingHorizontal: espacio.margen,
    paddingTop: 8,
  },
  etiquetaTexto: {
    fontFamily: fuentes.cuerpo,
    fontSize: 12,
    color: colores.textoTenue,
  },
  zonaTarjeta: {
    paddingHorizontal: espacio.margenAncho,
    paddingTop: 26,
  },
  tarjeta: {
    paddingVertical: 30,
    paddingHorizontal: espacio.margenAncho,
  },
  zonaPista: {
    paddingHorizontal: espacio.margenAncho,
    paddingTop: 16,
  },
  // Empuja el teclado al fondo sin fijarle una altura a lo de arriba.
  espaciador: {
    flex: 1,
  },
});
