This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

---

# Andamio

App de estudio. Un tema se recorre en seis estaciones dispuestas en círculo;
cuando las seis están hechas, el círculo se cierra y el tema se guarda para
que vuelva más adelante.

La interfaz está copiada de un canvas de diseño. **El diseño manda**: las
medidas son exactas, no aproximadas.

## Una sola base de código

Expo Router sobre React Native Web: la misma UI sale a web, iOS y Android.
En escritorio, `Marco` dibuja el teléfono de 390 centrado, tal como el
diseño. No hay una carpeta "web" y otra "móvil", y no debería haberla.

## Dónde va cada cosa

| Carpeta | Qué vive ahí |
|---|---|
| `app/` | Las rutas. Una pantalla por archivo, nada más. |
| `src/tema/` | Colores, fuentes, espacios, radios. **Única fuente de color.** |
| `src/componentes/` | Lo que se repite entre pantallas. |
| `src/contenido/` | Tipos del contenido y el ejemplo de relleno. |
| `_viejo/` | Proyecto anterior, archivado. No se toca ni se importa. |

## Reglas

- **Ningún hex fuera de `src/tema`.** Si falta un tono, se agrega ahí primero.
- **Nada de `fontWeight`** junto a las fuentes cargadas: el peso ya viene en
  el `fontFamily` (`fuentes.cuerpoFuerte`, no `fontWeight: '600'`). Con
  fuentes personalizadas, Android ignora el peso y rompe la tipografía.
- **El contenido no se escribe en las pantallas.** Sale de `src/contenido`.
  Cuando lleguen los ejercicios de verdad, se reemplaza `demo.ts` y ninguna
  pantalla cambia.
- **Las fracciones se escriben apiladas**, con `Fraccion` o `Expresion`,
  nunca como `"3/5"` en una línea.
- **Todo lo tocable lleva `accessibilityRole` y `accessibilityLabel`**, y mide
  44 como mínimo.
- El botón que avanza va siempre abajo, con `paddingBottom: usePieSeguro()`.
- Comentarios en español, y sólo cuando explican un porqué que no se ve en el
  código.

## Antes de dar algo por terminado

```bash
npx tsc --noEmit
```
