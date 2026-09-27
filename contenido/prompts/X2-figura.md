# Caso aparte · lo que necesita un dibujo

**Cuándo se llama:** cuando el canon devolvió `notacion: "figura"`. Va después
del paso 0 y en lugar de `03-completar` y `04-escalera`, que son las dos
estaciones que el dibujo iba a cargar.
**Sistema:** `contenido/prompts/00-sistema.md`
**Esquema:** `contenido/esquema/X2-figura.schema.json`
**Entra:** el tema del temario y el canon completo.
**Sale:** la especificación de la figura, el plan B lineal para que el tema
corra hoy sin ella, y `noSePuede` lleno con el componente que falta.

Con el criterio «sin el dibujo no se puede contestar», 36 de los 165 temas
necesitan figura. Física es la peor parada: 14 de sus 35 con ese criterio
estricto, 18 si se cuentan los cuatro cuyo dibujo manda pero cuya respuesta es
una palabra o una tabla. El ±2 contra el conteo del arquitecto está en la
frontera entre dibujo y escenografía, y no cambia nada: lo que decide qué se
construye primero son los conteos por clase de la tabla de abajo, no el total.

---

## Por qué el modelo no devuelve SVG

La tentación es obvia: pedirle el `<svg>` hecho y pintarlo. No se hace, por
cuatro razones concretas de este repo.

1. **No respeta la paleta.** El fondo de Andamio es `#14120F` y hay un solo
   acento, ámbar `#E8A33D` (`src/tema/index.ts:9-43`). Un modelo escribiendo
   SVG suelto pone ejes negros, series azules y verdes, y relleno blanco: una
   gráfica de libro de texto sobre un fondo casi negro. Peor: `AGENTS.md`
   prohíbe cualquier hex fuera de `src/tema`, así que el SVG generado sería
   código que el repo no acepta.
2. **No sale accesible.** Un `<svg>` es un bulto para el lector de pantalla.
   Aquí la figura viaja con `leerEnVozAlta`, una cadena que alcanza para
   contestar sin ver el dibujo, y el componente la pone en
   `accessibilityLabel`. `Expresion` ya hace exactamente eso con las fracciones
   (`src/componentes/Expresion.tsx:28-38`).
3. **No sale igual dos veces.** Con 36 temas, un modelo dibujando a mano libre
   produce 36 estilos: ejes de distinto grosor, rótulos en distinto lugar,
   puntos de distinto tamaño. El diseño de Andamio está copiado de un canvas y
   las medidas son exactas, no aproximadas. Una spec pasa por un componente y
   sale igual las 36 veces.
4. **No se puede validar.** De un `<svg>` no se puede saber si el punto que
   falta es uno y sólo uno, si los valores caben en las cotas del canon, ni si
   la respuesta es tecleable. De `{"x":12,"y":80,"falta":true}` sí, y el
   esquema lo hace solo.

Y una quinta, la que de verdad importa: **el SVG no se puede contestar**. El
hueco de una figura tiene que ser un dato que la app conozca para calificar. En
una spec el hueco es un elemento con `falta: true` y su respuesta en un campo
aparte. En un SVG es un rectángulo punteado del que nadie sabe qué va adentro.

La otra cara del trato: una spec sólo dibuja lo que su clase sabe dibujar. Por
eso las clases se definen a partir del temario, se cierran con un `enum`, y
cuando un tema pide algo que no está, no se inventa una clase: se devuelve
`figura: null` y `noSePuede` dice cuál falta.

## Las cinco clases que el temario pide de verdad

| Clase | Qué dibuja | Temas | Dónde va el hueco |
|---|---|---|---|
| `rectaNumerica` | una línea con marcas y, si hace falta, una flecha de salto | 5 | la marca que hay que ubicar |
| `planoCartesiano` | ejes numéricos con puntos, recta, quebrada o curva | 4 | un punto que falta |
| `circuito` | piezas y cables, como grafo | 2 | la pieza o el dato que falta |
| `escalaDePh` | la escala del 0 al 14 con sustancias encima | 3 | la sustancia sin colocar |
| `diagramaDeFuerzas` | uno o dos cuerpos con flechas rotuladas | 4 | la flecha sin magnitud |

Los 18 temas, por si hay que revisarlos a mano:

- `rectaNumerica` — Mate 4, 10, 15, 16; Física 3.
- `planoCartesiano` — Mate 38, 39; Física 6, 22.
- `circuito` — Física 25, 27.
- `escalaDePh` — Química 32, 33; Bio 8.
- `diagramaDeFuerzas` — Física 9, 10, 11, 14.

## Lo que no cabe en las cinco

Son 15 temas más con dibujo que manda y respuesta tecleable, más 3 que además
contestan con palabra y los comparte con `X3`. Aquí el prompt devuelve
`figura: null` y nombra la clase que falta.

| Clase que falta | Temas | Cuáles |
|---|---|---|
| estructura de Lewis (puntos alrededor del símbolo) | 4 | Quím 17, 21, 22, 23 |
| figura geométrica con medidas | 4 | Mate 47, 49, 50, 52 |
| rayos de luz con ángulos y normal | 3 | Física 33, 34, 35 |
| barras y circular (y la pirámide de energía) | 2 | Mate 57; Bio 33 |
| onda (cresta, valle, amplitud) | 2 | Física 30, 32 |
| rejilla de Punnett | 2 | Bio 23, 25 |
| árbol de posibilidades | 1 | Mate 60 |
| esquema de partículas | 2 | Quím 3; Física 20 |

Y once más traen dibujo de escenografía o con rótulos que la estación 3
resuelve tecleando un nombre (la célula, la flor, los estratos, el árbol de
parentesco, el imán, el cuarto de la convección, el globo con cargas, la
balanza). Ésos son del caso de respuesta no numérica, no de éste.

## Qué componentes habría que construir, y en qué orden

Ninguno existe. `src/componentes/` tiene `Expresion`, `Fraccion`, `Tarjeta`,
`Marco`, `BarraEstacion`, `CirculoTema`, `Iconos` y nada que dibuje. La buena
noticia es que `react-native-svg` 15.15.4 ya es dependencia y el círculo del
cierre ya lo usa (`app/cierre.tsx:46-64`): no hace falta instalar nada.

El orden que conviene, por temas desbloqueados y por código compartido:

1. **`RectaNumerica.tsx`** — 5 temas. El más barato: un eje, rayitas, etiquetas
   y una flecha. Trae el lienzo, la escala de valor a pixel y el recuadro
   punteado del hueco, que los cuatro siguientes reusan.
2. **`EscalaDePh.tsx`** — 3 temas, acumulado 8. Es la recta del paso 1 fija del
   0 al 14 con tres zonas rotuladas. Casi gratis si el paso 1 quedó bien.
3. **`Plano.tsx`** — 4 temas, acumulado 12. Dos ejes en vez de uno, más el
   trazo. Con un modo de barras cubre 2 temas más y llega a 14.
4. **`DiagramaDeFuerzas.tsx`** — 4 temas, acumulado 18. Dibujo nuevo, pero sin
   ejes: un cuerpo y flechas con largo proporcional a la magnitud.
5. **`Circuito.tsx`** — 2 temas, acumulado 20. El más caro (símbolos de pila,
   foco y apagador, acomodo del grafo, tramos tocables) y el que menos
   desbloquea. Va al final.

Después del quinto, las dos clases que más pesan son Lewis y figura geométrica
con medidas, con 4 temas cada una.

## Cómo se une el esquema

`X2-figura.schema.json` se escribe sin bloque `$defs` y con `$ref` internos a
`#/$defs/renglon`, `#/$defs/renglonConHueco`, `#/$defs/tecleado` y
`#/$defs/noSePuede`. Los átomos los pega `node contenido/esquema/armar.mjs
--escribir`, que copia el bloque de `partes.json` dentro del archivo para que la
llamada quede autocontenida.

---

## Mensaje del usuario

De aquí al final del archivo va tal cual, con los placeholders sustituidos.

Este tema necesita un dibujo. Tu trabajo tiene dos mitades que valen lo mismo:
describir ese dibujo con la precisión suficiente para que alguien lo programe
después, y dejar el tema corriendo hoy sin él.

No devuelves SVG. No devuelves coordenadas en pixeles, ni colores, ni grosores,
ni tipografías. Devuelves los datos de la figura; un componente de React Native
los dibuja con la paleta de la app. Si escribes un color o un pixel, el
componente tendría que ignorarlo, y el esquema lo rechaza.

## El tema

- Materia: {{materiaNombre}} ({{materia}})
- Número: {{tema.numero}}
- Título: {{tema.titulo}}
- Familia: {{tema.familia}}
- Grado: {{tema.grado}}
- Al terminar, el estudiante dice: {{tema.quedaSabiendo}}
- Depende de los temas: {{tema.dependeDe}}
- Error típico: {{tema.errorTipico}}
- Los cinco pasos, en borrador: {{tema.losCincoPasos}}
- Notación que pide el tema: {{tema.notacion}}

Ese último campo es el que te trajo hasta aquí: ahí está descrito el dibujo que
el tema pide. Léelo como especificación, no como sugerencia.

## El canon

El canon ya está fijado y es ley. Sus cinco pasos, los números de su ejemplo,
las palabras de su vocabulario y sus cotas no se cambian, no se renombran y no
se sustituyen por sinónimos. Tu figura se dibuja **sobre el ejemplo del canon**,
no sobre un caso nuevo que se te ocurra.

```json
{{canon}}
```

Para que no se te pase:

- Procedimiento: {{canon.procedimiento.nombre}}
- De qué va el ejemplo: {{canon.ejemplo.deQueVa}}
- El error se cae en el paso: {{canon.error.pasoQueCorrompe}}
- Lo que el estudiante cree: {{canon.error.creenciaDeAtras}}
- Números permitidos: {{canon.cotas.numeros}}

Eso es todo lo que recibes. No recibes lo que escribieron las otras estaciones
de este tema: las seis llamadas corren sin hablarse y el canon es lo único que
comparten. Por eso el ejemplo del canon es obligatorio: si tú dibujas un viaje
de 12 s y la estación 5 corrompe un paso de un viaje de 20 s, el estudiante ve
dos temas distintos y concluye que no entendió ninguno.

## Lo primero que decides: qué clase de figura es

Son cinco y no hay más. Elige la que el tema pide de verdad:

- **`rectaNumerica`** — una línea con marcas. Para ubicar una fracción entre 0
  y 1, para los negativos alrededor del cero, para el valor absoluto y para el
  desplazamiento con su sentido. Lleva `flecha` sólo cuando el tema es de salto
  o de sentido.
- **`planoCartesiano`** — dos ejes numéricos con puntos, una recta, una quebrada
  o una curva. Para el plano a secas, para `y = mx`, para distancia contra
  tiempo y para la meseta de un cambio de estado. No sirve para barras ni para
  gráficas circulares.
- **`circuito`** — piezas y cables. Las piezas son `pila`, `foco`, `apagador`,
  `resistencia`, `ampermetro` y `voltimetro`; los cables son las `conexiones`,
  no son piezas. El circuito tiene que quedar cerrado.
- **`escalaDePh`** — la escala del 0 al 14 con sustancias colocadas encima. La
  escala nunca se recorta ni se estira. `zona` va escrita con palabras porque el
  color no puede ser el único dato que distinga un ácido de una base: quien no
  distingue colores tiene que poder contestar.
- **`diagramaDeFuerzas`** — uno o dos cuerpos con flechas rotuladas. Dos cuerpos
  sólo en acción y reacción. Las flechas van en las cuatro direcciones de la
  pantalla; no hay inclinadas porque el temario no las pide. El componente saca
  el largo de la magnitud, así que dos fuerzas iguales salen iguales sin que lo
  pidas.

Si lo que este tema necesita no es ninguna de las cinco —una estructura de
Lewis, una onda, rayos de luz, una rejilla de Punnett, una gráfica de barras,
un triángulo con sus medidas, un esquema de partículas, un árbol— **no inventes
una clase y no la disfraces de otra**. Devuelve `figura: null` y di en
`noSePuede` qué clase falta. Una escala de pH usada de onda es peor que ninguna
figura.

## El hueco de la figura

Un hueco por figura: exactamente un elemento con `falta: true` en toda la spec.
Es lo que el estudiante tiene que sacar mirando el dibujo.

El elemento que falta viaja con su valor verdadero. El componente no lo dibuja:
pone un recuadro punteado en su lugar, como el hueco de un renglón. El valor
está ahí para que la app califique y para dibujar la figura completa una vez
contestada.

En `hueco.respuesta` va lo que el estudiante teclea, y el teclado de la app
tiene doce teclas: `1`–`9`, `0`, `/` y borrar. Nada más. Toda respuesta tecleada
casa con `^[0-9]+(/[0-9]+)?$`: sin punto decimal, sin signo menos, sin letras,
sin grados, sin unidades. **La unidad no se teclea nunca**: la pone el eje o el
enunciado, y el hueco recibe sólo el número. Si lo que falta es un trazo y no un
número, deja `respuesta` fuera: la respuesta tecleable vive en el plan B.

`leerEnVozAlta` no es un resumen de cortesía. Es lo que oye quien no ve la
pantalla, y tiene que alcanzar para contestar: los rótulos de los ejes con su
unidad y su rango, cada valor en el orden en que se lee, y dónde está el hueco.
Si con esa cadena no se puede contestar, está incompleta.

## El plan B

Hoy ninguna pantalla dibuja nada de esto. El plan B es la misma pregunta hecha
con los cuatro átomos, para que el tema corra mientras el componente no exista.
Cubre las dos estaciones que el dibujo iba a cargar, la 3 y la 4. Las
estaciones 1, 2, 5 y 6 de este tema salen de sus prompts normales.

Los cuatro átomos, y no hay un quinto:

| Átomo | Se ve |
|---|---|
| `{"tipo":"texto","valor":"÷"}` | palabras y signos sueltos: `+ − × ÷ = < > ≈ →` |
| `{"tipo":"fraccion","arriba":3,"abajo":5}` | tres quintos apilados |
| `{"tipo":"simbolo","valor":"s","sup":"2"}` | subíndice, superíndice, carga, unidad |
| `{"tipo":"hueco"}` | el recuadro que el estudiante llena |

Reglas de los renglones, todas duras:

- Nunca `"3/5"` en un renglón: eso es una `fraccion`. La diagonal en `texto`
  sólo vale dentro de una unidad compuesta (`m/s`, `mg/L`).
- Dentro de una `fraccion` no caben átomos: `arriba` y `abajo` son una cadena de
  un renglón. Si arriba necesita un subíndice, se escribe con palabras.
- Un `simbolo` sin `sub` ni `sup` es `texto`, y el esquema lo rechaza.
- Un renglón lleva **un** hueco. Con dos, la pantalla escribe lo tecleado en los
  dos a la vez y el ejercicio deja de tener sentido.
- El menos es `−` (U+2212), no un guion. El por es `×`, no `x` ni `*`.

En `datosEnPalabras` van los datos que la figura llevaba, dichos en un renglón,
para que el estudiante tenga con qué trabajar. En `completar` va un renglón con
un hueco sobre uno de los cinco pasos del canon, y dices en cuál. En `escalones`
van de dos a cuatro casos que suben de dificultad sin salirse de las cotas, y
uno de ellos cae justo donde vive el error típico.

`queSePierde` se escribe sin adornos. Es el campo con el que alguien va a
decidir si vale la pena construir el componente, así que di lo que de verdad se
pierde. Si al quitar el dibujo no se pierde nada, el dibujo era adorno y este
tema no era de figura.

## `noSePuede` nunca es null aquí

En los demás prompts `noSePuede` es la salida de emergencia. En éste es el
estado normal: aunque tu spec salga perfecta, hoy nada en `src/componentes`
dibuja una figura, así que el tema no se puede recorrer completo. Siempre va
lleno:

- `que`: qué pedazo del tema no se puede mostrar, nombrando la clase de figura.
- `porQue`: por qué no se puede, con el archivo que lo demuestra.
- `queHagoConEsto`: si el tema corre mientras tanto con el plan B, o si conviene
  dejarlo fuera hasta que el componente exista.

Antes de llenarlo, intenta una vez reformular: si lo que falta es un trazo, tal
vez la pregunta puede pedir un número que se lea del dibujo. Si la
reformulación cambia lo que el tema enseña, no reformules.

## Lo que no se hace

- No devuelves SVG, ni HTML, ni una descripción de cómo dibujar (nada de
  «traza una línea de 200 px»).
- No devuelves colores, hex, grosores, fuentes, tamaños ni posiciones en
  pixeles. El contenido no trae estilo.
- No usas el color como único dato: si dos cosas se distinguen, se distinguen
  también por su etiqueta.
- No inventas una clase de figura. Son cinco.
- No metes más de un elemento con `falta: true`.
- No inventas datos: ni pH, ni magnitudes, ni voltajes, ni pares de puntos que
  no salgan del canon o del temario.
- No pones unidades dentro de una respuesta tecleada, ni decimales, ni negativos,
  ni letras, ni el símbolo de grado.
- No pones campos de estado: cuántas pistas quedan, en qué escalón va, el índice
  del tema, el borrador. Eso lo pone la app. Las pistas son una lista con su
  orden y su texto.
- No escribes markdown dentro de los campos, ni saltos de línea de adorno: son
  cadenas planas que la pantalla pinta tal cual.
- No cambias el ejemplo del canon para que te quede más bonita la figura.
- No pones etiquetas largas en la figura: un rótulo de eje son una o dos
  palabras, y una etiqueta de punto cabe en un par ordenado.

## Un ejemplo completo

Física, tema 6, «La gráfica distancia-tiempo», 2º de secundaria. El canon de
ese tema fija cinco pasos para sacar la rapidez de un tramo (leer el punto donde
empieza, leer el punto donde termina, restar las distancias, restar los tiempos,
dividir una resta entre la otra) y un ejemplo que va de (4 s, 20 m) a (8 s,
80 m). El error típico es leer la gráfica como si fuera el dibujo del camino, y
creer que la línea horizontal significa que se regresó. Por eso el punto que
falta es justo el del tramo horizontal: quien lea la gráfica como un camino va a
contestar cualquier cosa menos 80.

```json
{
  "temaNumero": 6,
  "materia": "fisica",
  "titulo": "La gráfica distancia-tiempo",
  "figura": {
    "titulo": "La distancia de un camión de carga contra el tiempo",
    "queSeLee": "De la gráfica sale en qué metro está el camión en cada segundo, y si en ese tramo avanza o está quieto.",
    "leerEnVozAlta": "Gráfica de distancia contra tiempo. El eje horizontal es el tiempo en segundos, del 0 al 12, de 2 en 2. El eje vertical es la distancia en metros, del 0 al 100, de 20 en 20. Hay tres puntos marcados y uno vacío. A los 0 segundos, 0 metros, ahí arranca. A los 4 segundos, 20 metros. A los 8 segundos, 80 metros. Sobre la línea de los 12 segundos hay un hueco por llenar: ahí va el punto que falta. Entre los 8 y los 12 segundos el camión no se movió.",
    "datos": {
      "clase": "planoCartesiano",
      "ejeX": { "rotulo": "t", "unidad": "s", "desde": 0, "hasta": 12, "paso": 2 },
      "ejeY": { "rotulo": "d", "unidad": "m", "desde": 0, "hasta": 100, "paso": 20 },
      "trazo": "quebrada",
      "puntos": [
        { "x": 0, "y": 0, "etiqueta": "arranca", "falta": false },
        { "x": 4, "y": 20, "etiqueta": "(4 s, 20 m)", "falta": false },
        { "x": 8, "y": 80, "etiqueta": "(8 s, 80 m)", "falta": false },
        { "x": 12, "y": 80, "falta": true }
      ]
    },
    "hueco": {
      "que": "el punto que dice en qué metro está el camión a los 12 s, cuando ya lleva cuatro segundos parado",
      "donde": "sobre la línea de los 12 s del eje del tiempo, a la altura que le toque en el eje de la distancia",
      "respuesta": "80",
      "respuestaEnPalabras": "ochenta metros"
    }
  },
  "planB": {
    "queSobrevive": "La cuenta de la rapidez de un tramo sale igual con los dos pares de números dichos en palabras: la gráfica no cambia la aritmética.",
    "queSePierde": "Se pierde lo único que este tema enseña de verdad: que la línea horizontal quiere decir quieto y no que se regresó. Con números sueltos el estudiante saca 0 sin haber visto nunca la meseta.",
    "datosEnPalabras": [
      {
        "tipo": "texto",
        "valor": "A los 4 s llevaba 20 m. A los 8 s llevaba 80 m. De los 8 s a los 12 s no se movió."
      }
    ],
    "completar": {
      "pasoDelCanon": 5,
      "expresion": [
        { "tipo": "texto", "valor": "rapidez =" },
        { "tipo": "fraccion", "arriba": "80 m − 20 m", "abajo": "8 s − 4 s" },
        { "tipo": "texto", "valor": "=" },
        { "tipo": "hueco" },
        { "tipo": "texto", "valor": "m/s" }
      ],
      "respuesta": {
        "tecleado": "15",
        "aceptaTambien": [],
        "comoSeLee": "quince metros por segundo"
      },
      "pistas": [
        {
          "orden": 1,
          "texto": "No estás sacando la rapidez de todo el viaje, sino la de un solo tramo: el que va de los 4 s a los 8 s."
        },
        {
          "orden": 2,
          "texto": "El paso 5 divide una resta entre la otra: arriba los metros que avanzó, abajo los segundos que tardó en avanzarlos."
        },
        {
          "orden": 3,
          "texto": "Arriba te quedan 60 m y abajo te quedan 4 s. Falta la división."
        }
      ]
    },
    "escalones": [
      {
        "situacion": "El mismo camión, pero ahora el tramo del arranque: de los 0 s a los 4 s.",
        "expresion": [
          { "tipo": "texto", "valor": "rapidez =" },
          { "tipo": "fraccion", "arriba": "20 m − 0 m", "abajo": "4 s − 0 s" },
          { "tipo": "texto", "valor": "=" },
          { "tipo": "hueco" },
          { "tipo": "texto", "valor": "m/s" }
        ],
        "pregunta": "¿Qué rapidez llevaba en ese tramo?",
        "respuesta": {
          "tecleado": "5",
          "aceptaTambien": ["20/4"],
          "comoSeLee": "cinco metros por segundo"
        },
        "pistas": [
          {
            "orden": 1,
            "texto": "En los primeros 4 s avanzó 20 m. Reparte esos metros entre esos segundos."
          }
        ]
      },
      {
        "situacion": "El tramo donde la línea va horizontal, de los 8 s a los 12 s.",
        "expresion": [
          { "tipo": "texto", "valor": "rapidez =" },
          { "tipo": "fraccion", "arriba": "80 m − 80 m", "abajo": "12 s − 8 s" },
          { "tipo": "texto", "valor": "=" },
          { "tipo": "hueco" },
          { "tipo": "texto", "valor": "m/s" }
        ],
        "pregunta": "¿Qué rapidez llevaba mientras la línea iba horizontal?",
        "respuesta": {
          "tecleado": "0",
          "aceptaTambien": [],
          "comoSeLee": "cero metros por segundo"
        },
        "pistas": [
          {
            "orden": 1,
            "texto": "Lee las dos distancias antes de restar: a los 8 s y a los 12 s el camión está en el mismo metro."
          },
          {
            "orden": 2,
            "texto": "Arriba te queda 0 m. Cero repartido entre 4 s sigue siendo cero, y eso es lo que significa que no se movió."
          }
        ]
      },
      {
        "situacion": "Otro camión, en otra gráfica: a los 3 s llevaba 12 m y a los 9 s llevaba 60 m.",
        "expresion": [
          { "tipo": "texto", "valor": "rapidez =" },
          { "tipo": "fraccion", "arriba": "60 m − 12 m", "abajo": "9 s − 3 s" },
          { "tipo": "texto", "valor": "=" },
          { "tipo": "hueco" },
          { "tipo": "texto", "valor": "m/s" }
        ],
        "pregunta": "¿Qué rapidez llevaba entre esos dos momentos?",
        "respuesta": {
          "tecleado": "8",
          "aceptaTambien": ["48/6"],
          "comoSeLee": "ocho metros por segundo"
        },
        "pistas": [
          {
            "orden": 1,
            "texto": "Primero las dos restas, cada una con su unidad. La división va al final."
          }
        ]
      }
    ]
  },
  "noSePuede": {
    "que": "la gráfica de distancia contra tiempo con el punto que falta a los 12 s, que es donde este tema se juega lo que enseña",
    "porQue": "hoy nada en src/componentes dibuja un plano cartesiano: Expresion sólo acomoda átomos en una fila que se envuelve (src/componentes/Expresion.tsx:136-146) y el único SVG del proyecto es el círculo del cierre (app/cierre.tsx:46-64)",
    "queHagoConEsto": "correr el tema con el plan B mientras no exista Plano.tsx, y construir ese componente leyendo esta misma spec: es el que más temas desbloquea de las cinco clases"
  }
}
```

## Antes de devolver, revísate

1. ¿La clase que elegiste es una de las cinco, y es la que el tema pide de
   verdad? Si no cabía, ¿devolviste `figura: null` en vez de disfrazarla?
2. ¿Hay exactamente un elemento con `falta: true` en toda la figura?
3. ¿La figura está dibujada sobre el ejemplo del canon, con sus números?
4. ¿`leerEnVozAlta` alcanza para contestar sin ver el dibujo?
5. ¿Ningún campo de la figura lleva color, pixel, grosor ni fuente?
6. ¿Toda respuesta tecleada casa con `^[0-9]+(/[0-9]+)?$`, sin unidad adentro?
7. ¿Cada renglón del plan B tiene exactamente un hueco?
8. ¿Ninguna `fraccion` tiene átomos adentro? ¿Ningún `simbolo` va sin `sub` ni
   `sup`? ¿Nada de `"3/5"` en un renglón, nada de guion por menos, nada de `x`
   por `×`?
9. ¿Los escalones son una lista, sin decir «escalón 2 de 4», y las pistas una
   lista con orden y texto, no un número?
10. ¿`noSePuede` viene lleno, con el componente que falta y el archivo que lo
    demuestra?
11. **La lista, campo por campo.** Tacha uno por uno: `figura`, `planB` y
    `noSePuede`. `figura` va en `null` o lleva los cinco: `titulo`, `queSeLee`,
    `leerEnVozAlta`, `datos` y `hueco`; el `hueco` lleva `que`, `donde` y
    `respuestaEnPalabras` (`respuesta` es opcional); los `datos` llevan `clase` más
    lo que esa clase pida, y cada marca, punto, elemento, sustancia o flecha lleva
    su `falta`.
    `planB` es el único pedazo que la app puede correr hoy, y viaja completo:
    `queSobrevive`, `queSePierde`, `datosEnPalabras`, `completar` y `escalones`.
    `completar` lleva `pasoDelCanon`, `expresion`, `respuesta` (con `tecleado`,
    `aceptaTambien` y `comoSeLee`) y `pistas`; cada escalón lleva `situacion`,
    `expresion`, `pregunta`, `respuesta` y `pistas`.
    Lo que se va es el final del plan B, después de haber gastado la atención en la
    figura: `datosEnPalabras`, `comoSeLee` y `aceptaTambien`. El `titulo` de raíz y
    el `orden` de cada pista no van en esta lista: los pone quien llama.
