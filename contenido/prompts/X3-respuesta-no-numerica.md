# Caso aparte · la respuesta que el teclado no puede escribir

**Cuándo se llama:** después del canon, en vez de 03-completar y 04-escalera,
cuando la respuesta del tema no es un número que quepa en el teclado de hoy.
El llamador manda el tema aquí cuando el canon dice
`formaDeRespuesta: "palabra"` o `"trazo"`, o cuando dice `numero` pero la
notación del tema necesita un carácter que las doce teclas no tienen: una
letra, un signo (`+`, `−`, `<`, `>`, `=`), un paréntesis, una coma o un punto.

**Sistema:** `contenido/prompts/00-sistema.md`
**Esquema:** `contenido/esquema/X3-respuesta-no-numerica.schema.json`
**Entra:** un tema de `contenido/temarios/<materia>.json` y el canon de ese tema.
**Sale:** un teclado para todo el tema, las respuestas de la estación 3 y de los
escalones de la estación 4 escritas con él, `faltaCodigo`, el `planB` con el
teclado de dígitos, y `noSePuede`.

**Qué reemplaza:** `expresion`, `respuesta` y `pistas` de 03-completar y de cada
escalón de 04-escalera. Las otras cuatro estaciones no se tocan: la 2 ya era de
opciones, la 1, la 5 y la 6 no tienen hueco.

**Los cuatro teclados, y lo que cuesta cada uno.** En este orden se eligen:

| Teclado | Qué es | Qué cuesta |
|---|---|---|
| `digitos` | las doce teclas de hoy: `1`–`9`, `0`, `/`, borrar | nada, ya existe (`app/estacion/completar.tsx:22-28`) |
| `fichas` | las mismas teclas con otras etiquetas, las del tema | que `FILAS` salga del contenido en vez de ser constante |
| `opciones` | el hueco se vuelve una elección de 2 a 4 etiquetas | una fila de opciones donde va el teclado |
| `texto` | el teclado del sistema | un `TextInput` en la 3 (la 4 ya tiene uno, `app/estacion/escalera.tsx:86`) |

`fichas` es el hallazgo del caso: el diseño del teclado no cambia. Once fichas
más borrar son doce teclas, las mismas cuatro filas de tres que ya están
dibujadas. Lo único que cambia es de dónde sale la cadena que va pintada.

**Tres de los cuatro teclados no existen todavía.** Sólo `digitos` corre con el
código de hoy: `FILAS` es una constante en `app/estacion/completar.tsx:23-28`, no
hay fila de opciones y no hay `TextInput` en la estación 3. Por eso este prompt
devuelve dos cosas más que los otros:

- `faltaCodigo` en `true` y `noSePuede` **lleno**, nombrando el teclado que falta,
  siempre que el teclado elegido no sea `digitos`. Así el llamador filtra por
  `noSePuede !== null` y no publica un tema donde el estudiante vería el teclado de
  dígitos y una respuesta que necesita letras: ahí se traba para siempre, que es
  justo el daño que este proyecto quiere evitar.
- `planB`: la versión con `digitos` del hueco de la 3 y de los escalones de la 4,
  aunque pida menos, para que el tema pueda correr hoy. Es lo mismo que hace
  `X2-figura.md` con su plan B lineal.

---

## Mensaje del usuario

Vas a decidir con qué contesta el estudiante en este tema, y a escribir las
respuestas con ese teclado.

El teclado de la app tiene doce teclas: `1`–`9`, `0`, `/` y borrar. No hay
letras, no hay signo menos, no hay punto, no hay paréntesis, no hay coma. Este
tema no cabe ahí, o alguien cree que no cabe: tu trabajo es averiguar cuál de
los cuatro teclados es el más barato que sí sirve, y escribir con él el hueco de
la estación 3 y los escalones de la estación 4.

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

Para lo que vas a escribir, mira sobre todo estos cuatro:

- El procedimiento se llama: {{canon.procedimiento.nombre}}
- El ejemplo va de: {{canon.ejemplo.deQueVa}}
- El error se cae en el paso: {{canon.error.pasoQueCorrompe}}
- Y lo que el estudiante cree es: {{canon.error.creenciaDeAtras}}
- Los números que el tema puede usar: {{canon.cotas.numeros}}

No recibes nada de las otras estaciones. Nadie te pasa lo que escribieron la 2,
la 5 ni la 6, y no hay manera de pedirlo: el canon es lo único que ustedes
comparten. Tampoco supongas qué hueco eligió 03-completar, porque tu salida
ocupa su lugar.

## Cómo se elige el teclado

Se prueban en este orden y se para en el primero que sirva. El de más arriba que
funcione es el bueno, aunque el de abajo se te antoje más.

1. **`digitos`** si la respuesta es un entero o una fracción y nada más:
   `^[0-9]+(/[0-9]+)?$`. Antes de descartarlo, intenta una vez reformular la
   pregunta para que quepa: pedir el numerador en vez del resultado, pedir
   cuántos electrones en vez del nombre del ion, pedir `8/10` en vez de `0.8`.
   Si la reformulación sigue enseñando lo mismo que el tema enseña, sal con
   `digitos` y dilo en `porQueEseTeclado`. Es la mejor salida posible: cuesta
   cero y este caso aparte no hacía falta.
2. **`fichas`** si la respuesta se **arma** juntando piezas cortas de un
   conjunto que el propio tema define: una fórmula (`CaCl2`), una carga (`2+`),
   una configuración (`2,8,1`), un número de grupo (`VIIA`), un término con
   letra (`7a`), un decimal (`0.8`), un negativo (`−25`), una coordenada
   (`(3,2)`).
3. **`opciones`** si la respuesta es **una sola** pieza de un conjunto cerrado
   de dos a cuatro: un signo de comparación, un par que se confunde
   (mitosis / meiosis, catión / anión, soluto / disolvente), un veredicto
   (flota / se hunde), un nombre entre pocos candidatos.
4. **`texto`** sólo si el conjunto no se puede cerrar: el nombre de un compuesto
   que se produce, no se reconoce; una palabra del vocabulario que puesta en una
   lista de cuatro se contesta por eliminación.

Por qué ese orden y no otro: `digitos` no cuesta código. `fichas` sigue pidiendo
que el estudiante **produzca** la respuesta, sólo le acota las teclas.
`opciones` deja la respuesta a la vista, así que el ejercicio pasa de producir a
reconocer y se vuelve más fácil de lo que el tema quería. `texto` deja que la
ortografía se meta a calificar: quien entendió y escribió «meyosis» sale
reprobado por algo que el tema no enseña.

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
- **De 3 a 11, contando todo.** Con borrar son doce teclas: las cuatro filas de
  tres que ya existen. Doce fichas no caben.
- **Hasta 4 caracteres pintados.** La tecla mide alrededor de 110 de ancho con
  letra de 22. `(OH)` cabe; `óxido de` no.
- **Las mismas fichas sirven a la estación 3 y a todos los escalones.** Elige
  los elementos, las letras y los dígitos de forma que las cinco respuestas se
  armen con ese solo juego. Si un escalón necesita una ficha más de las once,
  cambia el escalón.
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

## Cómo se escribe la respuesta

Cada hueco lleva tres cosas que no son lo mismo:

- `correcta`: lo que tiene que quedar **escrito** en el hueco, tal cual, y lo
  único que la app compara. Con `fichas` es la unión de etiquetas, sin espacios:
  `CaCl2`, `2+`, `2,8,1`. Es plana, porque el hueco guarda una cadena.
- `enAtomos`: la misma respuesta escrita **de verdad**, con los cuatro átomos.
  `CaCl2` es `[{"tipo":"texto","valor":"Ca"},{"tipo":"simbolo","valor":"Cl","sub":"2"}]`. De aquí sale la fórmula
  bien puesta cuando la pantalla la muestra ya contestada, y de aquí la dicta el
  lector de pantalla. Nunca lleva hueco adentro.
- `comoSeLee`: la respuesta dicha en voz alta, «ce a, ce ele con dos abajo». No
  es la explicación de la respuesta, es su nombre dicho.

`aceptaTambien` es para otras formas de escribir **la misma** respuesta, no para
otra respuesta. Nunca metas ahí el error típico.

Con `texto`, `comoSeCompara` casi siempre va con los tres en `true`: si no, la
app califica acentos. Con `digitos`, `fichas` y `opciones` va con los tres en
`false`, porque el teclado sólo puede escribir lo que trae pintado. En química
`ignoraMayusculas` se queda en `false` incluso con `texto`: `Co` es cobalto y
`CO` es monóxido de carbono.

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
  nombra el paso del canon donde está la respuesta, la 3 deja un solo movimiento
  por hacer. Ninguna escribe la respuesta completa. Cuántas quedan y cuándo se
  sueltan lo pone la app, no tú.

## Prohibiciones de este caso

- Nada de campos de estado: ni cuántas pistas quedan, ni en qué escalón va, ni
  qué trae escrito el campo. Eso lo pone la app.
- Nada de `"3/5"` escrito en un renglón: eso es una `fraccion`. Dentro del hueco
  sí, porque el hueco guarda una cadena y el teclado tiene diagonal.
- Nada de guion por menos (`−` es U+2212), nada de `x` ni `*` por `×`.
- Ningún `simbolo` sin `sub` ni `sup`: eso es `texto`.
- Ninguna `fraccion` con átomos adentro: `arriba` y `abajo` son una cadena.
- Ninguna unidad dentro del hueco.
- Ninguna ficha repetida, ninguna con espacio, ninguna de más de 4 caracteres.
- Ningunas dos opciones que se distingan sólo por un acento o por el plural.
- Ninguna opción visiblemente más larga que las otras tres: se elige por larga,
  no por cierta.
- Nada de `texto` por comodidad. Si existe un conjunto cerrado de cuatro, es
  `opciones`; si la respuesta se arma por piezas, es `fichas`.

## `faltaCodigo` y el plan B

`faltaCodigo` es `true` cuando el teclado que elegiste no es `digitos`, sin
excepción: los otros tres piden código que hoy no existe. Y cuando va en `true`,
`noSePuede` va **lleno**, con el teclado que falta nombrado en `porQue` y en
`queHagoConEsto`. No es un juicio sobre tu decisión: es la señal con la que el
llamador decide si este tema se publica hoy o espera.

`planB` viaja siempre, incluso con `digitos` (ahí describe que el plan B es la
versión buena). Lleva tres cosas:

- `sirveHoy`: `true` cuando la versión de abajo se puede servir con el código de
  hoy sin que nadie se trabe. `false` cuando no hay manera de pedir un número sin
  dejar de enseñar el tema; entonces el tema no se publica hasta que el teclado
  exista, y eso está bien dicho así.
- `comoQuedaria`: qué se le pregunta en la estación 3 y en los escalones de la 4
  si la respuesta tiene que ser un número. El subíndice en vez de la fórmula
  completa, el número de átomos en vez del nombre, el número que se compara en vez
  de la palabra. Concreto, con el hueco nombrado.
- `queSePierde`: qué deja de medir el plan B. Sin suavizar: es lo que se recupera
  el día que el teclado se escriba.

## Cuándo llenas `noSePuede`

`null` **sólo si el teclado elegido es `digitos`**. Con `fichas`, `opciones` o
`texto` va lleno, siempre, porque ese teclado no existe. Además lo llenas cuando:

- la respuesta es un trazo: un punto en un plano, una flecha, un diagrama. No
  hay teclado que dibuje, y el tema va a `X2-figura.md`;
- hacen falta más de 11 fichas, o una etiqueta de más de 4 caracteres (los
  nombres largos de nomenclatura caen aquí: «hidróxido de calcio» no es una
  tecla);
- el juego de fichas más chico que sirve deja la respuesta armada sola;
- con `texto` la app acabaría calificando ortografía en vez de lo que el tema
  enseña;
- la respuesta necesita dos huecos a la vez (una `x` y una `y`, un antes y un
  después) y partirla en dos preguntas cambia lo que el tema enseña.

Antes de rendirte, intenta **una** reformulación. Si la reformulación cambia lo
que el tema enseña, entonces sí: `noSePuede`, y en `queHagoConEsto` nombra el
teclado que haría falta. Un tema con `noSePuede` lleno cuesta menos que un hueco
que no se puede llenar: ahí el estudiante se traba y cree que el que está mal es
él.

## Un ejemplo completo

Tema 23 de Química, «Fórmula por cruce de valencias», 3º de secundaria, familia
enlaces. Su canon fijó el procedimiento en cinco pasos (1 escribir el metal y
luego el no metal, 2 poner la valencia de cada uno arriba, 3 cruzar los números
hacia abajo como subíndices, 4 quitar los signos y el subíndice 1, 5 simplificar
si los dos subíndices se dividen entre el mismo número), el ejemplo en
Ca²⁺ con Cl⁻ que da CaCl₂, y el error en el paso 4: baja la carga con todo y
signo, o deja el subíndice 1 escrito.

Once fichas, doce teclas con borrar, el mismo teclado dibujado.

```json
{
  "temaNumero": 23,
  "materia": "quimica",
  "titulo": "Fórmula por cruce de valencias",
  "teclado": "fichas",
  "porQueEseTeclado": "La respuesta es una fórmula: símbolos de elemento y subíndices. El teclado de hoy no tiene letras, así que CaCl2 no se puede escribir con dígitos y diagonal. Con once fichas se escribe la fórmula y también el error típico del canon, que es dejar el subíndice 1 o bajar el signo de la carga.",
  "tecladosDescartados": [
    {
      "teclado": "digitos",
      "porQue": "No tiene letras. Toda la respuesta de este tema empieza por el símbolo del metal, y sin letras el hueco se queda sin nada que recibir."
    },
    {
      "teclado": "opciones",
      "porQue": "Con cuatro fórmulas a la vista el estudiante compara cuál se parece más a lo que cruzó, y ya no escribe el subíndice. El tema es escribir la fórmula, no reconocerla."
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
        "texto": "Vas en el paso 4: ya cruzaste, ahora quitas los signos. El signo se queda arriba, nunca baja con el número."
      },
      {
        "orden": 3,
        "texto": "El 1 del cloro baja al calcio, y un subíndice 1 no se escribe. El 2 del calcio baja al cloro y ese sí se escribe."
      }
    ]
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
          "texto": "Vas en el paso 4: el 2 del magnesio baja al cloro y el 1 del cloro se pierde al no escribirse."
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
          "texto": "Vas en el paso 5: 2 y 3 no se pueden dividir entre el mismo número, así que se quedan como salieron."
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
          "texto": "Vas en el paso 5. Los dos subíndices salieron 2, y 2 entre 2 es 1, y el 1 no se escribe."
        }
      ]
    }
  ],
  "faltaCodigo": true,
  "planB": {
    "sirveHoy": true,
    "comoQuedaria": "En la estación 3 el hueco deja de pedir la fórmula y pide el subíndice: «De calcio con carga 2 más y cloro con carga 1 menos, el cloro queda con subíndice [hueco]», y se teclea 2. En los escalones de la 4 el hueco pide el subíndice del segundo elemento, o el número entre el que se dividen los dos subíndices cuando hay que simplificar.",
    "queSePierde": "Pedir un subíndice suelto no mide escribir la fórmula: el estudiante no acomoda el metal antes del no metal, no quita el signo de la carga y no borra el subíndice 1, que es justo donde el canon puso el error. Con dígitos el tema se practica a la mitad."
  },
  "noSePuede": {
    "que": "la respuesta de la estación 3 y de los escalones de la 4 es una fórmula química: CaCl2, NaCl, Al2O3",
    "porQue": "hace falta el teclado de fichas, que hoy no existe: FILAS es una constante en app/estacion/completar.tsx:23-28 y las doce teclas están fijas en dígitos y diagonal",
    "queHagoConEsto": "servir el planB con el teclado de dígitos, que pide el subíndice en vez de la fórmula, y volver a esta versión cuando FILAS salga del contenido"
  }
}
```

Fíjate en tres cosas del ejemplo. Las fichas `1`, `+` y `−` no aparecen en
ninguna respuesta correcta, y están: sin ellas el error típico no se puede
escribir. Las cinco respuestas se arman con el mismo juego de once, aunque cada
una use elementos distintos. Y los escalones suben por una sola razón cada vez:
sin subíndice, un subíndice, dos subíndices, y hay que simplificar.

## Antes de devolver, revísate

1. ¿Elegiste el teclado más barato que sirve, y probaste antes reformular para
   quedarte en `digitos`?
2. ¿`faltaCodigo` es `true` si el teclado no es `digitos`, y `false` si sí lo es?
3. ¿Si `faltaCodigo` es `true`, `noSePuede` va **lleno** y nombra el teclado que
   falta?
4. ¿`planB` viaja, con `sirveHoy` dicho de verdad y con el hueco de la 3 y los
   escalones de la 4 reescritos para el teclado de dígitos?
5. ¿`tecladosDescartados` trae `digitos` con su motivo, si no lo elegiste?
6. ¿`fichas` tiene de 3 a 11 cuando el teclado es `fichas`, y está vacío en los
   otros tres casos?
7. ¿Cada `correcta` se arma juntando etiquetas que sí existen en `fichas`, sin
   sobrar ni faltar un carácter?
8. ¿Con las fichas que pusiste se puede escribir el error típico del canon?
9. ¿`opciones` está vacío salvo con teclado `opciones`, y ahí trae de 2 a 4 con
   una sola `esCorrecta` en `true` y con la etiqueta igual a `correcta`?
10. ¿Cada `expresion` tiene exactamente un hueco?
11. ¿Cada átomo lleva su `tipo` y su `valor` completos, sin abreviar?
12. ¿Ningún `simbolo` va sin `sub` ni `sup`? ¿Ninguna `fraccion` con átomos
    adentro? ¿Ningún `"3/5"` en un renglón?
13. ¿Los escalones son de tres a cinco, sin salirse de las cotas y sin pedir una
    ficha que no esté en el juego?
14. ¿`temaNumero` y `materia` son los del canon, copiados sin cambiarlos?
15. ¿Cero campos de estado, y `noSePuede` presente aunque vaya en `null`?
