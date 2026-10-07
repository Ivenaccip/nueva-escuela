# Cómo se genera el contenido de un tema

Ésta es la página que se lee primero. Dice en qué orden se llama a la API, qué
entra en cada llamada, qué recibe de las anteriores, cuánto cuesta más o menos, y
qué hacer cuando un prompt devuelve la salida de emergencia.

Lo que **manda** es `CONTRATO.md`. Éste dice cómo se hace; ése dice qué es ley.

Para tener una idea de si un tema se puede generar hoy, antes de gastar un peso:

```bash
node contenido/esquema/revisar.mjs                  # los once esquemas y sus ejemplos
node contenido/generar.mjs quimica 11 --seco         # las siete llamadas, sin API
```

---

## Siete llamadas por tema, no ocho

Un tema son **siete** llamadas: el canon y las seis estaciones. El cierre —la
séptima pantalla— no necesita IA, y eso está explicado al final.

Un tema ruteado a X3 (la respuesta es una palabra, una expresión o una frase) son
**seis**: el canon, las estaciones 1, 2, 5 y 6, y una sola llamada, la de
`X3-respuesta-no-numerica`, en lugar de las estaciones 3 y 4. Más abajo, en «Qué
prompt le toca a qué tema».

La primera no se puede paralelizar. Las otras seis sí.

```
                        ┌─ 1 ver ──────────┐
                        ├─ 2 contacto ─────┤
  temario ──► 0 canon ──┼─ 3 completar ────┼──► contenido/temas/<materia>-<n>.json
              (una vez) ├─ 4 escalera ─────┤
                        ├─ 5 cazar error ──┤
                        └─ 6 explicar ─────┘
                           (en paralelo, y no se hablan)
```

**Por qué el canon va primero y solo.** Las estaciones 3, 4 y 5 hablan del mismo
procedimiento: la 3 enseña un paso, la 4 lo usa al revés, la 5 lo corrompe. Sin un
canon previo, cada llamada inventa sus propios cinco pasos y la estación 5 acaba
acusando un paso que la 3 nunca enseñó. El estudiante ve dos procedimientos
distintos para el mismo tema y concluye que no entendió nada.

Las seis estaciones corren al mismo tiempo y **no reciben nada unas de otras**. Lo
único que comparten es el canon. Por eso el canon es ley: sus cinco pasos, su
numeración, los números de su ejemplo, las palabras de su vocabulario y sus cotas.

---

## Qué entra en cada llamada

El `system` es **siempre** `prompts/00-sistema.md`, tal cual, sin un placeholder.
El mismo texto en las 1 155 llamadas. El prompt de la estación, con los
placeholders ya sustituidos, va como el único mensaje del usuario.

| # | Prompt | Herramienta | Entra | `tool_choice` |
|---|---|---|---|---|
| 0 | `00-canon.md` | `escribir_canon` | el tema del temario + `canon-ejemplo.json` | forzado |
| 1 | `01-ver.md` | `escribir_estacion_ver` | tema + canon + **videos ya buscados** | forzado |
| 2 | `02-contacto.md` | `escribir_estacion_contacto` | tema + canon | forzado |
| 3 | `03-completar.md` | `escribir_estacion_completar` | tema + canon | forzado |
| 4 | `04-escalera.md` | `escribir_estacion_escalera` | tema + canon | forzado |
| 5 | `05-error.md` | `escribir_estacion_error` | tema + canon | forzado |
| 6 | `06-explicar.md` | `escribir_estacion_explicar` | tema + canon | forzado |
| 3 y 4 de un tema ruteado a X3 | `X3-respuesta-no-numerica.md` | `escribir_caso_teclado` | tema + canon | forzado |

### Lo que se interpola

Del temario, en las siete: `{{materia}}`, `{{materiaNombre}}`, `{{tema.numero}}`,
`{{tema.titulo}}`, `{{tema.familia}}`, `{{tema.grado}}`, `{{tema.quedaSabiendo}}`,
`{{tema.dependeDe}}`, `{{tema.errorTipico}}`, `{{tema.losCincoPasos}}`,
`{{tema.notacion}}`.

Del canon, en las seis estaciones: `{{canon}}` completo **siempre**, más los
atajos `{{canon.procedimiento.nombre}}`, `{{canon.ejemplo.deQueVa}}`,
`{{canon.error.pasoQueCorrompe}}`, `{{canon.error.creenciaDeAtras}}` y
`{{canon.cotas.numeros}}`. Los atajos son para llamar la atención sobre un campo,
nunca para recortar la entrada.

Sólo en `00-canon.md`: `{{ejemploCanon}}`, que es
`esquema/canon-ejemplo.json` serializado.

Sólo en `X4-no-encaja.md`: los cinco `{{absorbido.*}}`, que salen de una entrada
de `noEncajan[]` y de lo que la estación anfitriona ya devolvió.

Es sustitución de cadena y nada más: sin condicionales, sin bucles, sin filtros,
sin valores por omisión. **Un placeholder que no se resuelve aborta la llamada**,
no se manda la cadena vacía ni el literal.

### El video lo busca OpenAI, no Claude

La estación 1 ya no sale a la web. Antes de su llamada, `contenido/buscar-videos.mjs`
busca con la API de OpenAI (`gpt-4.1-mini`, el más barato de los que sirven la
herramienta `web_search`), y le pasa a Claude una lista de candidatos **ya
comprobados**.

**El modelo que busca importa más que el que escribe.** Medido sobre el mismo tema:
`gpt-4.1-mini` hace una búsqueda y devuelve cero videos; `gpt-4.1`, dos; `gpt-5.5`,
diecinueve. Los videos de YouTube están mal representados en un índice de web, así
que encontrarlos pide insistir con `site:youtube.com/watch` y con nombres de canales,
y un modelo chico no insiste. Va `gpt-5.5` con tope de seis búsquedas, porque sin
tope hizo treinta y nueve en un solo tema y eso sale más caro que generar el tema.

Lo que hace que esto no mienta: **los ids salen de `web_search_call.action.sources`,
no del texto del modelo.** Un id inventado tiene once caracteres válidos y casi
siempre existe —lleva a un video cualquiera— así que mirar la forma no prueba nada.
Luego cada id pasa por el oEmbed de YouTube, que confirma que el video existe, es
público y se deja incrustar, y de paso da el título y el canal de verdad.

Claude sólo **escoge** entre esa lista, y el llamador comprueba que lo que escogió
estuviera en ella. Si no, el video se tira y el tema se guarda sin él.

Necesitas `OPENAI_API_KEY` además de `ANDAMIO_ANTHROPIC_API_KEY` (también vale
`ANTHROPIC_API_KEY`, pero en una sesión en la nube usa la primera: la segunda es la
variable con la que Claude Code se autentica a sí mismo). Las dos van en `.env`,
que `.gitignore` ignora; `generar.mjs` y `tanda.mjs` lo cargan solos.

---

## Qué prompt le toca a qué tema

El canon devuelve `notacion` y `formaDeRespuesta`, y con esos dos el llamador
rutea. Las estaciones **1 y 6 no se rutean nunca**: el video se ve igual y la
explicación se escribe igual sea cual sea la notación.

| `notacion` | `formaDeRespuesta` | Estación 2 | Estaciones 3 y 4 | Estación 5 |
|---|---|---|---|---|
| `lineal` | `numero` | `02-contacto` | `03-completar` + `04-escalera` | `05-error` |
| `lineal` | `fraccion` | `02-contacto` | `03-completar` + `04-escalera` | `05-error` |
| `lineal` | `numero` o `fraccion`, con el resultado sin una cifra | `02-contacto` | `X3-respuesta-no-numerica` | `05-error` |
| `lineal` | `expresion` | `02-contacto` | `X3-respuesta-no-numerica` | `05-error` |
| `lineal` | `palabra` | `02-contacto` | `X3-respuesta-no-numerica` | `05-error` |
| `lineal` | `trazo` | `02-contacto` | `X2-figura` | `05-error` |
| `tabla` | `numero` | `X1-tabla` | `X1-tabla` | `X1-tabla` |
| `tabla` | `fraccion` | `X1-tabla` | `X1-tabla` | `X1-tabla` |
| `tabla` | `expresion` | `X1-tabla` | `X1-tabla` | `X1-tabla` |
| `tabla` | `palabra` | `X1-tabla` | `X1-tabla` | `X1-tabla` |
| `tabla` | `trazo` | `X1-tabla` | `X2-figura` | `X1-tabla` |
| `figura` | cualquiera | `02-contacto` | `X2-figura` | `05-error` |

- **`formaDeRespuesta` no rutea la estación 2.** Ahí no se teclea: se toca una
  tarjeta. Un tema cuya respuesta es una palabra sí puede tener su estación 2
  normal.
- **`X1-tabla` es una sola llamada** que devuelve las cuatro estaciones juntas. El
  canon fija el procedimiento, no la forma de la rejilla, y cuatro llamadas
  separadas armarían cuatro cuadros de Punnett distintos.
- **`X4-no-encaja` no se rutea.** Se llama una vez por cada entrada de
  `noEncajan[]` del temario —son 37—, después de que el tema anfitrión ya tiene sus
  seis estaciones.
- **`X3-respuesta-no-numerica` se llama de verdad y se pinta.** Existen los cuatro
  teclados (`digitos`, `fichas`, `opciones` y `texto`: `src/componentes/Teclado.tsx`).
  `generar.mjs` genera ver, contacto, error y explicar, llama a X3 en lugar de
  completar y escalera, y guarda su salida en `casosAparte["X3-teclado"]`; los campos
  `completar` y `escalera` de la raíz del tema quedan en `null`. Va a X3 todo `lineal`
  con respuesta `palabra` o `expresion`, y también un `numero` o `fraccion` cuyo
  resultado no trae ni una cifra (`forma.mjs`): ése antes se detenía en «forma
  dudosa» y ahora se rutea.
- **`X1-tabla` y `X2-figura` siguen sin generarse.** Piden componentes de UI que no
  existen (rejilla, figuras): `generar.mjs` los nombra, genera las estaciones que sí
  corren y no llama al caso. Lo mismo para `trazo`, que va a X2.
- **`expresion` es el renglón que más pesa, y el que faltaba.** Es la respuesta que
  necesita un carácter que el teclado de dígitos no tiene. Sin ese renglón, la
  factorización del tema 2 se fue a la escalera, ésta pidió `2³ × 3² × 5` y
  `$defs.tecleado` la rechazó tres veces: el tope tenía razón, el ruteo no.

### Dos listas que no hay que confundir al contar reintentos

De los veinte primeros temas de matemáticas, **doce** no pueden recorrer las
estaciones 3 y 4 tal como está escrito su canon, y salen por dos puertas distintas:

- **Salen por `notacion`, no por teclado — 2 temas:** el **4** (la fracción en la
  recta, `figura`) y el **20** (proporcionalidad, `tabla`). Sus respuestas se teclean
  bien: `3/4` y `90`, con el `kg` en el enunciado. Lo que los bloquea es el dibujo y
  la rejilla, y ya tienen su ruta: `X2-figura` y `X1-tabla`.
- **Salen por el teclado — 10 temas:** el **1** (el cociente y el residuo son dos
  números), el **2** (exponente y `×`), el **6** y el **10** (`<`, `>`, `=`), el **11**,
  el **12** y el **14** (punto decimal), el **15**, el **16** y la mitad del **17**
  (signo menos). Los temas **10**, **15** y **16** están en las dos listas: su canon es
  `figura` *y* su respuesta no se teclea.

Encajan limpios ocho: **3, 5, 7, 8, 9, 13, 18** y el **19** —éste último sólo desde que
el prompt prohíbe el `:` y pide la razón escrita como fracción.

Dos cosas que ese conteo enseña:

- **Seis de los diez necesitan UN carácter** que el teclado no tiene: el punto (11, 12,
  14) o el menos (15, 16, 17). Dos más necesitan los tres de comparación (6, 10). Sólo
  el 1 y el 2 seguirían necesitando reformularse aunque el teclado creciera, porque su
  respuesta son dos números o un producto. `FILAS` es una constante de doce teclas en
  un archivo (`app/estacion/completar.tsx:26-31`) y el temario pide catorce o quince.
  Esa constante ya no existe: el teclado de fichas crece a cuatro columnas hasta 15
  fichas, así que el punto, el menos y los tres signos de comparación caben como
  fichas y no hace falta reformular esos temas.
- **`X3-respuesta-no-numerica` ya no sólo los documenta: los sirve.** De sus cuatro
  teclados corren los cuatro (`CONTRATO.md §5`), y con `fichas` se escriben el punto,
  el menos y `<`, `>`, `=`. Además los saca de `04-escalera` para que no cobren tres
  reintentos cada uno. Este conteo se hizo cuando X3 sólo se nombraba: no hay todavía
  una tanda medida con X3 generado de verdad.
- **La reformulación casi siempre existe, y a veces sale mejor.** El caso del **12** es
  el ejemplo: «¿cuántas cifras decimales lleva el resultado?», con `"2"`, es
  exactamente el error típico del tema convertido en un dígito. El que **no** se salva
  bien es el **11**: preguntado en centésimos desaparece el punto, y con él la
  posibilidad de desalinear, que es el único error que ese tema existe para curar.
  Con los cuatro teclados `00-canon.md` ya no empuja a reformular a la fuerza: dice
  que `expresion` es bienvenida y que el entero cuesta menos sólo cuando el tema se
  puede preguntar igual de bien con él.

---

## Cuánto cuesta

Con `claude-haiku-4-5` a $1 por millón de tokens de entrada y $5 de salida, y los
tamaños que `--seco` mide de verdad (un tema lineal):

| | por tema | los 20 de Matemáticas |
|---|---|---|
| entrada, 7 llamadas | ≈ 80 000 tokens · $0.08 | $1.60 |
| salida, 7 objetos JSON | ≈ 15 000 tokens · $0.08 | $1.50 |
| búsqueda de OpenAI (gpt-5.5) | ≈ 7 búsquedas · $0.21 | ≈ $4.20 |
| **total** | **≈ $0.37** | **≈ $7.30** |

Con Opus 5 los mismos 20 temas costarían del orden de **$40**. Ésa es la diferencia
que compra el cambio de modelo, y lo que se paga por ella está más abajo.

El caché ayuda de verdad aquí, y por una razón que no es obvia: el prefijo que se
cachea es `tools` + `system`, y **para una misma estación ese prefijo es idéntico en
los 20 temas**. Del segundo tema en adelante se lee del caché. El mínimo cacheable de
Haiku 4.5 son 4 096 tokens, no 1 024: el sistema solo (≈ 970) no llegaría, pero con
el esquema delante sí. `generar.mjs` imprime los tokens leídos y escritos de caché en
cada llamada, así que si sale cero, algo rompió el prefijo.

La API de lotes cuesta la mitad y estas llamadas no tienen prisa.

### El tope de gasto

Generar cuesta dinero de verdad y antes nada lo contaba. Ahora cada llamada se anota
en `contenido/temas/_gasto.json` (no se sube) y, **antes** de la siguiente, se mira
si ya se llegó al tope. Al llegar, el proceso sale con el código 3 y `tanda.mjs` no
sigue con el tema siguiente ni reintenta.

| Variable | Por omisión | Qué cuenta |
|---|---|---|
| `ANDAMIO_TOPE_CLAUDE_USD` | 9 | tokens reales de cada respuesta, con caché a su precio |
| `ANDAMIO_TOPE_OPENAI_USD` | 8 | **estimado**: búsquedas × `ANDAMIO_USD_POR_BUSQUEDA` (0.03) |

El de OpenAI es una estimación con el precio que mide este mismo archivo (≈ 7
búsquedas por $0.21), no la factura, y por eso su tope es más bajo. Lo que de verdad
manda es el límite de gasto que se ponga en el panel de cada proveedor: esto sólo
evita llegar a él. Un archivo de gasto ilegible también para la corrida, en vez de
seguir sin contador; si cambias de presupuesto, borra el archivo o sube el tope.

### Ampliar a una materia nueva, gastando lo menos posible

El sondeo es 1 llamada por tema (≈ $0.03 de Claude, ninguna de OpenAI) y dice a qué
prompt va a ir cada uno **antes** de pagar las seis estaciones:

```bash
node contenido/tanda.mjs biologia 1 35 --sondeo   # ≈ $1 las 35; mira "CAMINO NORMAL"
node contenido/generar.mjs biologia 3             # sólo los de camino normal, uno a uno
node contenido/indexar.mjs                        # y se meten en la app
```

Un tema sólo se puede abrir con las seis estaciones. Las 3 y 4 salen de
`03-completar` y `04-escalera` cuando la respuesta es un número o una fracción, y de
`X3-respuesta-no-numerica` cuando es una palabra, una expresión o una frase: esos
sí se abren, con el teclado que X3 elija. Los que se pagarían a medias sin poder
abrirse son los de `tabla` y `figura`, que siguen sin componente de UI. Por eso se
sondea primero.

**Lo que se midió al hacerlo con Biología y Química (35 temas cada una):**

| | Biología | Química |
|---|---|---|
| Canon a la primera | 15 de 35 | 19 de 35 |
| «Camino normal» según el sondeo | 4 (3 eran `FORMA DUDOSA`: resultado en frase) | 9 |
| Canon recuperado tras aclarar el prompt y reintentar | 6 (4 de camino normal) | 3 (2 de camino normal) |
| **Candidatos con respuesta numérica de verdad** | **5 de 35** | **11 de 35** |

Esa tabla se midió cuando X3 sólo se nombraba: los temas de palabra y los de «forma
dudosa» no se podían abrir. Ahora van a X3 (ver «Qué prompt le toca a qué tema»).

- **`formaDeRespuesta: "numero"` no basta.** El modelo la declaraba con un resultado
  que era una frase. `contenido/forma.mjs` lo caza (no hay ni una cifra en
  `ejemplo.resultado`) y el ruteo lo manda a X3: `generar.mjs` ya no se detiene en
  «forma dudosa» y `tanda.mjs` lo cuenta entre los de X3 y dice por qué.
- **Los canon rechazados eran casi todos prosa en un renglón.** Un átomo de `texto`
  mide 90 caracteres como máximo; el modelo escribía el enunciado del problema ahí.
  `00-canon.md` ya dice que el enunciado va en `deQueVa` y el renglón es lo que se
  escribiría en la libreta.
- **Reintentar a ciegas no arregla un rechazo de longitud.** Por eso `generar.mjs`
  hace una vuelta de corrección: devuelve al modelo su propia salida con los errores
  de ajv y pide corregir sólo esos campos.
- **Todos los canon candidatos traían errores de contenido** (cuentas que no cerraban,
  unidades duplicadas, errores típicos falsos, resultados no tecleables) aunque
  validaran perfecto. Antes de pagar las estaciones se revisan con un revisor de ciencia
  y otro de cuentas independientes, y se arreglan.
- **`node contenido/auditar.mjs <materia> <n>`** señala lo que el esquema no ve: pistas
  que regalan la respuesta, fracciones en línea, la voz de «es fácil», signos de JSON
  sueltos. Se corre sobre cada tema generado.

### Lo que se midió con X3 contra la API (15 temas)

Quince temas pasaron por `X3-teclado` con Haiku: los canon que ya estaban guardados
(Biología 3, 7, 9, 10, 12, 13, 15, 21; Química 4, 9) y, con `--solo X3-teclado`, cinco de
Matemáticas cuya estación 3 y 4 se habían escrito con dígitos y una reformulación
(2, 6, 11, 12, 17).

- **Quedaron 14 de 15.** El de Biología 21 no: sus respuestas son frases de más de 24
  caracteres, que es un problema del contenido y no del teclado.
- **Una corrida de X3 sale bien menos de la mitad de las veces** (29 corridas, 12
  guardadas, cada una con su vuelta de corrección); casi todos pasan con reintentos. En total
  los 15 temas costaron $2.92 de Claude y $2.10 de OpenAI (10 con las cuatro estaciones y la
  búsqueda de video, 5 sólo con X3), reintentos incluidos; una llamada de X3 suelta cuesta
  unos $0.04.
- **Por qué fallaba**, y lo que se hizo con cada cosa:
  - `completar` o `escalera` llegaban como texto JSON: `repararArreglosSerializados` ya
    abre también objetos.
  - Los escalones llegaban sin `pistas`: en el esquema van antes de `respuesta`
    (el modelo se las salta cuando van al final de un objeto largo) y el prompt lo dice.
  - Una ficha por número entero (`40`) en vez de dígitos: el prompt lo prohíbe y el aviso
    de corrección lo nombra.
  - La pista 3 que escribe la respuesta, sobre todo con `opciones` de dos candidatos: se
    reescribió a mano en Biología 9 y 15; sigue siendo la causa más común de rechazo.
  - `porQueEseTeclado` de más de 400 caracteres: se recorta al tope, nadie lo pinta.
  - Exponentes: `2³` se teclea con la ficha `³` y `enAtomos` lo pinta como superíndice;
    `aplanar` acepta las dos escrituras.
- **Decimales:** `2.50` y `2.5` son el mismo número y la app no los distingue (`19.5` vale
  `19.50`). Un entero (`100`) no se toca.

### Correr contra las APIs desde el contenedor de la nube

El `fetch` de Node 22 **no usa** `HTTPS_PROXY`. Sin `NODE_USE_ENV_PROXY=1` la búsqueda
de video de OpenAI contesta `403 Host not in allowlist` aunque `curl` funcione:

```bash
NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node contenido/tanda.mjs quimica 11
```

El contenedor se pausa cuando no hay actividad y se llevan los procesos en segundo
plano con él: una tanda larga se corta y hay que relanzarla (retoma por archivo). La
búsqueda de video ya buscada se guarda en `temas/_videos-<materia>-<n>.json`, así que
reanudar no la paga otra vez.

---

## Cómo se corre

Las llaves van en `.env` (ver `.env.ejemplo`), que `.gitignore` ignora. Los dos
scripts lo cargan solos; no hace falta exportar nada.

```bash
node contenido/tanda.mjs matematicas 1 20 --sondeo  # SOLO el canon de los 20
node contenido/tanda.mjs matematicas 1 20           # los 20 completos

node contenido/generar.mjs quimica 11            # un tema completo
node contenido/generar.mjs quimica 11 --seco      # sin API: revisa los prompts
node contenido/generar.mjs fisica 4 --solo ver    # una sola llamada
node contenido/generar.mjs biologia 7 --solo X3-teclado # sólo el caso del teclado
node contenido/generar.mjs matematicas 9 --rehacer # tira lo guardado y de cero

node contenido/indexar.mjs                         # mete en la app los temas que ya se pueden abrir
node contenido/indexar.mjs --revisar               # dice cuáles entran y cuáles no, sin escribir
```

**Generar un tema no lo mete en la app.** La app sólo abre lo que está en
`src/contenido/catalogo.ts`, y ese archivo lo escribe `indexar.mjs`: deja entrar
los temas con las seis estaciones (la 3 y la 4 pueden venir de `casosAparte["X3-teclado"]`,
si el caso trae `noSePuede` en `null`, al menos tres escalones y pasa las comprobaciones
de `contenido/teclado.mjs`) y sin `noSePuede` lleno de la 2 a la 6. Hay que correrlo
después de cada tanda y subir el archivo que escribe. `--revisar` dice qué entra y qué
no, y por qué, sin escribir.

**`--solo X3-teclado`** hace una sola llamada, la del caso del teclado, y guarda su
salida en `casosAparte["X3-teclado"]` (pisa la anterior). Sirve para rehacer sólo X3
sin repetir el video ni las otras cuatro estaciones, y no pide la llave de OpenAI.
Funciona aunque el canon no mande el tema a X3. Con `--rehacer` se tira el archivo
entero, canon incluido.

Un canon viejo, escrito cuando el teclado de dígitos era el único, llenó `noSePuede`
por regla en cuanto la respuesta era una `palabra` o una `expresion`. Ese aviso quedó
viejo: `generar.mjs` no se lo muestra a las llamadas de X3, y `tanda.mjs` e `indexar.mjs`
no lo cuentan (`noSePuedeVigente` en `teclado.mjs`). El archivo del canon no se toca.

La salida se escribe en `contenido/temas/<materia>-<numero>.json` **después de
cada llamada**, así que una corrida interrumpida se reanuda sola: al volver a
correrlo, lo que ya está no se vuelve a pedir. Si una estación falla, se sigue con
las demás, se avisa por su nombre y el script sale con código 1.

### Lo que el llamador comprueba antes de guardar

La API **no** valida el `tool_use` contra el `input_schema`: lo que devuelve el
modelo puede no casar con el esquema que se le mandó. El esquema sólo sirve si
alguien lo corre.

Y el orden importa: **primero se sella lo que el llamador sabe, después se valida.**
Un campo que nadie tenía que adivinar no puede tirar la llamada entera.

1. **Se sella** lo que el llamador sabe con certeza: `temaNumero`, `materia` y el
   `titulo` de raíz (`sellarTraza`); la `letra` de cada opción, el `orden` de cada
   pista y el `numero` de cada paso, que son el índice del arreglo (`sellarIndices`);
   `comoSeCompara`, `fichas` y `respuesta.opciones` del caso X3, que van en `false` o
   vacíos según el teclado, con `faltaCodigo` y `planB` quitados si el modelo los trae
   por costumbre (`sellarTeclado`); y la `url`, el
   `titulo`, el `canal`, `dondeSalio` y la `consulta` del video, que salen del
   candidato (`sellarVideo`). La tabla completa está en `CONTRATO.md §6bis`.
2. **Contra el esquema**, con ajv 2020-12.
3. **`temaNumero`, `materia` y el `titulo`** contra el tema que se pidió, y **cada
   índice contra su posición** (`comprobarTraza`, `comprobarIndices`). Sellar no es
   dejar de comprobar: un reintento que se cruza, o una tanda que se reanuda a
   medias, se caza aquí y no con un tema cuya estación 5 acusa un paso de otro. Y una
   `letra: "C"` en el primer lugar cambiaría cuál opción se marca como correcta.
4. **El teclado de X3** (`contenido/teclado.mjs`), lo que el esquema no puede
   expresar. Cada `correcta`, cada `aceptaTambien` y el `siTecleaElError` se arman con
   las fichas —programación dinámica, porque `C` y `Ca` son una ficha cada una y una
   es prefijo de la otra— o casan con `^[0-9]+(/[0-9]+)?$`. Con `opciones`: de 2 a 4,
   una sola `esCorrecta` y `correcta` igual a su etiqueta. Un solo hueco por renglón;
   `enAtomos`, aplanado, da `correcta`; la tercera pista no escribe la respuesta. Lo
   que falle vuelve al modelo en la vuelta de corrección, con el campo exacto. Un caso
   con `noSePuede` lleno no se revisa.
5. **Las tres URL de la estación 1**, contra el oEmbed de YouTube, que no pide
   llave. Un **200** con `title` y `author_name` quiere decir que el video existe,
   es público y se puede incrustar; **401, 403 o 404** que se borró, es privado o
   no deja incrustarse; **400** que el id está mal formado. Y el `title` y el
   `author_name` que devuelve se comparan con el `titulo` y el `canal` reportados:
   una URL que responde pero es otro video se tira igual.

   Si ninguno de los tres sobrevive, `video` se queda en `null` y el tema abre con
   la tarjeta vacía. Eso se puede ver en pantalla; un video equivocado no.

   oEmbed **no** devuelve duración. Ésa sale de la API de datos de YouTube
   (`contentDetails.duration`), y mientras no salga, el recuadro se queda vacío.

---

## Qué hacer cuando sale `noSePuede`

Todos los esquemas llevan `noSePuede`, y siempre viaja: `null` cuando todo salió
bien, y lleno con `que`, `porQue` y `queHagoConEsto` cuando el tema necesita algo
que la pantalla no puede dibujar.

**Un `noSePuede` lleno no es un error del modelo: es la respuesta correcta.** Vale
más eso que un ejercicio que la pantalla no puede pintar, porque ahí el estudiante
se traba y cree que el que está mal es él.

Qué hacer, según quién lo llenó:

| Quién | Qué significa | Qué sigue |
|---|---|---|
| **el canon** | el tema entero no cabe: la respuesta es un trazo, o un paso no se escribe con los cuatro átomos. Un decimal, un negativo, una letra o una palabra **no**: son `expresion` o `palabra` y van a X3 | el tema no se genera. Se anota y se espera a que exista lo que falta |
| **la estación 1** | no hay video en español que explique el por qué | el tema **sí** se publica. `pregunta` y `resumen` se escriben igual y la tarjeta del video se queda vacía |
| **la 2, 3, 4 o 5** | esa estación no cabe, pero el tema sí | el tema no se publica: son seis estaciones o ninguna (`BarraEstacion` tiene `TOTAL = 6`) |
| **la 6** | la única pregunta que valdría la pena necesita un dibujo | raro. Aquí no hay teclado que limite nada; si pasa, se revisa el canon |
| **`X3`** | un límite real: la respuesta es un trazo (va a X2), hacen falta más de 15 fichas o una etiqueta de más de 4 caracteres, la respuesta queda armada de un toque o dos, o con `texto` se calificaría ortografía | el tema no se publica y `indexar.mjs` lo excluye. Elegir `fichas`, `opciones` o `texto` **no** lo llena: los cuatro se sirven |

Lo que **no** se hace: publicar el tema de todos modos. Filtra por
`noSePuede !== null` antes de servir nada.

---

## El cierre no necesita IA

La séptima pantalla cierra el círculo y sus tres campos ya están escritos o son
estado:

- **`frase`** es `quedaSabiendo` del temario, tal cual. Ya está en primera persona
  y ya dice exactamente lo que el cierre cobra: «Ya puedo dividir una fracción
  entre otra, y explicar por qué el resultado sale más grande». Pedírsela a la API
  sería pagar por reescribir peor una frase que ya existe 165 veces.
- **`guardian`** es copy fijo, el mismo en los 165 temas. El tema vuelve más
  adelante; no hay nada que personalizar, y personalizarlo sólo abre la puerta a
  prometer una dificultad concreta.
- **`monedas`** es estado de la app.

Así que no hay `07-cierre.md` y no hace falta.

---

## Qué hay en pantalla hoy y qué falta

El contenido generado ya se recorre completo: las seis estaciones, la calificación,
las pistas, el cierre, y el progreso se guarda entre sesiones (ver `CONTRATO.md` §4 y
§5 para cómo quedó cada pieza).

**El teclado propio de cada tema ya existe** (`src/componentes/Teclado.tsx`). El tema
elige uno para las estaciones 3 y 4 —el caso `X3-respuesta-no-numerica`— y la app lo
sirve: `digitos` (como siempre), `fichas` (las teclas las define el tema: tres
columnas hasta 11 fichas y cuatro hasta 15; borrar quita una ficha entera),
`opciones` (elegir entre 2 y 4; las baraja la app y una equivocada muestra su
`queRevela`) y `texto` (el teclado del sistema, con `comoSeCompara` para perdonar
mayúsculas, acentos y espacios). Con él se abren los temas de palabra, de fórmula y
de decimales o negativos. Con él y el contenido generado hasta ahora el catálogo tiene
39 temas (14 de Matemáticas, 12 de Biología y 13 de Química); ver «Lo que se midió con
X3 contra la API». Las cuentas de la tabla de arriba (5 de Biología y 11 de Química) son
de antes de X3.

Lo que sigue sin existir, en orden de cuántos temas desbloquea:

1. **`src/componentes/Tabla.tsx`** — desbloquea los temas de `X1-tabla`.
2. **Los componentes de figura** — desbloquea los temas de `X2-figura`.
3. **Calificar la estación 6** — una segunda llamada a la API con la `rubrica`. Hoy se
   muestra como autoevaluación. Necesita la llave en un servidor, nunca en la app.
4. **Que el tema vuelva más adelante**, como promete el cierre. Hoy se guarda cuándo
   se cerró; falta quien decida cuándo sacarlo otra vez.
