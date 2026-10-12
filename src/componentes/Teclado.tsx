import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { EntradaDePantalla } from '../contenido/tipos';
import { colores, fuentes, radios } from '../tema';
import { IconoBorrar } from './Iconos';

/** Lo más largo que puede quedar escrito: es el tope de `correcta` en el esquema. */
const MAXIMO_ESCRITO = 24;

/** Las teclas de siempre, en el orden en que se leen por filas de tres. */
const TECLAS_DE_DIGITOS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '/', '0'].map((e) => ({
  etiqueta: e,
  comoSeLee: e === '/' ? 'diagonal' : e,
}));

/**
 * Lo que el estudiante lleva escrito, ficha por ficha. Guardar las fichas y no la
 * cadena es lo que hace que borrar quite una ficha entera: con «Ca» tocada, un
 * borrado deja vacío, no «C».
 */
export function usePuestas() {
  const [puestas, setPuestas] = useState<string[]>([]);
  return {
    escrito: puestas.join(''),
    poner: (etiqueta: string) =>
      setPuestas((antes) =>
        antes.join('').length + etiqueta.length > MAXIMO_ESCRITO ? antes : [...antes, etiqueta],
      ),
    borrar: () => setPuestas((antes) => antes.slice(0, -1)),
    /** Para el teclado `opciones`: elegir una reemplaza a la anterior. */
    elegir: (etiqueta: string) => setPuestas([etiqueta]),
    /** Para el teclado `texto`: lo que escribió el sistema, de una vez. */
    escribir: (texto: string) => setPuestas(texto === '' ? [] : [texto]),
  };
}

type PropsTeclas = {
  /** `digitos` o `fichas`: los dos se dibujan igual, con otras teclas. */
  entrada: Extract<EntradaDePantalla, { modo: 'digitos' | 'fichas' }>;
  alTocar: (etiqueta: string) => void;
  alBorrar: () => void;
  deshabilitado?: boolean;
};

/** Una celda vacía para que la tecla de borrar caiga siempre en la esquina de abajo. */
const HUECO = Symbol('hueco');
const BORRAR = Symbol('borrar');
type Celda = { etiqueta: string; comoSeLee: string } | typeof HUECO | typeof BORRAR;

/**
 * Tres columnas hasta doce teclas —el diseño, tal cual— y cuatro hasta dieciséis.
 * El borrar va siempre al final, abajo a la derecha, y lo que sobra queda vacío.
 */
function filasDe(teclas: { etiqueta: string; comoSeLee: string }[]): Celda[][] {
  const columnas = teclas.length + 1 <= 12 ? 3 : 4;
  const celdas: Celda[] = [...teclas];
  while ((celdas.length + 1) % columnas !== 0) celdas.push(HUECO);
  celdas.push(BORRAR);
  const filas: Celda[][] = [];
  for (let i = 0; i < celdas.length; i += columnas) filas.push(celdas.slice(i, i + columnas));
  return filas;
}

/**
 * El teclado de la estación 3 y, cuando el tema lo pide, el de la 4. Con
 * `digitos` son las doce teclas del diseño; con `fichas` las define el tema.
 */
export function Teclado({ entrada, alTocar, alBorrar, deshabilitado = false }: PropsTeclas) {
  const teclas = entrada.modo === 'fichas' ? entrada.fichas : TECLAS_DE_DIGITOS;
  const filas = filasDe(teclas);

  return (
    <View style={estilos.teclado}>
      {filas.map((fila, i) => (
        <View key={i} style={estilos.filaTeclas}>
          {fila.map((celda, j) => {
            if (celda === HUECO) return <View key={`h${j}`} style={estilos.espacio} />;
            const esBorrar = celda === BORRAR;
            return (
              <Pressable
                key={esBorrar ? 'borrar' : `${celda.etiqueta}-${j}`}
                accessibilityRole="button"
                accessibilityLabel={esBorrar ? 'Borrar' : celda.comoSeLee}
                accessibilityState={{ disabled: deshabilitado }}
                onPress={() => (esBorrar ? alBorrar() : alTocar(celda.etiqueta))}
                style={({ pressed }) => [estilos.tecla, pressed && estilos.teclaPresionada]}
              >
                {esBorrar ? (
                  <IconoBorrar tamano={22} />
                ) : (
                  <Text style={estilos.teclaTexto}>{celda.etiqueta}</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

type PropsOpciones = {
  opciones: string[];
  elegida: string;
  /** Ya comprobada: se quedan quietas y la elegida se pinta según salió. */
  resultado: { bien: boolean } | null;
  alElegir: (etiqueta: string) => void;
};

/** El teclado `opciones`: dos a cuatro etiquetas, una por respuesta posible. */
export function OpcionesDeRespuesta({ opciones, elegida, resultado, alElegir }: PropsOpciones) {
  return (
    <View style={estilos.opciones} accessibilityRole="radiogroup">
      {opciones.map((etiqueta) => {
        const marcada = etiqueta === elegida;
        const fallada = resultado !== null && marcada && !resultado.bien;
        const acertada = resultado !== null && marcada && resultado.bien;
        return (
          <Pressable
            key={etiqueta}
            accessibilityRole="radio"
            accessibilityState={{ checked: marcada, disabled: resultado?.bien === true }}
            aria-checked={marcada}
            accessibilityLabel={etiqueta}
            disabled={resultado?.bien === true}
            onPress={() => alElegir(etiqueta)}
            style={[
              estilos.opcion,
              marcada ? estilos.opcionMarcada : estilos.opcionQuieta,
              acertada && estilos.opcionMarcada,
              fallada && estilos.opcionFallada,
            ]}
          >
            <Text style={[estilos.opcionTexto, marcada && estilos.opcionTextoMarcado]}>
              {etiqueta}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type PropsTexto = {
  valor: string;
  alCambiar: (texto: string) => void;
  alEnviar: () => void;
  deshabilitado?: boolean;
  fallado?: boolean;
};

/** El teclado `texto`: el del sistema, para una palabra que no se puede cerrar en una lista. */
export function CampoDeTexto({ valor, alCambiar, alEnviar, deshabilitado, fallado }: PropsTexto) {
  return (
    <TextInput
      value={valor}
      onChangeText={alCambiar}
      editable={!deshabilitado}
      accessibilityLabel="tu respuesta"
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="done"
      maxLength={MAXIMO_ESCRITO}
      onSubmitEditing={alEnviar}
      selectionColor={colores.acento}
      style={[estilos.campoTexto, fallado && estilos.campoTextoFallado]}
    />
  );
}

type PropsEntrada = {
  entrada: EntradaDePantalla;
  escrito: string;
  resultado: { bien: boolean } | null;
  poner: (etiqueta: string) => void;
  borrar: () => void;
  elegir: (etiqueta: string) => void;
  escribir: (texto: string) => void;
  alEnviar: () => void;
};

/**
 * Lo que va donde iba el teclado, según el que el tema eligió. Las estaciones lo
 * usan tal cual: cambiar de teclado es cambiar `entrada`, no la pantalla.
 */
export function EntradaDeRespuesta({
  entrada,
  escrito,
  resultado,
  poner,
  borrar,
  elegir,
  escribir,
  alEnviar,
}: PropsEntrada) {
  const acertada = resultado?.bien === true;
  switch (entrada.modo) {
    case 'opciones':
      return (
        <OpcionesDeRespuesta
          opciones={entrada.opciones}
          elegida={escrito}
          resultado={resultado}
          alElegir={elegir}
        />
      );
    case 'texto':
      return (
        <View style={estilos.teclado}>
          <CampoDeTexto
            valor={escrito}
            alCambiar={escribir}
            alEnviar={alEnviar}
            deshabilitado={acertada}
            fallado={resultado !== null && !resultado.bien}
          />
        </View>
      );
    default:
      return (
        <Teclado entrada={entrada} alTocar={poner} alBorrar={borrar} deshabilitado={acertada} />
      );
  }
}

const estilos = StyleSheet.create({
  // El margen lateral ya lo pone el Pie; aquí sólo queda el hueco hasta el botón.
  teclado: {
    paddingBottom: 16,
    gap: 10,
  },
  filaTeclas: {
    flexDirection: 'row',
    gap: 10,
  },
  tecla: {
    flex: 1,
    height: 56,
    borderRadius: radios.tecla,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teclaPresionada: {
    backgroundColor: colores.superficieAlta,
  },
  teclaTexto: {
    fontFamily: fuentes.cuerpo,
    fontSize: 22,
    color: colores.texto,
  },
  espacio: {
    flex: 1,
    height: 56,
  },
  opciones: {
    paddingBottom: 16,
    gap: 10,
  },
  opcion: {
    minHeight: 56,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: radios.opcion,
    borderWidth: 2,
    justifyContent: 'center',
  },
  opcionQuieta: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
  },
  opcionMarcada: {
    backgroundColor: colores.superficieAlta,
    borderColor: colores.acento,
  },
  opcionFallada: {
    backgroundColor: colores.errorFondo,
    borderColor: colores.error,
  },
  opcionTexto: {
    fontFamily: fuentes.cuerpo,
    fontSize: 18,
    color: colores.textoSuave,
  },
  opcionTextoMarcado: {
    color: colores.texto,
  },
  campoTexto: {
    height: 60,
    borderRadius: radios.campo,
    backgroundColor: colores.superficie,
    borderWidth: 2,
    borderColor: colores.acento,
    paddingHorizontal: 18,
    fontFamily: fuentes.cuerpo,
    fontSize: 24,
    color: colores.texto,
  },
  campoTextoFallado: {
    borderColor: colores.error,
  },
});
