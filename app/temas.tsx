import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Cuerpo, IconoPalomita, IconoVolver, Marco } from '../src/componentes';
import { temasDe } from '../src/contenido/biblioteca';
import { useAndamio } from '../src/estado/Andamio';
import { colores, espacio, fuentes, radios, TOCABLE } from '../src/tema';

/**
 * Los temas que ya se pueden abrir, por materia. Es una lista corta a propósito:
 * sólo entran los que tienen las seis estaciones escritas, y arriba de cada grupo
 * se dice cuántos faltan, para que nadie crea que el temario es lo que ve aquí.
 */
export default function Temas() {
  const {
    materias,
    materia: activa,
    numero: abierto,
    elegirTema,
    cerradoEn,
    hechasDe,
  } = useAndamio();
  const { materia: pedida } = useLocalSearchParams<{ materia?: string }>();

  // La materia que se tocó va primero; si no se tocó ninguna, la que se está estudiando.
  const primera = pedida ?? activa;
  const orden = [...materias].sort(
    (a, b) => Number(b.clave === primera) - Number(a.clave === primera),
  );

  const volver = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <Marco>
      <View style={estilos.barra}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver al círculo"
          onPress={volver}
          style={estilos.volver}
        >
          <IconoVolver />
        </Pressable>
      </View>

      <Cuerpo>
        <View style={estilos.encabezado}>
          <Text style={estilos.titulo}>Elige un tema</Text>
        </View>

        {orden.map((m) => (
          <View key={m.clave} style={estilos.grupo}>
            <View style={estilos.cabecera}>
              <Text style={estilos.materia}>{m.nombre}</Text>
              <Text style={estilos.conteo}>
                {m.abribles} de {m.total} listos
              </Text>
            </View>

            <View style={estilos.lista}>
              {temasDe(m.clave).map((t) => {
                const cerrado = cerradoEn(t.materia, t.numero);
                const hechas = hechasDe(t.materia, t.numero);
                const esElAbierto = t.materia === activa && t.numero === abierto;
                const estado = cerrado
                  ? 'círculo cerrado'
                  : hechas > 0
                    ? `${hechas} de 6 estaciones`
                    : 'sin empezar';
                return (
                  <Pressable
                    key={t.numero}
                    accessibilityRole="button"
                    accessibilityLabel={`${t.titulo}, tema ${t.numero} de ${m.total}, ${estado}`}
                    accessibilityState={{ selected: esElAbierto }}
                    onPress={() => {
                      elegirTema(t.materia, t.numero);
                      router.dismissTo('/');
                    }}
                    style={({ pressed }) => [
                      estilos.tema,
                      esElAbierto && estilos.temaAbierto,
                      pressed && estilos.temaTocado,
                    ]}
                  >
                    <View style={estilos.temaTextos}>
                      <Text style={estilos.temaTitulo}>{t.titulo}</Text>
                      <Text style={estilos.temaMigaja}>
                        tema {t.numero} · {t.familia}
                      </Text>
                    </View>
                    <View style={estilos.estado}>
                      {cerrado ? <IconoPalomita tamano={14} color={colores.acento} /> : null}
                      <Text style={[estilos.estadoTexto, cerrado && estilos.estadoCerrado]}>
                        {estado}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <View style={estilos.final} />
      </Cuerpo>
    </Marco>
  );
}

const estilos = StyleSheet.create({
  barra: {
    height: 60,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  volver: {
    width: TOCABLE,
    height: TOCABLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  encabezado: {
    paddingHorizontal: espacio.margen,
    paddingTop: 4,
  },
  titulo: {
    fontFamily: fuentes.display,
    fontSize: 28,
    lineHeight: 32,
    color: colores.texto,
  },
  grupo: {
    paddingTop: 28,
  },
  cabecera: {
    paddingHorizontal: espacio.margen,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  materia: {
    fontFamily: fuentes.cuerpoFuerte,
    fontSize: 15,
    color: colores.acento,
  },
  conteo: {
    fontFamily: fuentes.cuerpo,
    fontSize: 12,
    color: colores.textoTenue,
  },
  lista: {
    paddingHorizontal: espacio.margenAncho,
    paddingTop: 12,
    gap: 9,
  },
  tema: {
    minHeight: 64,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radios.opcion,
    borderWidth: 2,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  temaAbierto: {
    borderColor: colores.acento,
  },
  temaTocado: {
    backgroundColor: colores.superficieAlta,
  },
  temaTextos: {
    flex: 1,
  },
  temaTitulo: {
    fontFamily: fuentes.cuerpoMedio,
    fontSize: 15,
    lineHeight: 21,
    color: colores.texto,
  },
  temaMigaja: {
    marginTop: 2,
    fontFamily: fuentes.cuerpo,
    fontSize: 12,
    color: colores.textoTenue,
  },
  estado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  estadoTexto: {
    fontFamily: fuentes.cuerpo,
    fontSize: 12,
    color: colores.textoTenue,
  },
  estadoCerrado: {
    color: colores.acento,
  },
  final: {
    height: 32,
  },
});
