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

Necesitas `OPENAI_API_KEY` además de `ANTHROPIC_API_KEY`. Las dos van en `.env`,
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
- **Los tres casos aparte piden componentes de UI que hoy no existen.** Su salida
  se puede generar y guardar, pero no se puede pintar. `generar.mjs` los nombra y
  no los llama.
- **`expresion` es el renglón que más pesa, y el que faltaba.** Es la respuesta que
  necesita un carácter que el teclado no tiene. Sin ese renglón, la factorización del
  tema 2 se fue a la escalera, ésta pidió `2³ × 3² × 5` y `$defs.tecleado` la rechazó
  tres veces: el tope tenía razón, el ruteo no.

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
  un archivo (`app/estacion/completar.tsx:23-28`) y el temario pide catorce o quince:
  vale la pena medir cuánto cuesta una cuarta y una quinta fila **antes** de escribir
  diez reformulaciones que mueven la pregunta lejos de la habilidad que el tema promete.
- **`X3-respuesta-no-numerica` no salva a ninguno de los diez hoy.** De sus cuatro
  teclados sólo corre `digitos` (`CONTRATO.md §5`), así que X3 los documenta; no los
  arregla. Lo que sí hace, y no es poco, es sacarlos de `04-escalera` para que no
  cobren tres reintentos cada uno.
- **La reformulación casi siempre existe, y a veces sale mejor.** El caso del **12** es
  el ejemplo: «¿cuántas cifras decimales lleva el resultado?», con `"2"`, es
  exactamente el error típico del tema convertido en un dígito. El que **no** se salva
  bien es el **11**: preguntado en centésimos desaparece el punto, y con él la
  posibilidad de desalinear, que es el único error que ese tema existe para curar.

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
node contenido/generar.mjs matematicas 9 --rehacer # tira lo guardado y de cero
```

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
   `faltaCodigo` y `comoSeCompara` del caso X3 (`sellarTeclado`); y la `url`, el
   `titulo`, el `canal`, `dondeSalio` y la `consulta` del video, que salen del
   candidato (`sellarVideo`). La tabla completa está en `CONTRATO.md §6bis`.
2. **Contra el esquema**, con ajv 2020-12.
3. **`temaNumero`, `materia` y el `titulo`** contra el tema que se pidió, y **cada
   índice contra su posición** (`comprobarTraza`, `comprobarIndices`). Sellar no es
   dejar de comprobar: un reintento que se cruza, o una tanda que se reanuda a
   medias, se caza aquí y no con un tema cuya estación 5 acusa un paso de otro. Y una
   `letra: "C"` en el primer lugar cambiaría cuál opción se marca como correcta.
4. **Las tres URL de la estación 1**, contra el oEmbed de YouTube, que no pide
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
| **el canon** | el tema entero no cabe: la respuesta es un trazo, o el resultado necesita un decimal o un negativo | el tema no se genera. Se anota y se espera a que exista lo que falta |
| **la estación 1** | no hay video en español que explique el por qué | el tema **sí** se publica. `pregunta` y `resumen` se escriben igual y la tarjeta del video se queda vacía |
| **la 2, 3, 4 o 5** | esa estación no cabe, pero el tema sí | el tema no se publica: son seis estaciones o ninguna (`BarraEstacion` tiene `TOTAL = 6`) |
| **la 6** | la única pregunta que valdría la pena necesita un dibujo | raro. Aquí no hay teclado que limite nada; si pasa, se revisa el canon |
| **`X3`** con `faltaCodigo` en `true` | el teclado que el tema necesita no existe todavía | se sirve el `planB` con dígitos si `sirveHoy` es `true`, y se vuelve a la versión buena cuando el teclado se escriba |

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

## Lo que falta antes de que esto se vea en pantalla

El contenido generado se puede guardar y validar hoy. **Ninguna pantalla lo lee
todavía**: siguen leyendo `src/contenido/demo.ts`. Lo que falta es código, no
contenido, y está enumerado con su archivo y su línea en `CONTRATO.md` §4 y §5. En
orden de cuántos temas desbloquea:

1. **`src/contenido/adaptar.ts`** — la puerta que junta el contenido redactado con
   el estado del estudiante y produce las formas de `src/contenido/tipos.ts`. Sin
   esto, ninguna pantalla lee nada. Desbloquea los 165.
2. **`src/componentes/HojaPista.tsx`** — hoy el texto de las pistas no tiene dónde
   leerse en ninguna de las tres estaciones que lo generan. Son hasta quince pistas
   por tema, unas 2 500 en total, hoy invisibles.
3. **El bloque de respuesta y el botón condicionado** — la lógica ya está en
   `src/contenido/calificar.ts`; falta que las cuatro pantallas la llamen y pinten
   lo que devuelve. Sin esto no se califica nada.
4. **`src/componentes/Tabla.tsx`** — desbloquea los temas de `X1-tabla`.
5. **El teclado de fichas** (que `FILAS` salga del contenido) — desbloquea los
   temas de `X3`.
6. **Los componentes de figura** — desbloquea los 36 temas de `X2-figura`.
