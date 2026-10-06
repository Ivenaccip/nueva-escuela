/**
 * El disco. Lo único de `src/estado` que sabe dónde se guarda algo: en el
 * teléfono es AsyncStorage y en web es localStorage, y desde aquí no se nota.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { guardadoInicial, interpretar, type Guardado } from './modelo';

/** Si el formato cambia, se sube el número y lo viejo se ignora en vez de leerse mal. */
const LLAVE = 'andamio.v1';

export async function leer(): Promise<Guardado> {
  try {
    return interpretar(await AsyncStorage.getItem(LLAVE));
  } catch {
    // Sin disco (navegación privada, almacenamiento lleno) la app sigue sirviendo:
    // sólo no recuerda.
    return guardadoInicial();
  }
}

export async function escribir(guardado: Guardado): Promise<void> {
  try {
    await AsyncStorage.setItem(LLAVE, JSON.stringify(guardado));
  } catch {
    // Igual que arriba: perder un guardado no debe tumbar la pantalla que se usa.
  }
}
