import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { comoReloj } from '../contenido/adaptar';
import type { Pista } from '../contenido/autoria';
import { colores, fuentes } from '../tema';
import { HojaPista } from './HojaPista';
import { IconoPista } from './Iconos';

/** El único radio del diseño que el tema no lleva; el resto sí sale de `radios`. */
const RADIO_PISTA = 13;

type Props = {
  /** Todas las pistas del ejercicio, destapadas o no. */
  pistas: Pista[];
  /** Cuántas lleva destapadas. */
  liberadas: number;
  /** Las que le quedan al tema entero. */
  restantes: number;
  /** Se pidió una nueva: aquí se descuenta. */
  alGastar: () => void;
  /** Segundos que hay que esperar entre una pista y la siguiente. */
  espera: number;
};

/**
 * El botón de pista de las estaciones 3, 4 y 5. Una pista se libera cada cierto
 * rato y cuesta una de las del tema; las ya destapadas se releen gratis.
 *
 * La espera corre contra el reloj y no restando de a uno, para que un teléfono
 * que se durmió medio minuto no siga contando 18. Arranca al montarse: cada
 * estación, y cada escalón de la escalera, monta su propio botón.
 */
export function BotonPista({ pistas, liberadas, restantes, alGastar, espera }: Props) {
  const [abierta, setAbierta] = useState(false);
  const [fin, setFin] = useState(() => Date.now() + espera * 1000);
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setAhora(Date.now());
      if (Date.now() >= fin) clearInterval(id);
    }, 500);
    return () => clearInterval(id);
  }, [fin]);

  const segundos = Math.max(0, Math.ceil((fin - ahora) / 1000));

  const quedanEnElEjercicio = liberadas < pistas.length;
  const alTema = restantes > 0;
  const puedePedir = quedanEnElEjercicio && alTema && segundos === 0;

  // Gastar una pista reinicia la espera de la siguiente.
  const gastar = () => {
    alGastar();
    setFin(Date.now() + espera * 1000);
    setAhora(Date.now());
  };

  const pedir = () => {
    gastar();
    setAbierta(true);
  };

  let texto: string;
  let alPulsar: (() => void) | undefined;
  if (liberadas > 0) {
    texto = liberadas === 1 ? 'ver la pista' : `ver las ${liberadas} pistas`;
    alPulsar = () => setAbierta(true);
  } else if (puedePedir) {
    texto = 'pedir una pista';
    alPulsar = pedir;
  } else if (quedanEnElEjercicio && alTema) {
    texto = `una pista en ${comoReloj(segundos)}`;
  } else {
    texto = 'sin pistas';
  }

  const disponible = alPulsar !== undefined;
  const resaltada = puedePedir && liberadas === 0;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={disponible ? texto : `Pista no disponible: ${texto}`}
        accessibilityState={{ disabled: !disponible }}
        disabled={!disponible}
        onPress={alPulsar}
        style={({ pressed }) => [
          estilos.boton,
          resaltada && estilos.botonResaltado,
          pressed && estilos.botonTocado,
        ]}
      >
        <IconoPista tamano={16} />
        <Text style={[estilos.texto, resaltada && estilos.textoResaltado]}>{texto}</Text>
      </Pressable>

      <HojaPista
        visible={abierta}
        pistas={pistas.slice(0, liberadas)}
        total={pistas.length}
        puedePedir={puedePedir}
        segundos={segundos}
        sinPistas={!alTema}
        alPedir={gastar}
        alCerrar={() => setAbierta(false)}
      />
    </>
  );
}

const estilos = StyleSheet.create({
  boton: {
    height: 46,
    borderRadius: RADIO_PISTA,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colores.borde,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  botonResaltado: {
    borderColor: colores.acento,
  },
  botonTocado: {
    backgroundColor: colores.superficie,
  },
  texto: {
    fontFamily: fuentes.cuerpo,
    fontSize: 14,
    color: colores.textoTenue,
  },
  textoResaltado: {
    color: colores.acento,
  },
});
