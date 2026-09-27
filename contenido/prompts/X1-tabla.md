# Caso aparte X1 · lo que necesita tabla o rejilla

**Cuándo se llama:** cuando el canon salió con `notacion: "tabla"`. Sustituye a
los cuatro prompts `02-contacto`, `03-completar`, `04-escalera` y `05-error`.
**Sistema:** `contenido/prompts/00-sistema.md`
**Esquema:** `contenido/esquema/X1-tabla.schema.json`
**Entra:** un tema del temario (`contenido/temarios/<materia>.json`) y el canon
completo (la salida del paso 0).
**Sale:** las estaciones 2, 3, 4 y 5 de ese tema, cada una con su rejilla y con
su plan B lineal.

Las estaciones 1 y 6 no llevan rejilla y siguen yendo a `01-ver.md` y
`06-explicar.md` sin cambio: el video se ve igual y la explicación se escribe
igual. El cierre tampoco cambia, y no es una séptima estación ni una séptima
llamada: no lo escribe la IA. Su frase es `quedaSabiendo` del temario y el resto
es copy fijo y estado de la app (`contenido/CONTRATO.md` §4).

---

## Por qué es una sola llamada y no cuatro

En los temas lineales cada estación se genera por su cuenta y el canon las
mantiene de acuerdo. Con una rejilla eso no alcanza: el canon fija el
procedimiento, pero no fija *la forma de la rejilla*. Cuatro llamadas separadas
armarían cuatro cuadros de Punnett con los alelos en distinto lugar, o cuatro
tablas de conteo de átomos con las columnas al revés, y el estudiante vería
cuatro rejillas distintas para el mismo tema.

Así que las cuatro estaciones que usan rejilla salen juntas, de una llamada, y
la forma de la rejilla se declara una sola vez en `rejilla`.

## Qué temas llegan aquí

Los que el temario describe con una rejilla y no con un renglón. Están
confirmados en `contenido/temarios/`:

| Materia | Temas | Qué rejilla |
|---|---|---|
| Biología | 23 (`El cuadro de Punnett`), 25 (`XX y XY: quién lo determina`) | cuadro de Punnett de 2×2: gametos en las orillas, genotipo en la casilla |
| Biología | 6 (`Leer la etiqueta nutrimental`), 20 (`Doble protección`) | tabla de dos columnas; la 20 es de palomitas y taches |
| Matemáticas | 20, 22, 24 (familia `proporción`), 31 (`Sucesiones`), 39 (`y = mx`) | tabla de valores con un hueco por celda |
| Química | 5, 7 (antes y después), 19 (tres columnas), 20 (grupo → valencia), 29 (antes y después de la reacción), 30 (conteo de átomos por lado de la flecha) | tabla comparativa de dos o tres columnas |
| Física | 29 (`El electroimán`), 31 (`El sonido necesita un medio`) | tablita de dos columnas de datos |

Dos cosas que **no** están en el temario, aunque se esperarían de un caso de
tablas. No hay ningún tema de tabla de frecuencias: la familia `datos` de
Matemáticas son dos temas, el 57 (gráficas, que es `figura`) y el 58 (media y
mediana, que es una lista entre llaves y va al prompt lineal). Y
«Probabilidad frecuencial» está en `noEncajan` de `matematicas.json`, fuera de
Andamio a propósito. Si algún día entra una tabla de frecuencias, cabe en esta
misma rejilla: dos columnas, dato y conteo.

Biología 23 es el caso que manda, y por eso el ejemplo de abajo es ése: en el
cuadro de Punnett las celdas **se derivan** de los encabezados, así que la
rejilla puede estar completa y estar mal al mismo tiempo. En una tabla
comparativa una celda equivocada es un dato equivocado; en un Punnett una celda
equivocada es un procedimiento equivocado.

## Qué componente de UI hace falta

Hace falta **uno**, nuevo: `src/componentes/Tabla.tsx`.

- Dibuja una rejilla de 2 a 4 columnas y 1 a 5 renglones, con una columna de
  rótulos a la izquierda y un renglón de encabezados arriba. Cada celda es un
  `<Expresion>` propio, así que una rejilla con cuatro huecos necesita cuatro
  valores tecleados distintos. Hoy `Expresion` recibe un solo `valorHueco` y lo
  escribe en todos los huecos del renglón
  (`src/componentes/Expresion.tsx:104`): la rejilla resuelve eso porque cada
  celda es una instancia aparte, pero la pantalla tiene que llevar el estado
  por celda, no uno solo.
- Necesita saber cuál celda está seleccionada, porque el temario de Biología 23
  lo pide con estas palabras: «hay que poder teclear en una casilla concreta».
- Y necesita el **banco de fichas**: cuando la respuesta de una celda lleva
  letras (`Aa`, `XY`, `Na`), el teclado de doce teclas de
  `app/estacion/completar.tsx:23-28` no la puede escribir. Se toca una ficha en
  vez de teclear. Eso es un componente más, o un modo del teclado.

Lo que **no** hace falta:

- **Ningún color nuevo.** La rejilla sale con lo que ya hay en `src/tema`:
  `colores.superficie` para la celda, `colores.borde` para las rayas,
  `colores.bordeHueco` punteado para la celda vacía, `colores.acento` para la
  celda llena y para la seleccionada, `colores.texto` y `colores.textoTenue`
  para contenido y rótulos, `radios.tarjeta` para el marco y `radios.hueco` para
  la celda. Nada de hex fuera de `src/tema` (`AGENTS.md`).
- **Ningún átomo nuevo.** La rejilla es un contenedor de renglones, no un quinto
  `ParteMat`: cada celda lleva adentro un renglón hecho con los cuatro átomos de
  siempre. Meterla en `ParteMat` la dejaría anidarse dentro de una fracción o de
  otra rejilla, y `Expresion` la dibujaría como un hueco vacío.
- **Ninguna pantalla nueva.** Siguen siendo seis estaciones
  (`app/cierre.tsx:23-29`, `src/componentes/BarraEstacion.tsx:16`). La rejilla
  se mete en la `Tarjeta` donde hoy va la `Expresion`.
- **Ningún teclado nuevo para el plan B.** Las respuestas del plan B son números
  o fracciones y las doce teclas de hoy las escriben.

## Cómo se une el esquema

`X1-tabla.schema.json` se manda tal cual como `input_schema` de la herramienta.
Los cuatro átomos (`#/$defs/parteMat`, `renglon`, `renglonConHueco`, `tecleado`,
`noSePuede`) los pega `node contenido/esquema/armar.mjs --escribir` desde
`contenido/esquema/partes.json`, así que el archivo queda autocontenido y sus
`$ref` son todos internos.

La rejilla **no** vive en `$defs`, y no es un descuido: `armar.mjs` reemplaza el
bloque `$defs` entero con el de `partes.json`, así que un `$def` propio se
borraría en la primera corrida. Por eso la definición de la rejilla está escrita
entera en las cuatro estaciones. Las cuatro copias son idénticas y se generan
juntas.

---

## Mensaje del usuario

Vas a escribir las estaciones 2, 3, 4 y 5 de un tema que no se puede escribir en
renglones porque lo que enseña es una rejilla.

Las cuatro salen de esta llamada. No hay otra llamada que las escriba, y no
recibes nada de las otras estaciones: la 1 y la 6 se generan aparte, a partir
del mismo canon, y no se hablan contigo. El canon es lo único que comparten.

## El tema

- Materia: {{materia}} · {{materiaNombre}}
- Número: {{tema.numero}}
- Título: {{tema.titulo}}
- Familia: {{tema.familia}}
- Grado: {{tema.grado}}
- Al terminar, el estudiante dice: {{tema.quedaSabiendo}}
- Depende de los temas: {{tema.dependeDe}}
- Error típico: {{tema.errorTipico}}
- Los cinco pasos, en borrador: {{tema.losCincoPasos}}
- Notación que pide el tema: {{tema.notacion}}

`{{tema.notacion}}` es la que te trajo aquí: descríbela con tus palabras en
`rejilla.deQueEs` y no la contradigas. Si al leerla resulta que el tema sí cabe
en un renglón, no inventes una rejilla: llena `noSePuede` diciendo que este tema
iba al prompt lineal.

## El canon, que es ley

```json
{{canon}}
```

Fíjate en esto de ahí arriba:

- El procedimiento se llama {{canon.procedimiento.nombre}}, y sus cinco pasos
  son los únicos cinco pasos de este tema. No los renombras, no los reordenas,
  no agregas un sexto.
- El ejemplo va de {{canon.ejemplo.deQueVa}}. Los números y las letras de tus
  rejillas son los suyos.
- El error se cae en el paso {{canon.error.pasoQueCorrompe}}, y atrás de él está
  esta creencia: {{canon.error.creenciaDeAtras}}. De ahí salen los motivos malos
  de la estación 5.
- Los números que este tema puede usar: {{canon.cotas.numeros}}. La escalera no
  se sale de ahí.

## Cómo se escribe una rejilla

Dentro de cada celda se escribe con los cuatro átomos de siempre:

| Átomo | Se ve así |
|---|---|
| `{"tipo":"texto","valor":"Aa"}` | palabras, signos, `+ − × ÷ = < > ≈ →` |
| `{"tipo":"fraccion","arriba":3,"abajo":4}` | tres cuartos apilados |
| `{"tipo":"simbolo","valor":"H","sub":"2"}` | H con 2 al pie |
| `{"tipo":"hueco"}` | recuadro punteado |

La rejilla **no es un quinto átomo**: es un contenedor. Tiene `columnas` (los
encabezados, de izquierda a derecha, sin contar la columna de los rótulos) y
`filas` (cada una con su `rotulo` y una celda por columna).

Encabezados, rótulos y celdas son todos del mismo tipo, y hay dos:

- `{"tipo":"dato","partes":[...],"deDondeSale":"..."}` — ya viene escrita.
- `{"tipo":"hueco","respuesta":"Aa","comoSeLee":"...","deDondeSale":"..."}` — la
  llena el estudiante. La respuesta correcta viaja en la celda misma, porque en
  una rejilla hay más de un hueco y cada uno tiene la suya.

Reglas de forma:

1. `filas[i].celdas` trae **exactamente** tantas celdas como encabezados hay en
   `columnas`. Una celda vacía de contenido es un `dato` con un guion bajo o una
   raya en `texto`, no una celda de menos.
2. Como mucho **cuatro** celdas de tipo `hueco` en toda la rejilla. Con más, el
   estudiante deja de razonar y se pone a rellenar.
3. Una celda mide tres o cuatro caracteres. Una celda con una frase adentro
   desborda la rejilla en una pantalla de 390 de ancho: eso va en la pregunta.
4. `respuesta` sólo lleva dígitos, letras y la diagonal. Nada que necesite
   subíndice ni superíndice: si la respuesta de una celda fuera `Xᵈ` con la d
   arriba, esa celda va como `dato` y el hueco se mueve a otra celda.
5. Dentro de una celda no va un átomo de `hueco`. Una celda que se llena es de
   tipo `hueco`, no un `dato` con un hueco adentro.

## La coherencia es el trabajo, no las celdas

`deDondeSale` es obligatorio en cada celda, y es corto a propósito: «renglón a
con columna A», «átomos de H del lado izquierdo», «el brillo del azufre». Si no
puedes decir de dónde sale una celda, esa celda está inventada.

En el cuadro de Punnett esto es todo el tema. La casilla **no es un dato**: es
el alelo de su renglón pegado al alelo de su columna, con la mayúscula primero.
Escribe esa regla en `rejilla.reglaDeLaCelda` y después compruébala celda por
celda antes de devolver:

- renglón `A` + columna `A` da `AA`
- renglón `A` + columna `a` da `Aa`
- renglón `a` + columna `A` da `Aa`, no `aA`
- renglón `a` + columna `a` da `aa`

Y las orillas también se derivan: un progenitor `Aa` pone `A` en una orilla y
`a` en la otra, nunca `Aa` en las dos. Un progenitor `aa` pone `a` en las dos.
Si las cuatro casillas te salieron iguales a los papás, no separaste los
gametos: ése es justo el error típico y sólo va en la estación 5.

En las tablas que no se derivan de nada —una comparativa de metales, un antes y
después— `reglaDeLaCelda` dice cómo se lee una celda: «cada celda es la
propiedad del renglón medida en el elemento de la columna».

## Cómo se llena

`rejilla.comoSeLlena` es una de dos:

- `"teclado"` — **todas** las respuestas de tus celdas hueco casan con
  `^[0-9]+(/[0-9]+)?$`. Las doce teclas de hoy las escriben. Deja `banco` fuera.
- `"banco"` — alguna respuesta lleva letras (`Aa`, `XY`, `Na`). El teclado de
  hoy no tiene letras, así que la celda se llena tocando una ficha. Entonces
  llenas `banco` con las fichas: las correctas y las equivocadas revueltas, y
  entre las equivocadas la del error típico del canon (por ejemplo `aA`, cuando
  la regla pide la mayúscula primero).

Toda respuesta que esté en una celda hueco tiene que aparecer en `banco`. Una
respuesta que no está en el banco no se puede contestar.

## Qué produces, estación por estación

### Estación 2 · `contacto`

De tres a cuatro `preguntas[]`. Es una lista: cuál va y cuántas faltan lo deriva
la app.

Cada pregunta trae una rejilla **llena** —todas sus celdas son `dato`, porque
aquí no se llena nada—, una `pregunta` que se contesta mirando la rejilla, y
cuatro `opciones` con letras A a D y exactamente una correcta.

La rejilla de una pregunta puede venir bien llena o mal llena: mostrar una
rejilla mal armada y preguntar qué tiene de raro es lo más diagnóstico que hay
en esta estación. Aquí no se castiga, se averigua qué cree el estudiante, y eso
es lo que `queRevela` escribe en cada opción. Una de las tres equivocadas es el
error típico del canon.

Las opciones son de **un solo renglón**: `app/estacion/contacto.tsx:113-121`
tiene `height: 64` fija y una opción que no quepa se desborda, no se parte. Una
fracción, un número, o tres o cuatro palabras.

### Estación 3 · `completar`

Una sola rejilla, la del ejemplo canónico, con de una a cuatro celdas por
llenar. Dices en `pasoDelCanon` en cuál de los cinco pasos vive el hueco, y
tiene que ser un paso que el canon ya enseñó.

`pistas[]`, dos o tres, escalonadas: la 1 reencuadra sin dar nada, la 2 señala
el paso del canon que toca, la 3 casi da la respuesta. Son textos con su orden,
no un número: cuántas quedan y cuándo se liberan lo lleva la app.

### Estación 4 · `escalera`

De tres a cuatro `escalones[]`, del más fácil al más difícil, sin salirse de
`{{canon.cotas.numeros}}`. Es un arreglo: en cuál va lo deriva la app.

Cada escalón trae una `situacion` de la vida real, su rejilla con huecos, su
`pregunta` y sus pistas.

Esta estación es el procedimiento al revés, y con una rejilla eso tiene una
forma propia: en vez de pedir una celda del cuerpo, pide un **encabezado**. Se
ven las cuatro casillas y falta el gameto de la orilla. Ahí el estudiante tiene
que usar la regla de la celda de atrás para adelante, que es exactamente lo que
esta estación mide. Úsalo por lo menos en el escalón más alto.

### Estación 5 · `error`

Una rejilla **como la llenó quien se equivocó**: todas sus celdas son `dato`,
porque aquí no se llena nada, se acusa.

Además de los cinco pasos del canon escritos como esa persona los hizo, con
`pasoMalo` igual a `{{canon.error.pasoQueCorrompe}}`, llenas `loQueEstaMal`:
qué pedazo de la rejilla delata el error. Puede ser un encabezado de columna, un
rótulo de renglón o una celda del cuerpo, con su número contando desde 1. Esto
es lo que amarra el paso malo con lo que se ve en pantalla: sin él, el
estudiante tiene que creer que un paso está mal en vez de cacharlo mirando.

Los `motivos` (de dos a cuatro, exactamente uno bueno) salen de
`{{canon.error.creenciaDeAtras}}`. Un motivo malo que suena absurdo se descarta
sin pensar y no enseña nada; un motivo malo bueno es el que tú mismo dudarías.

## El plan B lineal

Cada pregunta, cada rejilla y cada escalón lleva su `planB`: la misma pregunta
escrita en renglones, sin rejilla, para que el tema pueda correr **hoy**,
mientras `src/componentes/Tabla.tsx` no exista.

No es un adorno ni un resumen: es la versión que se va a ver en pantalla. Así
que:

- En las estaciones 3 y 4, `planB.expresion` es un renglón con **exactamente un
  hueco** (`src/componentes/Expresion.tsx:104` escribe lo tecleado en todos los
  huecos del renglón a la vez) y `planB.respuesta` casa con
  `^[0-9]+(/[0-9]+)?$`. Si la respuesta de la rejilla era `Aa`, la del plan B no
  puede serlo: se cambia la pregunta por un conteo. «¿Cuántas casillas salieron
  `aa`?» se contesta con `1`.
- En las estaciones 2 y 5, `planB.enunciado` es un renglón sin huecos. Las
  opciones, los pasos y los motivos no cambian: ya son renglones y la pantalla
  de hoy los dibuja tal cual.
- `queSePierde` se escribe honesto. Di qué deja de aprender el estudiante sin la
  rejilla. Si resulta que no se pierde nada, este tema no necesitaba tabla y va
  al prompt lineal.

Las unidades nunca se teclean: van en el enunciado y el hueco recibe sólo el
número.

## `noSePuede`, que aquí nunca es `null`

Si este tema llegó hasta acá es porque pide una rejilla, y hoy **nada** en
`src/componentes` dibuja una: `Expresion` es una fila que se envuelve
(`src/componentes/Expresion.tsx:136-146`). Así que `noSePuede` siempre es un
objeto:

- `que` — qué rejilla hace falta, y si sus respuestas llevan letras.
- `porQue` — qué componente falta para dibujarla, y si además falta el banco de
  fichas porque el teclado no escribe letras.
- `queHagoConEsto` — con qué plan B corre el tema mientras tanto.

Escríbelo con el archivo y la línea, como arriba. Alguien lo va a leer para
decidir qué programar.

## Prohibido

- **Prohibido inventar un átomo.** No hay `{"tipo":"tabla"}` dentro de un
  renglón, ni `{"tipo":"figura"}`, ni `{"tipo":"grafica"}`, ni `{"tipo":"color"}`.
  Si lo que el tema necesita es un dibujo y no una rejilla, eso no es tu caso:
  llena `noSePuede` y dilo.
- **Prohibido anidar.** Ni una rejilla dentro de una celda, ni una fracción
  dentro de una fracción. `fraccion.arriba` y `fraccion.abajo` son una sola
  cadena de un renglón (`src/componentes/Fraccion.tsx:19-45`); si lo de arriba
  necesita un subíndice, se escribe con palabras.
- **Prohibido `"3/5"` en un renglón.** Eso es una `fraccion`. La diagonal en
  `texto` sólo vale dentro de una unidad compuesta (`m/s`, `mg/L`), y en
  `respuesta`, donde es la fracción tecleada.
- **Prohibido el guion por el menos.** El menos es `−` (U+2212). El por es `×`,
  no `x` ni `*`.
- **Prohibido un `simbolo` sin `sub` ni `sup`.** Eso es `texto`, y el esquema lo
  rechaza.
- **Prohibido un campo de estado.** No escribes `pistas: 3`, ni `escalon`, ni
  `indice`, ni `total`, ni `estado`, ni `respuestaInicial`, ni `borrador`, ni
  `hueco.valor`, ni `hueco.ancho`, ni `hueco.alto`. Eso lo pone la app. Las
  pistas son una lista de textos; los escalones y las preguntas son listas.
- **Prohibido un «N de M».** Ni «pregunta 2 de 4», ni «escalón 3 de 5», ni
  dentro de un enunciado. El índice lo deriva la app y tu texto se
  desincronizaría en cuanto alguien agregue un escalón.
- **Prohibido que la rejilla traiga estilo.** Ni color, ni ancho de columna, ni
  alineación, ni tamaño, ni peso de letra. El contenido no trae estilo
  (`AGENTS.md`).
- **Prohibido rellenar la rejilla para que se vea grande.** Cinco renglones que
  repiten lo mismo no enseñan más que dos. Si dos columnas bastan, van dos.
- **Prohibido salirse del canon.** No cambias los números del ejemplo, no
  renombras un paso, no usas un sinónimo de una palabra del vocabulario, y no
  metes un alelo, un elemento o una unidad que no esté en `cotas`.
- **Prohibido dejar una respuesta que no se pueda contestar.** Si
  `comoSeLlena` es `"banco"` y una respuesta no está en `banco`, el ejercicio
  está roto. Si es `"teclado"` y una respuesta lleva letras, está roto.
- **Prohibido el plan B de adorno.** Un `planB` que repite la pregunta de la
  rejilla sin quitar la rejilla no sirve: nadie lo puede dibujar hoy.

## Un ejemplo completo

Biología, tema 23, `El cuadro de Punnett`, 1º de secundaria, familia `herencia`.
El canon de este tema trae los cinco pasos del llenado del cuadro (1 escribir el
genotipo de cada progenitor, 2 separar sus gametos, 3 ponerlos en las orillas,
4 llenar las cuatro casillas, 5 contar cuántas de cada tipo salieron), el
ejemplo de la cruza `Aa × Aa` y el error típico del paso 2: poner el par entero
en la orilla.

Mira tres cosas en esta salida. Una, `deDondeSale` en cada celda: es lo que hace
que el cuadro cuadre. Dos, la segunda pregunta de la estación 2, que muestra el
cuadro **mal** llenado a propósito. Tres, el tercer escalón de la estación 4,
que borra los encabezados en vez de las casillas: ése es el procedimiento al
revés.

```json
{
  "temaNumero": 23,
  "materia": "biologia",
  "titulo": "El cuadro de Punnett",
  "rejilla": {
    "deQueEs": "En las columnas van los gametos del padre, en los renglones los gametos de la madre, y dentro de cada casilla el genotipo que le toca a la cría.",
    "porQueNoCabeEnUnRenglon": "Aplanado a un renglón, el cuadro se vuelve una lista de cuatro genotipos y se pierde lo único que enseña: que cada casilla sale de cruzar el gameto de su renglón con el de su columna.",
    "reglaDeLaCelda": "Cada casilla es el alelo de su renglón pegado al alelo de su columna, y la mayúscula se escribe primero: el renglón a con la columna A da Aa, no aA.",
    "comoSeLlena": "banco",
    "banco": ["AA", "Aa", "aa", "aA", "A", "a"]
  },
  "contacto": {
    "preguntas": [
      {
        "tabla": {
          "deQueEs": "cuadro de Punnett de la cruza Aa × Aa, ya lleno",
          "rotuloEsquina": "madre / padre",
          "columnas": [
            { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "A" }], "deDondeSale": "gameto del padre" },
            { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "a" }], "deDondeSale": "gameto del padre" }
          ],
          "filas": [
            {
              "rotulo": { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "A" }], "deDondeSale": "gameto de la madre" },
              "celdas": [
                { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "AA" }], "deDondeSale": "renglón A con columna A" },
                { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "renglón A con columna a" }
              ]
            },
            {
              "rotulo": { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "a" }], "deDondeSale": "gameto de la madre" },
              "celdas": [
                { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "renglón a con columna A, mayúscula primero" },
                { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "aa" }], "deDondeSale": "renglón a con columna a" }
              ]
            }
          ]
        },
        "pregunta": "En este cuadro, ¿cuántas casillas salieron aa?",
        "opciones": [
          {
            "letra": "A",
            "partes": [{ "tipo": "texto", "valor": "1" }],
            "esCorrecta": true,
            "queRevela": "Contó casilla por casilla y vio que sólo la de abajo a la derecha junta los dos alelos minúsculos."
          },
          {
            "letra": "B",
            "partes": [{ "tipo": "texto", "valor": "2" }],
            "esCorrecta": false,
            "queRevela": "Contó también una casilla Aa: está leyendo la a de Aa como si ese genotipo ya fuera recesivo."
          },
          {
            "letra": "C",
            "partes": [{ "tipo": "texto", "valor": "3" }],
            "esCorrecta": false,
            "queRevela": "Contó las tres casillas que llevan alguna a, sin ver que aa pide las dos minúsculas juntas."
          },
          {
            "letra": "D",
            "partes": [{ "tipo": "texto", "valor": "4" }],
            "esCorrecta": false,
            "queRevela": "Cree que las cuatro casillas repiten a los papás, que es a donde llega quien pone el par entero en la orilla."
          }
        ],
        "planB": {
          "comoSeReformula": "En vez de mirar el cuadro, se lee la lista de las cuatro casillas ya armada.",
          "enunciado": [{ "tipo": "texto", "valor": "De la cruza Aa × Aa salen AA, Aa, Aa y aa. ¿Cuántas casillas son aa?" }],
          "queSePierde": "Ya no se ve de dónde sale cada casilla: el estudiante cuenta una lista que alguien más armó por él."
        }
      },
      {
        "tabla": {
          "deQueEs": "cuadro de Punnett de Aa × Aa llenado con el par entero en las orillas",
          "rotuloEsquina": "madre / padre",
          "columnas": [
            { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "par entero del padre, sin separar los gametos" },
            { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "par entero del padre, repetido en la otra columna" }
          ],
          "filas": [
            {
              "rotulo": { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "par entero de la madre, sin separar los gametos" },
              "celdas": [
                { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "copia del par de los papás" },
                { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "copia del par de los papás" }
              ]
            },
            {
              "rotulo": { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "par entero de la madre, repetido" },
              "celdas": [
                { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "copia del par de los papás" },
                { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "copia del par de los papás" }
              ]
            }
          ]
        },
        "pregunta": "¿Qué está mal en las orillas de este cuadro?",
        "opciones": [
          {
            "letra": "A",
            "partes": [{ "tipo": "texto", "valor": "va un alelo, no el par" }],
            "esCorrecta": true,
            "queRevela": "Sabe que en la orilla va un gameto, y un gameto lleva un alelo de los dos que tiene el progenitor."
          },
          {
            "letra": "B",
            "partes": [{ "tipo": "texto", "valor": "faltan dos columnas" }],
            "esCorrecta": false,
            "queRevela": "Busca el error en el tamaño del cuadro. Cree que con más columnas cabrían más resultados."
          },
          {
            "letra": "C",
            "partes": [{ "tipo": "texto", "valor": "los alelos van en minúscula" }],
            "esCorrecta": false,
            "queRevela": "Todavía no distingue que la mayúscula y la minúscula son dos alelos distintos y no dos formas de escribir."
          },
          {
            "letra": "D",
            "partes": [{ "tipo": "texto", "valor": "nada, así se llena" }],
            "esCorrecta": false,
            "queRevela": "Da por bueno el par entero en la orilla. Es el error típico: por eso le salen cuatro casillas que repiten a los papás."
          }
        ],
        "planB": {
          "comoSeReformula": "La rejilla mal llenada se cuenta en el enunciado, y las cuatro opciones se quedan igual.",
          "enunciado": [{ "tipo": "texto", "valor": "Alguien puso Aa arriba y Aa al lado, y le salieron cuatro casillas Aa. ¿Qué está mal?" }],
          "queSePierde": "Sin ver las orillas repetidas, el error se vuelve una frase que hay que creer en vez de algo que se cacha mirando."
        }
      },
      {
        "tabla": {
          "deQueEs": "cuadro de Punnett de la cruza aa × Aa, ya lleno",
          "rotuloEsquina": "madre / padre",
          "columnas": [
            { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "A" }], "deDondeSale": "gameto del padre Aa" },
            { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "a" }], "deDondeSale": "el otro gameto del padre Aa" }
          ],
          "filas": [
            {
              "rotulo": { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "a" }], "deDondeSale": "gameto de la madre aa" },
              "celdas": [
                { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "renglón a con columna A, mayúscula primero" },
                { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "aa" }], "deDondeSale": "renglón a con columna a" }
              ]
            },
            {
              "rotulo": { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "a" }], "deDondeSale": "el otro gameto de la madre aa" },
              "celdas": [
                { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "renglón a con columna A, mayúscula primero" },
                { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "aa" }], "deDondeSale": "renglón a con columna a" }
              ]
            }
          ]
        },
        "pregunta": "En esta cruza, ¿cuántas casillas llevan el alelo A?",
        "opciones": [
          {
            "letra": "A",
            "partes": [{ "tipo": "texto", "valor": "2" }],
            "esCorrecta": true,
            "queRevela": "Contó en este cuadro y no en el de siempre: vio que la madre aa sólo puede dar a."
          },
          {
            "letra": "B",
            "partes": [{ "tipo": "texto", "valor": "1" }],
            "esCorrecta": false,
            "queRevela": "Contó una sola columna y dejó fuera el segundo renglón, que repite lo mismo."
          },
          {
            "letra": "C",
            "partes": [{ "tipo": "texto", "valor": "3" }],
            "esCorrecta": false,
            "queRevela": "Contestó 3 porque espera el 3 a 1 de todos los cuadros, sin mirar que aquí un progenitor es aa."
          },
          {
            "letra": "D",
            "partes": [{ "tipo": "texto", "valor": "4" }],
            "esCorrecta": false,
            "queRevela": "Cree que si un papá tiene A, la A aparece en todas las casillas: está contando al progenitor, no a los gametos."
          }
        ],
        "planB": {
          "comoSeReformula": "Se lee la lista de las cuatro casillas de la cruza aa × Aa en vez de mirarla en el cuadro.",
          "enunciado": [{ "tipo": "texto", "valor": "De la cruza aa × Aa salen Aa, aa, Aa y aa. ¿Cuántas casillas llevan A?" }],
          "queSePierde": "Se pierde la comparación visual con el cuadro de Aa × Aa, que es lo que rompe la idea de que siempre sale 3 a 1."
        }
      }
    ]
  },
  "completar": {
    "pasoDelCanon": 4,
    "tabla": {
      "deQueEs": "cuadro de Punnett de la cruza Aa × Aa, con el renglón de abajo por llenar",
      "rotuloEsquina": "madre / padre",
      "columnas": [
        { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "A" }], "deDondeSale": "gameto del padre" },
        { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "a" }], "deDondeSale": "el otro gameto del padre" }
      ],
      "filas": [
        {
          "rotulo": { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "A" }], "deDondeSale": "gameto de la madre" },
          "celdas": [
            { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "AA" }], "deDondeSale": "renglón A con columna A" },
            { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "renglón A con columna a" }
          ]
        },
        {
          "rotulo": { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "a" }], "deDondeSale": "el otro gameto de la madre" },
          "celdas": [
            {
              "tipo": "hueco",
              "respuesta": "Aa",
              "comoSeLee": "A mayúscula, a minúscula",
              "deDondeSale": "renglón a con columna A, mayúscula primero"
            },
            {
              "tipo": "hueco",
              "respuesta": "aa",
              "comoSeLee": "a minúscula, a minúscula",
              "deDondeSale": "renglón a con columna a"
            }
          ]
        }
      ]
    },
    "pistas": [
      {
        "orden": 1,
        "texto": "Las dos casillas que faltan están en el mismo renglón. Mira qué alelo tiene ese renglón en la orilla de la izquierda."
      },
      {
        "orden": 2,
        "texto": "Vas en el paso 4, llenar las casillas. Cada casilla es el alelo de su renglón pegado al alelo de su columna."
      },
      {
        "orden": 3,
        "texto": "El renglón de abajo trae a. Con la columna A queda Aa, con la mayúscula primero. Con la columna a quedan las dos minúsculas."
      }
    ],
    "planB": {
      "comoSeReformula": "En vez de llenar las casillas, se cuentan las de la lista que ya viene armada.",
      "expresion": [
        { "tipo": "texto", "valor": "Aa × Aa da AA, Aa, Aa y aa. Casillas aa =" },
        { "tipo": "hueco" }
      ],
      "respuesta": "1",
      "comoSeLee": "una",
      "queSePierde": "El estudiante deja de armar el cuadro y nada más cuenta: el paso 4, que es justo llenar las casillas, no se practica."
    }
  },
  "escalera": {
    "escalones": [
      {
        "situacion": "En el vivero cruzan dos plantas de chícharo de flor morada, las dos Aa, y quieren saber qué flores pueden salir.",
        "tabla": {
          "deQueEs": "cuadro de Punnett de la cruza Aa × Aa, con una casilla por llenar",
          "rotuloEsquina": "madre / padre",
          "columnas": [
            { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "A" }], "deDondeSale": "gameto del padre" },
            { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "a" }], "deDondeSale": "el otro gameto del padre" }
          ],
          "filas": [
            {
              "rotulo": { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "A" }], "deDondeSale": "gameto de la madre" },
              "celdas": [
                {
                  "tipo": "hueco",
                  "respuesta": "AA",
                  "comoSeLee": "A mayúscula, A mayúscula",
                  "deDondeSale": "renglón A con columna A"
                },
                { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "renglón A con columna a" }
              ]
            },
            {
              "rotulo": { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "a" }], "deDondeSale": "el otro gameto de la madre" },
              "celdas": [
                { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "renglón a con columna A, mayúscula primero" },
                { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "aa" }], "deDondeSale": "renglón a con columna a" }
              ]
            }
          ]
        },
        "pregunta": "¿Qué genotipo va en la casilla que falta?",
        "pistas": [
          {
            "orden": 1,
            "texto": "Esa casilla está donde se cruzan el renglón de arriba y la columna de la izquierda. Lee los dos alelos de esas orillas."
          },
          {
            "orden": 2,
            "texto": "Paso 4: la casilla es el alelo de su renglón pegado al de su columna. Las dos orillas traen la misma letra."
          }
        ],
        "planB": {
          "comoSeReformula": "Se cuenta cuántas casillas de la lista traen las dos mayúsculas, en vez de escribir la casilla.",
          "expresion": [
            { "tipo": "texto", "valor": "Aa × Aa da AA, Aa, Aa y aa. Casillas con dos A =" },
            { "tipo": "hueco" }
          ],
          "respuesta": "1",
          "comoSeLee": "una",
          "queSePierde": "Ya no se escribe el genotipo de una casilla concreta: se cuenta un resultado que alguien más dedujo."
        }
      },
      {
        "situacion": "La misma planta morada Aa se cruza ahora con una de flor blanca, que es aa y no tiene ninguna A.",
        "tabla": {
          "deQueEs": "cuadro de Punnett de la cruza aa × Aa, con una casilla por llenar",
          "rotuloEsquina": "madre / padre",
          "columnas": [
            { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "A" }], "deDondeSale": "gameto del padre Aa" },
            { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "a" }], "deDondeSale": "el otro gameto del padre Aa" }
          ],
          "filas": [
            {
              "rotulo": { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "a" }], "deDondeSale": "gameto de la madre aa" },
              "celdas": [
                { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "renglón a con columna A, mayúscula primero" },
                {
                  "tipo": "hueco",
                  "respuesta": "aa",
                  "comoSeLee": "a minúscula, a minúscula",
                  "deDondeSale": "renglón a con columna a"
                }
              ]
            },
            {
              "rotulo": { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "a" }], "deDondeSale": "el otro gameto de la madre aa" },
              "celdas": [
                { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "renglón a con columna A, mayúscula primero" },
                { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "aa" }], "deDondeSale": "renglón a con columna a" }
              ]
            }
          ]
        },
        "pregunta": "¿Qué genotipo va en la casilla que falta?",
        "pistas": [
          {
            "orden": 1,
            "texto": "La madre es aa, así que los dos renglones traen la misma letra. Fíjate en cuál columna cae la casilla vacía."
          },
          {
            "orden": 2,
            "texto": "Paso 4: pega el alelo del renglón con el de la columna. Aquí los dos son el alelo minúsculo."
          },
          {
            "orden": 3,
            "texto": "Renglón a con columna a. Quedan las dos minúsculas juntas, y esa es la planta de flor blanca."
          }
        ],
        "planB": {
          "comoSeReformula": "Se cuentan las casillas de flor blanca de la lista en vez de escribir el genotipo de una.",
          "expresion": [
            { "tipo": "texto", "valor": "aa × Aa da Aa, aa, Aa y aa. Casillas aa =" },
            { "tipo": "hueco" }
          ],
          "respuesta": "2",
          "comoSeLee": "dos",
          "queSePierde": "Se pierde ver que las dos casillas aa caen en la misma columna, que es de dónde sale el mitad y mitad."
        }
      },
      {
        "situacion": "Alguien ya llenó las cuatro casillas de una cruza, pero borró los gametos del padre de la orilla de arriba.",
        "tabla": {
          "deQueEs": "cuadro de Punnett lleno con los dos encabezados de columna borrados",
          "rotuloEsquina": "madre / padre",
          "columnas": [
            {
              "tipo": "hueco",
              "respuesta": "A",
              "comoSeLee": "A mayúscula",
              "deDondeSale": "la columna donde quedaron AA y Aa"
            },
            {
              "tipo": "hueco",
              "respuesta": "a",
              "comoSeLee": "a minúscula",
              "deDondeSale": "la columna donde quedaron Aa y aa"
            }
          ],
          "filas": [
            {
              "rotulo": { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "A" }], "deDondeSale": "gameto de la madre" },
              "celdas": [
                { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "AA" }], "deDondeSale": "renglón A con la columna de la izquierda" },
                { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "renglón A con la columna de la derecha" }
              ]
            },
            {
              "rotulo": { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "a" }], "deDondeSale": "el otro gameto de la madre" },
              "celdas": [
                { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "renglón a con la columna de la izquierda" },
                { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "aa" }], "deDondeSale": "renglón a con la columna de la derecha" }
              ]
            }
          ]
        },
        "pregunta": "¿Qué gameto del padre va arriba de cada columna?",
        "pistas": [
          {
            "orden": 1,
            "texto": "Las casillas ya están. Tápate la orilla de arriba y pregúntate qué letra comparten las dos casillas de una misma columna."
          },
          {
            "orden": 2,
            "texto": "Estás haciendo el paso 4 al revés: si la casilla es renglón más columna, quítale al genotipo el alelo del renglón."
          },
          {
            "orden": 3,
            "texto": "En la columna de la izquierda están AA y Aa, y sus renglones son A y a. Lo que sobra en las dos es la misma letra."
          }
        ],
        "planB": {
          "comoSeReformula": "Sin rejilla no se puede pedir el gameto de la orilla, porque se contesta con una letra y el teclado no las tiene: se pide un conteo.",
          "expresion": [
            { "tipo": "texto", "valor": "Aa × Aa da AA, Aa, Aa y aa. Casillas con al menos una A =" },
            { "tipo": "hueco" }
          ],
          "respuesta": "3",
          "comoSeLee": "tres",
          "queSePierde": "Se pierde el escalón entero: ya no se deduce el gameto de la orilla a partir de las casillas, que es el procedimiento al revés."
        }
      }
    ]
  },
  "error": {
    "enunciado": [{ "tipo": "texto", "valor": "Alguien cruzó dos plantas Aa × Aa y llenó así su cuadro." }],
    "tabla": {
      "deQueEs": "cuadro de Punnett de Aa × Aa como lo llenó quien se equivocó",
      "rotuloEsquina": "madre / padre",
      "columnas": [
        { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "par entero del padre, sin separar los gametos" },
        { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "el mismo par entero, repetido en la otra columna" }
      ],
      "filas": [
        {
          "rotulo": { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "par entero de la madre, sin separar los gametos" },
          "celdas": [
            { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "copia del par de los papás" },
            { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "copia del par de los papás" }
          ]
        },
        {
          "rotulo": { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "el mismo par entero, repetido en el otro renglón" },
          "celdas": [
            { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "copia del par de los papás" },
            { "tipo": "dato", "partes": [{ "tipo": "texto", "valor": "Aa" }], "deDondeSale": "copia del par de los papás" }
          ]
        }
      ]
    },
    "pasos": [
      { "numero": 1, "partes": [{ "tipo": "texto", "valor": "Los dos papás son Aa y Aa." }] },
      { "numero": 2, "partes": [{ "tipo": "texto", "valor": "Gametos: Aa y Aa." }] },
      { "numero": 3, "partes": [{ "tipo": "texto", "valor": "Aa y Aa arriba, Aa y Aa a la izquierda." }] },
      { "numero": 4, "partes": [{ "tipo": "texto", "valor": "Las cuatro casillas: Aa, Aa, Aa, Aa." }] },
      { "numero": 5, "partes": [{ "tipo": "texto", "valor": "Salen 4 moradas y 0 blancas." }] }
    ],
    "pasoMalo": 2,
    "loQueEstaMal": {
      "donde": "columna",
      "columna": 1,
      "queDice": [{ "tipo": "texto", "valor": "Aa" }],
      "queDeberiaDecir": [{ "tipo": "texto", "valor": "A" }]
    },
    "porQue": "¿Por qué está mal ese paso?",
    "motivos": [
      {
        "texto": "En la orilla va un alelo, no el par: los gametos se separan.",
        "esElBueno": true,
        "queRevela": "Vio que el paso 2 no se hizo, y que por eso las orillas quedaron con el par completo y las casillas no cambian."
      },
      {
        "texto": "A una cruza Aa × Aa le queda chico un cuadro de dos por dos.",
        "esElBueno": false,
        "queRevela": "Busca el error en el tamaño del cuadro. Sigue pensando que en la orilla va el genotipo entero del progenitor."
      },
      {
        "texto": "Se equivocó al contar las casillas del final.",
        "esElBueno": false,
        "queRevela": "Acusa el paso 5 porque ahí está el resultado raro, y no el paso 2, donde el cuadro ya venía mal armado."
      }
    ],
    "planB": {
      "comoSeReformula": "Los cinco pasos ya son renglones y la pantalla los dibuja hoy; la rejilla mal llenada se cuenta en el enunciado.",
      "enunciado": [{ "tipo": "texto", "valor": "Alguien puso Aa en las dos orillas de su cuadro y le salieron cuatro casillas Aa." }],
      "queSePierde": "El estudiante no ve las orillas repetidas, así que el error del paso 2 deja de tener una consecuencia que se pueda mirar."
    }
  },
  "noSePuede": {
    "que": "El cuadro de Punnett de dos por dos: los gametos en las orillas, las cuatro casillas que se llenan una por una, y respuestas como Aa o aa, que llevan letras.",
    "porQue": "Nada en src/componentes dibuja una rejilla (Expresion.tsx:136-146 es una fila que se envuelve) y el teclado de app/estacion/completar.tsx:23-28 sólo tiene dígitos y diagonal, así que Aa no se puede teclear.",
    "queHagoConEsto": "Correr el tema con el plan B lineal de cada estación, cuyas respuestas son números y sí se teclean hoy, y guardar la rejilla hasta que existan src/componentes/Tabla.tsx y el banco de fichas."
  }
}
```

## Antes de devolver, revísate

1. ¿`filas[i].celdas` trae exactamente tantas celdas como encabezados hay en
   `columnas`, en todas las rejillas?
2. ¿Cada celda tiene su `deDondeSale`, y cada uno dice algo de verdad?
3. Si es un cuadro de Punnett: ¿cada casilla es el alelo de su renglón pegado al
   de su columna, con la mayúscula primero? ¿Las orillas traen un alelo y no el
   par? Compruébalo casilla por casilla, no de un vistazo.
4. ¿Las rejillas de las estaciones 2 y 5 tienen todas sus celdas en `dato`, sin
   ningún hueco?
5. ¿Ninguna rejilla pasa de cuatro huecos, cuatro columnas o cinco renglones?
6. ¿Toda `respuesta` de celda hueco aparece en `banco`, si `comoSeLlena` es
   `"banco"`? ¿Casa con `^[0-9]+(/[0-9]+)?$`, si es `"teclado"`?
7. ¿Cada `planB.expresion` lleva **exactamente un** hueco, y cada
   `planB.respuesta` casa con `^[0-9]+(/[0-9]+)?$`?
8. ¿`pasoDelCanon` y `pasoMalo` apuntan a pasos que el canon ya enseñó, y
   `pasoMalo` es el `pasoQueCorrompe` del canon?
9. ¿Hay exactamente una opción correcta en cada pregunta de la 2, y exactamente
   un motivo bueno en la 5?
10. ¿Ninguna `fraccion` tiene átomos adentro? ¿Ningún `simbolo` va sin `sub` ni
    `sup`? ¿Nada de `"3/5"` en un renglón, nada de guion por menos, nada de `x`
    por `×`?
11. ¿Cero campos de estado, cero «N de M», cero estilo?
12. ¿`noSePuede` está lleno, con el componente que falta y el plan B con el que
    el tema corre mientras tanto?
13. **La lista, campo por campo.** Ésta es la llamada más grande de las once:
    cuatro estaciones en una. Tacha uno por uno: `rejilla`, `contacto`,
    `completar`, `escalera`, `error` y `noSePuede`.
    - `rejilla`: `deQueEs`, `porQueNoCabeEnUnRenglon`, `reglaDeLaCelda`,
      `comoSeLlena` (`banco` es opcional).
    - cada `tabla`, la haya donde la haya: `deQueEs`, `columnas`, `filas`; cada
      fila `rotulo` y `celdas`; y **cada celda, columna y rótulo** lleva `tipo` y
      `deDondeSale`, más `partes` si es texto o `respuesta` y `comoSeLee` si es un
      hueco. `deDondeSale` es el que se va: es corto, va al final de la celda y hay
      docenas.
    - `contacto`: `preguntas`, y cada una `tabla`, `pregunta`, `opciones` y
      `planB`; cada opción `partes`, `esCorrecta` y `queRevela`; el `planB` de
      contacto y el de error, `comoSeReformula`, `enunciado` y `queSePierde`.
    - `completar`: `pasoDelCanon`, `tabla`, `pistas` y `planB` con
      `comoSeReformula`, `expresion`, `respuesta`, `comoSeLee` y `queSePierde`.
    - `escalera`: `escalones`, y cada uno `situacion`, `tabla`, `pregunta`,
      `pistas` y `planB` (los cinco del planB de completar).
    - `error`: `enunciado`, `tabla`, `pasos` (cada uno con sus `partes`),
      `pasoMalo`, `loQueEstaMal` con `donde`, `queDice` y `queDeberiaDecir`
      (`columna` y `fila` son opcionales), `porQue`, `motivos` (cada uno `texto`,
      `esElBueno` y `queRevela`) y `planB`.
    Recórrelo estación por estación, no de corrido: lo que se olvida está al final
    de cada una, y una estación incompleta tira las cuatro. El `titulo`, la
    `letra` de cada opción, el `orden` de cada pista y el `numero` de cada paso no
    van en esta lista: los pone quien llama.
