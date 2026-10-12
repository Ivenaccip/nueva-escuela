# Caso aparte · la respuesta que no son dígitos

**Cuándo se llama:** después del canon, en vez de 03-completar y 04-escalera, cuando
la respuesta del tema no es un entero ni una fracción. El llamador manda el tema aquí
cuando el canon dice `notacion: "lineal"` y `formaDeRespuesta: "palabra"` o
`"expresion"`, o cuando dice `numero` o `fraccion` pero el resultado del ejemplo no
trae ni una cifra (es una frase: el canon se declaró mal, y aquí se atiende lo que el
resultado es de verdad).

**Sistema:** `contenido/prompts/00-sistema.md`
**Esquema:** `contenido/esquema/X3-respuesta-no-numerica.schema.json`
**Entra:** un tema de `contenido/temarios/<materia>.json` y el canon de ese tema.
**Sale:** un teclado para todo el tema, las respuestas de la estación 3 y de los
escalones de la estación 4 escritas con él, el error típico de la estación 3 (si el
teclado deja escribirlo) y `noSePuede`.

**Qué reemplaza:** `completar` y `escalera`. En el archivo del tema esos dos campos
quedan en `null` y esta salida vive en `casosAparte["X3-teclado"]`; la app la lee de
ahí. Las otras cuatro estaciones no se tocan: la 2 ya era de opciones, y la 1, la 5 y
la 6 no tienen hueco.

**Los cuatro teclados existen y se sirven tal cual** (`src/componentes/Teclado.tsx`).
Ya no hay plan B ni aviso de «falta código»: lo que elijas es lo que el estudiante
usa. En este orden se eligen:

| Teclado | Qué es | Qué le pide al estudiante |
|---|---|---|
| `digitos` | `0`–`9`, `/` (la fracción apilada) y borrar | producir un número |
| `fichas` | hasta 15 teclas que define el tema, y borrar | **producir** la respuesta, armándola ficha por ficha |
| `opciones` | el hueco se contesta eligiendo una de 2 a 4 etiquetas | **reconocer** la respuesta entre las que ve |
| `texto` | el teclado del sistema | producir la respuesta escribiéndola entera |

`fichas` tiene tres columnas hasta 11 fichas y cuatro hasta 15 (con borrar, 16
celdas: cuatro filas de cuatro). Borrar quita **una ficha entera**: con `Ca` tocada,
un borrado deja el hueco vacío, no deja `C`.

---

## Mensaje del usuario

Vas a decidir con qué contesta el estudiante en este tema, y a escribir las
respuestas con ese teclado.

El teclado de dígitos sólo escribe `0`–`9` y la diagonal de una fracción. Este tema
tiene una respuesta que necesita otra cosa: una letra, un signo, un paréntesis, un
punto, un término. Tu trabajo es averiguar cuál de los cuatro teclados es el más
simple que sí sirve, y escribir con él el hueco de la estación 3 y los escalones de
la estación 4.

## El tema

- Materia: {{materia}} ({{materiaNombre}})
- Número: {{tema.numero}}
- Título: {{tema.titulo}}
- Familia: {{tema.familia}}
- Grado: {{tema.grado}}
- Al terminar, el estudiante dice: {{tema.quedaSabiendo}}
- Depende de los temas: {{tema.dependeDe}}
- Error típico: {{tema.errorTipico}}
- Los cinco pasos, en borrador: {{tema.losCincoPasos}}
- Notación que pide el tema: {{tema.notacion}}

## El canon del tema

El canon ya está fijado y es ley. No renombras un paso, no cambias los números
del ejemplo, no usas un sinónimo de una palabra del vocabulario, no te sales de
las cotas.

```json
{{canon}}
```

Para lo que vas a escribir, mira sobre todo estos cinco:

- El procedimiento se llama: {{canon.procedimiento.nombre}}
- El ejemplo va de: {{canon.ejemplo.deQueVa}}
- El error se cae en el paso: {{canon.error.pasoQueCorrompe}}
- Y lo que el estudiante cree es: {{canon.error.creenciaDeAtras}}
- Los números que el tema puede usar: {{canon.cotas.numeros}}

La `formaDeRespuesta` del canon es una guía, no una orden: si dice `numero` y
`ejemplo.resultado` es una frase, la respuesta de este tema es un término y se
contesta con `opciones` o con `texto`. Manda lo que el resultado es.

No recibes nada de las otras estaciones. Nadie te pasa lo que escribieron la 2,
la 5 ni la 6, y no hay manera de pedirlo: el canon es lo único que ustedes
comparten. Tampoco supongas qué hueco eligió 03-completar, porque tu salida
ocupa su lugar.

## Cómo se elige el teclado

Se prueban en este orden y se para en el primero que sirva: **`digitos` → `fichas` →
`opciones` → `texto`**. El de más arriba que funcione es el bueno, aunque el de
abajo se te antoje más.

1. **`digitos`** si la respuesta es un entero o una fracción y nada más:
   `^[0-9]+(/[0-9]+)?$`. Antes de descartarlo, intenta una vez reformular la
   pregunta para que quepa: pedir el numerador en vez del resultado, pedir
   cuántos electrones en vez del nombre del ion, pedir `8/10` en vez de `0.8`.
   Si la reformulación sigue enseñando lo mismo que el tema enseña, sal con
   `digitos` y dilo en `porQueEseTeclado`: es el teclado más simple y no hay juego
   de fichas que cuadrar. Si la reformulación cambia lo que se enseña, no.
2. **`fichas`** si la respuesta se **arma** juntando piezas cortas de un
   conjunto que el propio tema define: una fórmula (`CaCl2`), una carga (`2+`),
   una configuración (`2,8,1`), un número de grupo (`VIIA`), un término con
   letra (`7a`), un decimal (`0.8`), un negativo (`−25`), una coordenada
   (`(3,2)`), una comparación (`<`).
3. **`opciones`** si la respuesta es **una sola** pieza de un conjunto cerrado
   de dos a cuatro: un signo de comparación, un par que se confunde
   (mitosis / meiosis, catión / anión, soluto / disolvente), un veredicto
   (flota / se hunde), un nombre entre pocos candidatos.
4. **`texto`** sólo si el conjunto no se puede cerrar: el nombre de un compuesto
   que se produce, no se reconoce; una palabra del vocabulario que puesta en una
   lista de cuatro se contesta por eliminación.

Por qué ese orden y no otro, y qué mide cada uno:

- `digitos` no necesita juego de fichas que mantener.
- **`fichas` obliga a PRODUCIR**: el estudiante arma la respuesta con piezas
  que no se la dan hecha. Sólo le acota las teclas.
- **`opciones` deja que RECONOZCA**: la respuesta está a la vista, así que el
  ejercicio pasa de producir a reconocer y se vuelve más fácil de lo que el tema
  quería. Si el tema enseña a escribir la fórmula o a armar el genotipo, bajar a
  `opciones` lo vacía. Si el tema enseña a distinguir dos cosas que se confunden,
  `opciones` es justo eso.
- `texto` deja que la ortografía se meta a calificar: quien entendió y escribió
  «meyosis» sale reprobado por algo que el tema no enseña.

Un solo teclado para todo el tema. La app lo arma una vez y no lo cambia entre
la estación 3 y la 4. Si el hueco de la 3 pide una fórmula y un escalón de la 4
pide «flota o se hunde», cambia el escalón, no el teclado.

En `tecladosDescartados` escribes los que quedaron arriba del elegido, con el
motivo. Si no elegiste `digitos`, `digitos` va ahí a fuerza, y su motivo nombra
el carácter que falta.

### Qué teclado suele tocarle a cada familia

Una guía, no una orden: si el canon de este tema dice otra cosa, manda el canon.

| Materia | Familias | Teclado que suele salir |
|---|---|---|
| Matemáticas | números, fracciones, proporción, potencias, medida, triángulos, datos, azar, geometría | `digitos` |
| Matemáticas | decimales, enteros | `fichas` con `.` o con `−` |
| Matemáticas | álgebra, ecuaciones con letra en la respuesta | `fichas` con `x`, `y`, `+`, `−`, paréntesis |
| Química | átomo (contar partículas), mezclas y materia con número, reacciones (coeficientes), pH | `digitos` |
| Química | tabla periódica, enlaces, nomenclatura de fórmulas, iones, números de oxidación | `fichas` con símbolos y subíndices |
| Química | materia y mezclas de clasificar, metal o no metal, ácido o base | `opciones` |
| Biología | herencia (genotipos `AA`, `Aa`, `XY`) | `fichas` con `A`, `a`, `X`, `Y` |
| Biología | casi todo lo demás | `opciones`, y `digitos` donde hay cuenta |
| Biología | nombrar una especie con clave dicotómica | `texto` |
| Física | materia, movimiento, fuerzas, energía, calor, electricidad | `digitos`, o `fichas` cuando la respuesta trae punto o signo |
| Física | magnetismo, sonido, luz | `opciones` |

## Las reglas de las fichas

- **La ficha escribe exactamente lo que trae pintado.** No hay ficha que pinte
  una cosa y escriba otra. Si el estudiante toca `Ca` y en el hueco aparece algo
  distinto, deja de confiar en el teclado y ya no está pensando en el tema.
- **De 3 a 15.** Con 11 o menos son tres columnas (con borrar, 12 teclas); con 12 a
  15, cuatro columnas. Más de 15 no caben: eso es `noSePuede`.
- **De 1 a 4 caracteres pintados, sin espacios.** La tecla mide unos 110 de ancho
  con tres columnas y unos 80 con cuatro. `(OH)` cabe; `óxido de` no. El menos es
  `−` (U+2212), no un guion.
- **Un número se arma con fichas de DÍGITOS, nunca con el número hecho.** Si una
  respuesta, un escalón o el error típico lleva cifras, las fichas son `0`–`9` (las
  que hagan falta) más los signos del tema. Una ficha `40` o `10` no sirve: el
  estudiante no podría escribir `20`, `400` ni el error típico, y la estación se
  resuelve tocando la ficha que ya trae el número. Con diez dígitos, el punto y el
  menos son doce fichas; si además hacen falta signos, son cuatro columnas.
- **Ninguna ficha repetida.** Con `C` y `Ca` a la vez no hay problema: son dos
  fichas distintas aunque una sea el comienzo de la otra.
- **Las mismas fichas sirven a la estación 3 y a todos los escalones.** Elige
  los elementos, las letras y los dígitos de forma que las respuestas se armen
  con ese solo juego. Si un escalón necesita una ficha más de las quince, cambia
  el escalón.
- **Cada `correcta`, cada `aceptaTambien` y el error típico se arman con las
  fichas.** Quien llama lo comprueba ficha por ficha, y una respuesta con una ficha
  que no existe se te devuelve a corregir. Antes de devolver, arma cada una con el
  dedo.
- **El error típico del canon tiene que poderse escribir.** Es la regla que más
  se olvida. Si las fichas sólo alcanzan para escribir la respuesta correcta, el
  estudiante la arma a puros golpes de dedo y la estación deja de medir nada. En
  el tema de cruzar valencias eso significa que la ficha `1` y las fichas `+` y
  `−` tienen que estar, aunque la respuesta correcta no las use: sin ellas nadie
  puede escribir `Ca1Cl2` ni `Ca−1Cl+2`, que es justo lo que el estudiante
  escribe cuando no entendió.
- **Y el error tiene que quedar a un toque de distancia de lo correcto.** Un
  juego de tres fichas donde sólo hay un orden posible es una respuesta regalada.
- **Nada de unidades en las fichas.** La unidad va en el renglón o en la
  pregunta; al hueco entra sólo el valor.
- **El punto y el menos sólo si las cotas del canon los piden.** Si `cotas.numeros`
  dice «enteros del 1 al 12, sin decimales», la ficha `.` no existe.
- **`correcta` mide hasta 24 caracteres**, que es lo que deja escribir la app.

## Cómo se escribe la respuesta

Cada hueco lleva tres cosas que no son lo mismo:

- `correcta`: lo que tiene que quedar **escrito** en el hueco, tal cual, y lo
  único que la app compara. Con `fichas` es la unión de etiquetas, sin espacios:
  `CaCl2`, `2+`, `2,8,1`. Con `opciones`, la etiqueta de la opción correcta, letra
  por letra. Con `texto`, la palabra que se espera. Es plana, porque el hueco
  guarda una cadena.
- `enAtomos`: la misma respuesta escrita **de verdad**, con los cuatro átomos.
  `CaCl2` es `[{"tipo":"texto","valor":"Ca"},{"tipo":"simbolo","valor":"Cl","sub":"2"}]`.
  De aquí sale la fórmula bien puesta cuando la pantalla la muestra ya contestada,
  y de aquí la dicta el lector de pantalla. Nunca lleva hueco adentro. **Aplanada
  —`valor`, luego `sub`, luego `sup`, sin espacios— tiene que dar `correcta`**: lo
  que se pinta es lo que se tecleó.
- `comoSeLee`: la respuesta dicha en voz alta, «ce a, ce ele con dos abajo». No
  es la explicación de la respuesta, es su nombre dicho.

`aceptaTambien` es para otras formas de escribir **la misma** respuesta, no para
otra respuesta, y cada una se tiene que poder escribir con el teclado elegido. Nunca
metas ahí el error típico ni la etiqueta de una opción equivocada.

### `siTecleaElError`: lo que se le dice a quien cae en el error típico

Opcional, y sólo en la estación 3. Cuando el estudiante deja en el hueco **justo**
lo que escribiría quien cae en el error típico del canon, la app le contesta con
`queSeLeDice` en vez del «todavía no» de siempre. Es lo más caro de perder: el
momento en que el error se nombra.

- `tecleado` es ese valor, armado con el teclado (con `fichas`, con tus fichas), y
  distinto de `correcta` y de cada `aceptaTambien`.
- `queSeLeDice` nombra la creencia de atrás, no a la persona; lo devuelve al paso
  del canon; no regaña y no da la respuesta. De 30 a 400 caracteres.
- **Omítelo** (o `null`) cuando el error típico no produce un valor que se pueda
  escribir en este hueco: porque cae en otro paso, o porque es un decimal con
  `digitos`.
- Con `opciones` no hace falta: elegir una opción equivocada ya muestra su
  `queRevela`.

### Con `opciones`

- De 2 a 4, **una sola** `esCorrecta`, y su etiqueta es igual a `correcta`.
- Cada equivocada trae su `queRevela`: qué cree el estudiante que la eligió, dicho
  sin regañar. Una de ellas sale de `canon.error.creenciaDeAtras`. Es lo que la app
  le contesta al elegirla.
- Las etiquetas son texto plano de un renglón y distintas entre sí. La app las
  baraja: ninguna etiqueta ni `queRevela` cita una letra ni una posición.
- Si la respuesta es una fórmula, mejor `fichas`: una opción se ve plana
  («CaCl2»), sin subíndices, hasta que el estudiante acierta.

### Con `texto`

- `comoSeCompara` dice qué se perdona. Normalmente los tres en `true`
  (`ignoraMayusculas`, `ignoraAcentos`, `ignoraEspaciosDeMas`): si no, la app
  califica ortografía.
- **En química `ignoraMayusculas` va en `false`**, incluso con `texto`: `Co` es
  cobalto y `CO` es monóxido de carbono.
- La respuesta es una palabra o dos. `aceptaTambien` recoge el plural o el
  sinónimo del vocabulario del canon, nunca el error típico.

Con `digitos`, `fichas` y `opciones` la comparación es exacta y `comoSeCompara` va
con los tres en `false`: el teclado sólo puede escribir lo que trae pintado.

## El hueco y los escalones

- Un solo hueco por renglón. Con dos, la pantalla escribe lo tecleado en los
  dos a la vez y el ejercicio deja de tener sentido.
- El hueco de la estación 3 vive en uno de los cinco pasos del canon, y dices en
  cuál en `pasoDelCanon`.
- Los escalones son una lista, de tres a cinco. No dicen «escalón 3 de 5»: la
  app deriva eso. Suben de dificultad sin salirse de las cotas, y cada uno tiene
  su situación de la vida real. Si el tema no tiene un caso real que conozcas de
  verdad, escribe una situación de salón antes que inventar un dato.
- Las pistas son dos o tres, con su orden: la 1 reencuadra sin dar dato, la 2
  nombra la acción del procedimiento donde está la respuesta (no el número del
  paso: el estudiante nunca ve esa lista), la 3 deja un solo movimiento por hacer.
  **Ninguna escribe la respuesta completa**, y la 3 menos que ninguna: si trae
  `correcta` tal cual, se te devuelve a corregir. Cuántas quedan y cuándo se
  sueltan lo pone la app, no tú.

- **Cada escalón lleva sus `pistas`, siempre** (dos o tres, como en la estación 3).
  Es lo que más se olvida en una salida larga: un escalón sin `pistas` tira la
  llamada entera. Por eso van **antes** de `respuesta` en cada objeto (el orden de
  los campos del esquema ya es ése): escríbelas en ese orden y deja `respuesta`,
  que es lo más largo, para el final de cada objeto.

## Prohibiciones de este caso

- Nada de campos de estado: ni cuántas pistas quedan, ni en qué escalón va, ni
  qué trae escrito el campo. Eso lo pone la app.
- Nada de `faltaCodigo` ni de `planB`: ya no existen.
- Nada de `"3/5"` escrito en un renglón: eso es una `fraccion`. Dentro del hueco
  sí, porque el hueco guarda una cadena, pero sólo se pinta apilada cuando la
  respuesta entera es `a/b` con dígitos: `3/5×2` queda en una línea.
- Nada de guion por menos (`−` es U+2212), nada de `x` ni `*` por `×`.
- Ningún `simbolo` sin `sub` ni `sup`: eso es `texto`.
- Ninguna `fraccion` con átomos adentro: `arriba` y `abajo` son una cadena.
- Ninguna unidad dentro del hueco.
- Ninguna ficha repetida, ninguna con espacio, ninguna de más de 4 caracteres.
- Ningunas dos opciones que se distingan sólo por un acento o por el plural.
- Ninguna opción visiblemente más larga que las otras: se elige por larga,
  no por cierta.
- Nada de `texto` por comodidad. Si existe un conjunto cerrado de cuatro, es
  `opciones`; si la respuesta se arma por piezas, es `fichas`.

## Cuándo llenas `noSePuede`

`null` cuando alguno de los cuatro teclados alcanza, que es lo normal. **Elegir
`fichas`, `opciones` o `texto` no lo llena**: los cuatro se sirven. Se llena sólo
ante un límite real:

- la respuesta es un trazo: un punto en un plano, una flecha, un diagrama. No
  hay teclado que dibuje ni opción que lo sustituya, y el tema va a `X2-figura.md`;
- hacen falta más de 15 fichas, o una etiqueta de más de 4 caracteres (los
  nombres largos de nomenclatura caen aquí: «hidróxido de calcio» no es una
  tecla);
- el juego de fichas más chico que sirve deja la respuesta armada de un toque o de
  dos, y el ejercicio no mide nada;
- con `texto` la app acabaría calificando ortografía en vez de lo que el tema
  enseña;
- la respuesta necesita dos huecos a la vez (una `x` y una `y`, un antes y un
  después) y partirla en dos preguntas cambia lo que el tema enseña.

Antes de rendirte, intenta **una** reformulación. Si la reformulación cambia lo
que el tema enseña, entonces sí: `noSePuede`, y en `queHagoConEsto` nombra qué
haría falta. Un tema con `noSePuede` lleno cuesta menos que un hueco que no se
puede llenar: ahí el estudiante se traba y cree que el que está mal es él. Un tema
con `noSePuede` lleno no se publica.

## Un ejemplo completo

Tema 23 de Química, «Fórmula por cruce de valencias», 3º de secundaria, familia
enlaces. Su canon fijó el procedimiento en cinco pasos (1 escribir el metal y
luego el no metal, 2 poner la valencia de cada uno arriba, 3 cruzar los números
hacia abajo como subíndices, 4 quitar los signos y el subíndice 1, 5 simplificar
si los dos subíndices se dividen entre el mismo número), el ejemplo en
Ca²⁺ con Cl⁻ que da CaCl₂, y el error en el paso 4: baja la carga con todo y
signo, o deja el subíndice 1 escrito.

Once fichas, tres columnas. La respuesta se produce, no se reconoce, así que es
`fichas`.

```json
{
  "temaNumero": 23,
  "materia": "quimica",
  "titulo": "Fórmula por cruce de valencias",
  "teclado": "fichas",
  "porQueEseTeclado": "La respuesta es una fórmula: símbolos de elemento y subíndices. El teclado de dígitos no tiene letras, así que CaCl2 no se puede escribir con dígitos y diagonal. Con fichas el estudiante la arma él y no la reconoce entre cuatro, y con once alcanza también para el error típico del canon: dejar el subíndice 1 o bajar el signo de la carga.",
  "tecladosDescartados": [
    {
      "teclado": "digitos",
      "porQue": "No tiene letras. Toda la respuesta de este tema empieza por el símbolo del metal, y sin letras el hueco se queda sin nada que recibir."
    }
  ],
  "fichas": [
    { "etiqueta": "Na", "comoSeLee": "sodio" },
    { "etiqueta": "Ca", "comoSeLee": "calcio" },
    { "etiqueta": "Mg", "comoSeLee": "magnesio" },
    { "etiqueta": "Al", "comoSeLee": "aluminio" },
    { "etiqueta": "Cl", "comoSeLee": "cloro" },
    { "etiqueta": "O", "comoSeLee": "oxígeno" },
    { "etiqueta": "1", "comoSeLee": "uno" },
    { "etiqueta": "2", "comoSeLee": "dos" },
    { "etiqueta": "3", "comoSeLee": "tres" },
    { "etiqueta": "+", "comoSeLee": "más" },
    { "etiqueta": "−", "comoSeLee": "menos" }
  ],
  "comoSeCompara": {
    "ignoraMayusculas": false,
    "ignoraAcentos": false,
    "ignoraEspaciosDeMas": false
  },
  "completar": {
    "pasoDelCanon": 4,
    "expresion": [
      { "tipo": "texto", "valor": "De" },
      { "tipo": "simbolo", "valor": "Ca", "sup": "2+" },
      { "tipo": "texto", "valor": "y" },
      { "tipo": "simbolo", "valor": "Cl", "sup": "−" },
      { "tipo": "texto", "valor": "sale la fórmula" },
      { "tipo": "hueco" }
    ],
    "respuesta": {
      "correcta": "CaCl2",
      "enAtomos": [
        { "tipo": "texto", "valor": "Ca" },
        { "tipo": "simbolo", "valor": "Cl", "sub": "2" }
      ],
      "comoSeLee": "ce a, ce ele con dos abajo",
      "aceptaTambien": [],
      "opciones": []
    },
    "pistas": [
      {
        "orden": 1,
        "texto": "El calcio trae 2 y el cloro trae 1. Los subíndices salen de esos dos números cruzados, no de cuántos átomos te imaginas."
      },
      {
        "orden": 2,
        "texto": "Ya cruzaste los números: ahora toca limpiar lo que bajó. El signo se queda arriba, nunca baja con el número."
      },
      {
        "orden": 3,
        "texto": "El 1 del cloro baja al calcio, y un subíndice 1 no se escribe. El 2 del calcio baja al cloro y ese sí se escribe."
      }
    ],
    "siTecleaElError": {
      "tecleado": "Ca1Cl2",
      "queSeLeDice": "Cruzaste bien los números. Falta el último movimiento: un subíndice 1 no se escribe, porque un símbolo solo ya cuenta un átomo."
    }
  },
  "escalera": [
    {
      "situacion": "La sal que tienes en la mesa de tu casa es cloruro de sodio, y su fórmula sale del mismo cruce.",
      "expresion": [
        { "tipo": "texto", "valor": "De" },
        { "tipo": "simbolo", "valor": "Na", "sup": "+" },
        { "tipo": "texto", "valor": "y" },
        { "tipo": "simbolo", "valor": "Cl", "sup": "−" },
        { "tipo": "texto", "valor": "sale" },
        { "tipo": "hueco" }
      ],
      "pregunta": "¿Cómo queda escrita la fórmula del cloruro de sodio?",
      "respuesta": {
        "correcta": "NaCl",
        "enAtomos": [{ "tipo": "texto", "valor": "NaCl" }],
        "comoSeLee": "ene a, ce ele, sin nada abajo",
        "aceptaTambien": [],
        "opciones": []
      },
      "pistas": [
        {
          "orden": 1,
          "texto": "Las dos cargas valen 1. Cruza igual que siempre y fíjate en qué queda abajo de cada símbolo."
        },
        {
          "orden": 2,
          "texto": "Un subíndice 1 no se escribe. Los dos símbolos se quedan pegados y sin número."
        }
      ]
    },
    {
      "situacion": "En la farmacia venden cloruro de magnesio en polvo, en bolsitas.",
      "expresion": [
        { "tipo": "texto", "valor": "De" },
        { "tipo": "simbolo", "valor": "Mg", "sup": "2+" },
        { "tipo": "texto", "valor": "y" },
        { "tipo": "simbolo", "valor": "Cl", "sup": "−" },
        { "tipo": "texto", "valor": "sale" },
        { "tipo": "hueco" }
      ],
      "pregunta": "¿Cómo queda escrita la fórmula del cloruro de magnesio?",
      "respuesta": {
        "correcta": "MgCl2",
        "enAtomos": [
          { "tipo": "texto", "valor": "Mg" },
          { "tipo": "simbolo", "valor": "Cl", "sub": "2" }
        ],
        "comoSeLee": "eme ge, ce ele con dos abajo",
        "aceptaTambien": [],
        "opciones": []
      },
      "pistas": [
        {
          "orden": 1,
          "texto": "El magnesio está en el mismo grupo que el calcio, así que trae el mismo número de carga."
        },
        {
          "orden": 2,
          "texto": "El 2 del magnesio baja al cloro, y el 1 del cloro se pierde al no escribirse."
        }
      ]
    },
    {
      "situacion": "La capa gris que protege una olla de aluminio por fuera es óxido de aluminio.",
      "expresion": [
        { "tipo": "texto", "valor": "De" },
        { "tipo": "simbolo", "valor": "Al", "sup": "3+" },
        { "tipo": "texto", "valor": "y" },
        { "tipo": "simbolo", "valor": "O", "sup": "2−" },
        { "tipo": "texto", "valor": "sale" },
        { "tipo": "hueco" }
      ],
      "pregunta": "¿Cómo queda escrita la fórmula del óxido de aluminio?",
      "respuesta": {
        "correcta": "Al2O3",
        "enAtomos": [
          { "tipo": "simbolo", "valor": "Al", "sub": "2" },
          { "tipo": "simbolo", "valor": "O", "sub": "3" }
        ],
        "comoSeLee": "a ele con dos abajo, o con tres abajo",
        "aceptaTambien": [],
        "opciones": []
      },
      "pistas": [
        {
          "orden": 1,
          "texto": "Aquí ninguno de los dos números es 1, así que los dos subíndices se van a escribir."
        },
        {
          "orden": 2,
          "texto": "Antes de escribir, mira si los dos subíndices se dividen entre el mismo número: 2 y 3 no, así que se quedan como salieron."
        }
      ]
    },
    {
      "situacion": "Un antiácido de farmacia trae óxido de magnesio para bajarle la acidez al estómago.",
      "expresion": [
        { "tipo": "texto", "valor": "De" },
        { "tipo": "simbolo", "valor": "Mg", "sup": "2+" },
        { "tipo": "texto", "valor": "y" },
        { "tipo": "simbolo", "valor": "O", "sup": "2−" },
        { "tipo": "texto", "valor": "sale" },
        { "tipo": "hueco" }
      ],
      "pregunta": "¿Cómo queda escrita la fórmula del óxido de magnesio?",
      "respuesta": {
        "correcta": "MgO",
        "enAtomos": [{ "tipo": "texto", "valor": "MgO" }],
        "comoSeLee": "eme ge, o, sin nada abajo",
        "aceptaTambien": [],
        "opciones": []
      },
      "pistas": [
        {
          "orden": 1,
          "texto": "Cruza primero y no te detengas ahí: mira los dos subíndices que te quedaron y pregúntate si se pueden dividir."
        },
        {
          "orden": 2,
          "texto": "Los dos subíndices salieron 2, y 2 entre 2 es 1, y el 1 no se escribe."
        }
      ]
    }
  ],
  "noSePuede": null
}
```

Fíjate en cuatro cosas del ejemplo. Las fichas `1`, `+` y `−` no aparecen en
ninguna respuesta correcta, y están: sin ellas el error típico (`Ca1Cl2`, que es
el `siTecleaElError`) no se puede escribir. Las cinco respuestas se arman con el
mismo juego de once, aunque cada una use elementos distintos. `enAtomos`, aplanado,
da lo mismo que `correcta` en las cinco. Y los escalones suben por una sola razón
cada vez: sin subíndice, un subíndice, dos subíndices, y hay que simplificar.

### Qué cambia con `opciones` y con `texto`

Sólo cambia el teclado y lo que va dentro de `respuesta`. Lo demás (el hueco, las
pistas, los escalones, `noSePuede: null`) es igual. Con `opciones`, `fichas` va
vacío y `comoSeCompara` en `false`:

```json
{
  "teclado": "opciones",
  "fichas": [],
  "respuesta": {
    "correcta": "mitosis",
    "enAtomos": [{ "tipo": "texto", "valor": "mitosis" }],
    "comoSeLee": "mitosis",
    "aceptaTambien": [],
    "opciones": [
      {
        "etiqueta": "mitosis",
        "esCorrecta": true,
        "queRevela": "Notaste que las dos células hijas salen iguales a la madre y con el mismo número de cromosomas."
      },
      {
        "etiqueta": "meiosis",
        "esCorrecta": false,
        "queRevela": "Crees que toda división de una célula parte los cromosomas a la mitad, y eso sólo pasa cuando se hacen gametos."
      }
    ]
  }
}
```

Con `texto`, `fichas` y `opciones` van vacíos y `comoSeCompara` decide qué se perdona:

```json
{
  "teclado": "texto",
  "fichas": [],
  "comoSeCompara": {
    "ignoraMayusculas": true,
    "ignoraAcentos": true,
    "ignoraEspaciosDeMas": true
  },
  "respuesta": {
    "correcta": "mitocondria",
    "enAtomos": [{ "tipo": "texto", "valor": "mitocondria" }],
    "comoSeLee": "mitocondria",
    "aceptaTambien": ["mitocondrias"],
    "opciones": []
  }
}
```

Son fragmentos para ver la forma, no salidas completas: la tuya lleva todos los
campos.

## Antes de devolver, revísate

1. ¿Elegiste el primer teclado del orden `digitos` → `fichas` → `opciones` → `texto`
   que sirve, y probaste antes reformular para quedarte en `digitos`?
2. ¿Si pediste `opciones`, de verdad lo que el tema enseña es reconocer? ¿Y si
   enseña a producir, no debió ser `fichas`?
3. ¿`tecladosDescartados` trae `digitos` con su motivo, si no lo elegiste?
4. ¿`fichas` tiene de 3 a 15 cuando el teclado es `fichas`, sin repetidas, y está
   vacío en los otros tres casos?
5. ¿Cada `correcta` y cada `aceptaTambien` se arma juntando etiquetas que sí existen
   en `fichas`, sin sobrar ni faltar un carácter? Arma cada una con el dedo.
6. ¿Con las fichas que pusiste se puede escribir el error típico del canon, y es
   ése el `siTecleaElError.tecleado` (distinto de `correcta`)? ¿O lo omitiste porque
   no se puede escribir en ese hueco?
7. ¿`opciones` está vacío salvo con teclado `opciones`, y ahí trae de 2 a 4 con
   una sola `esCorrecta` en `true` y con la etiqueta igual a `correcta`?
8. ¿Con `texto`, `comoSeCompara` perdona lo que debe, y en química
   `ignoraMayusculas` sigue en `false`?
9. ¿Cada `expresion` tiene exactamente un hueco?
10. ¿Cada átomo lleva su `tipo` y su `valor` completos, sin abreviar?
11. ¿`enAtomos` aplanado da `correcta`? ¿Ningún `simbolo` va sin `sub` ni `sup`?
    ¿Ninguna `fraccion` con átomos adentro? ¿Ningún `"3/5"` en un renglón?
12. ¿Los escalones son de tres a cinco, sin salirse de las cotas y sin pedir una
    ficha que no esté en el juego?
13. ¿La tercera pista de cada hueco deja un movimiento por hacer sin escribir
    `correcta`? ¿Cero campos de estado, cero `faltaCodigo` y cero `planB`, y
    `noSePuede` presente aunque vaya en `null`?
14. **La lista, campo por campo.** Es la llamada con más campos en la raíz.
    Tacha uno por uno: `teclado`, `porQueEseTeclado`, `tecladosDescartados`,
    `fichas`, `comoSeCompara`, `completar`, `escalera` y `noSePuede`. Adentro:
    - cada `tecladosDescartados` lleva `teclado` y `porQue`; cada ficha, `etiqueta`
      y `comoSeLee`. `fichas` va vacío cuando el teclado no es `fichas`, pero viaja.
    - `completar` lleva `pasoDelCanon`, `expresion`, `respuesta` y `pistas` (y, si
      aplica, `siTecleaElError` con `tecleado` y `queSeLeDice`); y cada
      `respuesta`, los cinco: `correcta`, `enAtomos`, `comoSeLee`, `aceptaTambien` y
      `opciones` (cada opción con `etiqueta`, `esCorrecta` y `queRevela`).
    - cada escalón de `escalera` lleva `situacion`, `expresion`, `pregunta`,
      `respuesta` (los mismos cinco) y `pistas`.
    Lo que se va es el final de cada `respuesta`: `enAtomos`, `comoSeLee` y
    `aceptaTambien` son cortos y vienen después de lo largo. El `titulo`, los tres
    booleanos de `comoSeCompara` cuando el teclado no es `texto`, y el `orden` de
    cada pista no van en esta lista: los pone quien llama.
