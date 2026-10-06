import { useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';

import { espacio } from '../tema';
import { usePieSeguro } from './Marco';

type PropsCuerpo = {
  children: ReactNode;
  /**
   * Cuando esto pasa a tener valor, la zona baja hasta el final en cuanto el
   * contenido crece. Es para el comentario que aparece al comprobar: con el
   * teclado o el botón ocupando la mitad de la pantalla, quedaba justo debajo de
   * lo visible y nada decía que se podía desplazar.
   */
  desplazarCuando?: unknown;
  /**
   * Para quien necesita llevar la zona a un lugar concreto y no al final: bajar
   * hasta el fondo esconde el comienzo de algo más alto que la pantalla.
   */
  controlador?: RefObject<ScrollView | null>;
};

/**
 * La zona que va entre la barra y el botón. El diseño está medido para 844 de
 * alto y ahí cabe justo, pero en un teléfono más corto el contenido se
 * amontonaba encima del botón. Con esto se desplaza cuando hace falta y, cuando
 * sobra sitio, se reparte igual que en el diseño.
 */
export function Cuerpo({ children, desplazarCuando, controlador }: PropsCuerpo) {
  const propio = useRef<ScrollView>(null);
  const scroll = controlador ?? propio;
  const pendiente = useRef(false);

  // Se anota antes de que se mida el contenido nuevo; el desplazamiento mismo
  // espera a que el alto cambie, porque antes de eso aún no hay a dónde bajar.
  useLayoutEffect(() => {
    pendiente.current = Boolean(desplazarCuando);
  }, [desplazarCuando]);

  return (
    <ScrollView
      ref={scroll}
      style={estilos.scroll}
      contentContainerStyle={estilos.contenido}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      onContentSizeChange={() => {
        if (!pendiente.current) return;
        pendiente.current = false;
        scroll.current?.scrollToEnd({ animated: true });
      }}
    >
      {children}
    </ScrollView>
  );
}

type PropsPie = {
  children: ReactNode;
  /** Separación por encima del botón, cuando el diseño la pide. */
  arriba?: number;
  /** La pantalla ya trae su propio margen lateral y no hay que repetirlo. */
  sinMargen?: boolean;
  style?: ViewStyle;
};

/**
 * El botón que avanza, anclado abajo. Nunca se desplaza: es lo único que el
 * estudiante no debería tener que buscar dos veces.
 */
export function Pie({ children, arriba = 0, sinMargen = false, style }: PropsPie) {
  const abajo = usePieSeguro();
  return (
    <View
      style={[!sinMargen && estilos.margen, { paddingTop: arriba, paddingBottom: abajo }, style]}
    >
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  contenido: {
    flexGrow: 1,
  },
  margen: {
    paddingHorizontal: espacio.margenAncho,
  },
});
