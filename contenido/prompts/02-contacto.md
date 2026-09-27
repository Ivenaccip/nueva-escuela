# Estación 2 · primer contacto, sin penalización

**Cuándo se llama:** después del canon, una vez por tema.
**Sistema:** `contenido/prompts/00-sistema.md`
**Esquema:** `contenido/esquema/02-contacto.schema.json`
**Entra:** un tema del temario (`contenido/temarios/<materia>.json`) y el canon
del paso 0.
**Sale:** `preguntas[]`, de tres a cinco, cada una con cuatro opciones.
**Pantalla:** `app/estacion/contacto.tsx`.
**Se manda cuando** `canon.notacion` es `lineal`. Con `tabla` o `figura` el tema
va al prompt de tabla o al de figura, que son casos aparte.
**`formaDeRespuesta` no rutea esta estación.** Aquí no se teclea nada: se toca
una tarjeta. Un tema con `formaDeRespuesta` `palabra` o `trazo` sí puede tener su
estación 2 normal; lo que se sale del teclado son las estaciones 3 y 4.

Todo lo que va abajo de «Mensaje del usuario» se manda tal cual como mensaje del
usuario, con los placeholders ya sustituidos. Nada más se edita.

---

## Mensaje del usuario

Vas a escribir la estación 2 de un tema de Andamio: el primer contacto.

Es lo primero que el estudiante toca después del video, y va **sin
penalización**: equivocarse no le cuesta monedas, no le baja nada y nadie lo
corrige de mal modo. Entonces la estación no sirve para calificar. Sirve para
diagnosticar. Cada opción equivocada tiene que delatar algo concreto de lo que
el estudiante cree, y decírselo.

Un bloque de opción múltiple donde los distractores son relleno no diagnostica
nada: el estudiante adivina, le sale bien y sigue creyendo lo mismo que creía.
Los tres distractores de cada pregunta son tu verdadero trabajo.

### Qué recibes

- El tema, como está escrito en el temario.
- El canon del tema, completo. Es la salida del paso 0.

No recibes lo que escribieron las otras cinco estaciones, y ellas no reciben lo
tuyo. Las seis se escriben al mismo tiempo, sin hablarse. Lo único que
comparten es el canon: si tú te sales de él, el estudiante ve dos
procedimientos distintos para el mismo tema y concluye que no entendió nada.

### El tema

- Materia: {{materiaNombre}} (`{{materia}}`)
- Número: {{tema.numero}}
- Título: {{tema.titulo}}
- Familia: {{tema.familia}}
- Grado: {{tema.grado}}
- Al terminar, el estudiante dice: {{tema.quedaSabiendo}}
- Depende de los temas: {{tema.dependeDe}}
- Error típico: {{tema.errorTipico}}
- Notación que pide el tema: {{tema.notacion}}

### El canon

{{canon}}

De ahí, lo que más te importa en esta estación:

- Procedimiento: {{canon.procedimiento.nombre}}
- El ejemplo va de: {{canon.ejemplo.deQueVa}}
- El error se cae en el paso: {{canon.error.pasoQueCorrompe}}
- Lo que el estudiante cree: {{canon.error.creenciaDeAtras}}
- Números permitidos: {{canon.cotas.numeros}}

El canon es ley. Sus cinco pasos y su numeración, los números de su ejemplo,
las palabras de su vocabulario y sus cotas no se tocan: no renombras un paso,
no cambias el ejemplo, no usas un sinónimo de una palabra del vocabulario.

Sí puedes preguntar sobre casos distintos al del ejemplo canónico —esta
estación no está obligada a repetirlo— siempre que se queden dentro de
{{canon.cotas.numeros}} y de `cotas.unidades`, usen los símbolos que el canon ya
escribió en `cotas.simbolos`, y no supongan ningún paso que el canon no enseñó.

### Qué produces

De tres a cinco preguntas, en el orden en que se van a mostrar. Cada pregunta
lleva:

- `enunciado`: la pregunta, escrita con átomos.
- `pasoDelCanon`: cuál de los cinco pasos del procedimiento toca esta pregunta.
  Si la pregunta es de vocabulario, el paso donde esa palabra se usa.
- `opciones`: exactamente cuatro, en el orden A, B, C, D.

Es un **arreglo**. No escribes «pregunta 2 de 4», ni un índice, ni un total, ni
cuántas faltan: la pantalla lo deriva de la lista. Tampoco escribes pistas:
aquí no hay pistas, y no hay nada que teclear.

Reparte las preguntas entre pasos distintos del canon. Un bloque donde las
cuatro preguntas atacan el mismo paso deja el resto del procedimiento sin
diagnosticar; el único paso que se vale repetir es
{{canon.error.pasoQueCorrompe}}, porque ahí vive el error.

Las preguntas son independientes. Ninguna puede depender de haber contestado
bien la anterior: el estudiante puede fallar la primera y seguir.

### Las cuatro opciones

- **Una sola correcta.** `esCorrecta` en `true` en una y sólo una de las cuatro.
- **Parejas en forma y en largo.** Si la correcta es una fracción, las otras
  tres son fracciones. Si es un número de un dígito, las otras tres son números
  de un dígito. Si son palabras, las cuatro miden tres o cuatro palabras. La
  correcta no puede ser la más larga, ni la más específica, ni la única bien
  escrita: así se contesta sin saber el tema.
- **La correcta cambia de lugar.** Si en la primera pregunta la correcta es la
  C, en la segunda no es la C. En el bloque completo no la pongas dos veces
  seguidas en la misma letra, ni repartas todas en una sola.
- **Cada opción cabe en uno o dos renglones.** La tarjeta es `minHeight: 64`
  (`app/estacion/contacto.tsx:120-131`), no alto fijo: una opción larga **se parte**
  en vez de desbordarse, y eso está puesto a propósito. Aun así desbalancea el
  bloque, y una opción más larga se elige por larga y no por cierta. Medido en
  390x844: la caja del texto son 270 px a 20 px, así que 29 caracteres es un renglón
  y la tarjeta mide los 64 del diseño; 57 son dos y mide 80; 85 son tres y mide 113;
  a 86 la pantalla se desplaza. El esquema lo aprieta ahí: **hasta cuatro átomos, y
  el texto de cada uno hasta 57 caracteres — por átomo, así que cuatro átomos largos
  se multiplican por cuatro.** Una fracción, una fórmula, un número, una
  operación corta, o una frase de tres o cuatro palabras. Nunca una oración
  completa ni un párrafo. Lo largo va en el `enunciado`, que sí se envuelve.
- **Los distractores son confusiones de verdad.** Cada uno es a dónde llega un
  chavo de {{tema.grado}} que razonó mal de una manera concreta y nombrable. Si
  para explicar un distractor tienes que decir «no se le ocurriría a nadie»,
  ese distractor está de relleno: cámbialo.
- **Ningún distractor revela lo mismo que otro.** Tres opciones equivocadas,
  tres confusiones distintas.

### `queRevela`

Va en las cuatro opciones, la correcta incluida, y se le dice al estudiante en
segunda persona.

- En una opción equivocada: qué estás creyendo, y qué es lo que en realidad
  pasa. Se describe, no se regaña. «Estás leyendo el subíndice como si contara
  los átomos de todas las moléculas», no «te equivocaste por no fijarte».
- En la correcta: qué hiciste, dicho en una frase. Sin felicitar.

Es lo único que el estudiante se lleva de esta estación, y es lo que la vuelve
sin penalización: no pierde nada y sí se entera de qué le falló.

### El error típico, exactamente una vez en el bloque

Una de las opciones equivocadas —una, no dos, no ninguna— es el error típico
del canon reproducido tal cual: el resultado exacto al que llega quien cree
{{canon.error.creenciaDeAtras}}. Esa opción lleva `esElErrorTipico` en `true`.
Todas las demás lo llevan en `false`, incluida la correcta.

Ponla en la pregunta cuyo `pasoDelCanon` sea {{canon.error.pasoQueCorrompe}}:
ahí es donde el error se cae.

Si `{{tema.errorTipico}}` describe dos confusiones, el canon ya escogió una en
`error.creenciaDeAtras`. Ésa es la que lleva `esElErrorTipico` en `true`.

**Antes de devolver, cuéntalas.** Recorre las opciones de las cuatro preguntas
—son de doce a veinte— y cuenta cuántas llevan `esElErrorTipico` en `true`. Si
no es exactamente una, está mal, y el llamador la rechaza y vuelve a pedirla.
El de verdad se marca una sola vez; los de `erroresSecundarios` **no** se marcan,
aunque también sean errores y aunque se parezcan. Ése es el error que se comete:
marcar dos porque las dos son confusiones reales.

**Cada entrada de `canon.erroresSecundarios` es obligatoriamente un distractor
del bloque**, con `esElErrorTipico` en `false`. No es opcional. Son las
confusiones que no cupieron en `error` y que ninguna otra estación puede recoger:
si tú las dejas fuera, el tema acaba enseñando el procedimiento y dejando intacta
la creencia que hace que el estudiante no crea su propio resultado. Su
`queRevela` nombra esa creencia igual que el del error típico.

Es la opción más importante del bloque. Si el estudiante la toca aquí, donde no
le cuesta nada, llega advertido a la estación 5, donde ese mismo error está
escondido entre cinco pasos.

### Cómo se escriben los renglones

Cuatro átomos, y no hay más:

| Átomo | Se ve así | Para qué |
|---|---|---|
| `{"tipo":"texto","valor":"÷"}` | ÷ | palabras, signos, flechas (`→`), comparaciones |
| `{"tipo":"fraccion","arriba":3,"abajo":5}` | tres quintos apilados | cualquier fracción |
| `{"tipo":"simbolo","valor":"H","sub":"2"}` | H con 2 al pie | subíndice, superíndice, carga, unidad, variable con letra |
| `{"tipo":"hueco"}` | recuadro punteado | **no se usa en esta estación** |

- `fraccion.arriba` y `fraccion.abajo` son **una sola cadena** cada uno. No
  caben átomos dentro de una fracción, y una fracción no va dentro de otra. Si
  arriba necesita un subíndice, se escribe con palabras: «masa del soluto».
- Nunca `"3/5"` en un renglón. Eso es una `fraccion`.
- Un `simbolo` sin `sub` ni `sup` es `texto`: usa `texto`.
- Cada átomo va **completo**, con su `tipo` y su `valor`. `{"texto":"S"}` no es un
  átomo: es un objeto sin `tipo` que la pantalla dibuja como un recuadro vacío
  (`src/componentes/Expresion.tsx:104`). Siempre `{"tipo":"texto","valor":"S"}`.
- En una fórmula, un `simbolo` por cada símbolo que lleve subíndice, y lo que no
  lleva subíndice va pegado en `texto`. H₂SO₄ es
  ```json
  [{"tipo":"simbolo","valor":"H","sub":"2"},
   {"tipo":"texto","valor":"S"},
   {"tipo":"simbolo","valor":"O","sub":"4"}]
  ```
  El coeficiente de adelante es `texto`: 2H₂O es
  ```json
  [{"tipo":"texto","valor":"2"},
   {"tipo":"simbolo","valor":"H","sub":"2"},
   {"tipo":"texto","valor":"O"}]
  ```
- El menos es `−` (U+2212), no un guion. El por es `×`, no `x` ni `*`. La flecha
  de reacción es `→` y va en `texto`.
- **Ningún renglón de esta estación lleva `hueco`.** Aquí no se teclea nada: se
  toca una tarjeta.

### Prohibido

- «Todas las anteriores», «ninguna de las anteriores», «A y B», «no sé», «falta
  información». Ninguna de las cuatro opciones puede hablar de las otras: la
  pantalla las presenta como cuatro tarjetas y el estudiante puede tocar una
  sola.
- Enunciados en negativo: «¿cuál **no** es…», «¿cuál es falso…». Ahí las tres
  equivocadas son afirmaciones ciertas y `queRevela` se queda sin nada que
  revelar.
- Preguntas de puro dato memorizado que el canon no enseñó (quién descubrió
  qué, en qué año, cómo se llamaba el modelo). Toda pregunta cuelga de uno de
  los cinco pasos.
- Dos opciones que signifiquen lo mismo escrito distinto. El estudiante las lee
  como una trampa.
- Opciones absurdas para rellenar el cuarto lugar.
- Distractores que no se puedan explicar con `creenciaDeAtras` ni con una
  confusión nombrable.
- Enunciados que pidan dos cosas a la vez. Una pregunta, una cosa.
- Campos de estado: `indice`, `total`, `pistas`, `pistaEn`, `estado`,
  `respuestaInicial`. Nada de eso es contenido.
- Huecos, respuestas tecleadas y unidades dentro de la respuesta.
- Estilo dentro del contenido: ni color, ni tamaño, ni negritas, ni markdown,
  ni `\n`. Son cadenas planas.

### Un ejemplo completo

Para que se entienda de dónde sale cada cosa, éste es el recorte del canon que
usa el ejemplo. **No lo copies**: el tema que te toca es otro.

Tema: Química 28, «La ecuación química», 3º secundaria.
Procedimiento «Leer una ecuación química y contar sus átomos», cinco pasos:

1. Partes la ecuación en dos lados por la flecha.
2. Nombras los reactivos, lo que está antes de la flecha.
3. Nombras los productos, lo que está después de la flecha.
4. Cuentas los átomos de un elemento: multiplicas el coeficiente por el
   subíndice.
5. Lees la ecuación completa en voz alta.

Ejemplo canónico: 2H₂ + O₂ → 2H₂O.
`error.pasoQueCorrompe`: 4.
`error.creenciaDeAtras`: «el subíndice ya dice cuántos átomos hay, y el número
de adelante cuenta aparte, por moléculas».
`erroresSecundarios[0].creenciaDeAtras`: «la flecha es el signo igual, así que los
dos lados son la misma sustancia escrita de dos formas».
`cotas.numeros`: «coeficientes y subíndices del 1 al 4, sin decimales».

Con eso, la salida:

```json
{
  "temaNumero": 28,
  "materia": "quimica",
  "preguntas": [
    {
      "pasoDelCanon": 1,
      "enunciado": [
        { "tipo": "texto", "valor": "En" },
        { "tipo": "texto", "valor": "2" },
        { "tipo": "simbolo", "valor": "H", "sub": "2" },
        { "tipo": "texto", "valor": "+" },
        { "tipo": "simbolo", "valor": "O", "sub": "2" },
        { "tipo": "texto", "valor": "→" },
        { "tipo": "texto", "valor": "2" },
        { "tipo": "simbolo", "valor": "H", "sub": "2" },
        { "tipo": "texto", "valor": "O" },
        { "tipo": "texto", "valor": ", ¿qué dice la flecha?" }
      ],
      "opciones": [
        {
          "letra": "A",
          "partes": [{ "tipo": "texto", "valor": "es igual a" }],
          "esCorrecta": false,
          "esElErrorTipico": false,
          "queRevela": "Estás leyendo la flecha como el signo igual de matemáticas. Los dos lados tienen los mismos átomos, pero no son la misma sustancia."
        },
        {
          "letra": "B",
          "partes": [{ "tipo": "texto", "valor": "se suma con" }],
          "esCorrecta": false,
          "esElErrorTipico": false,
          "queRevela": "Estás leyendo la flecha como otro signo de más. El más junta sustancias de un mismo lado; la flecha separa los dos lados."
        },
        {
          "letra": "C",
          "partes": [{ "tipo": "texto", "valor": "se convierte en" }],
          "esCorrecta": true,
          "esElErrorTipico": false,
          "queRevela": "Leíste la flecha como el cambio que ocurre: lo de la izquierda se convierte en lo de la derecha."
        },
        {
          "letra": "D",
          "partes": [{ "tipo": "texto", "valor": "pesa lo mismo que" }],
          "esCorrecta": false,
          "esElErrorTipico": false,
          "queRevela": "Estás leyendo la flecha como una balanza. La masa sí se conserva en la reacción, pero eso no es lo que la flecha dice."
        }
      ]
    },
    {
      "pasoDelCanon": 4,
      "enunciado": [
        { "tipo": "texto", "valor": "¿Cuántos átomos de hidrógeno hay en" },
        { "tipo": "texto", "valor": "2" },
        { "tipo": "simbolo", "valor": "H", "sub": "2" },
        { "tipo": "texto", "valor": "O?" }
      ],
      "opciones": [
        {
          "letra": "A",
          "partes": [{ "tipo": "texto", "valor": "4" }],
          "esCorrecta": true,
          "esElErrorTipico": false,
          "queRevela": "Multiplicaste el coeficiente por el subíndice: dos moléculas, con dos hidrógenos cada una."
        },
        {
          "letra": "B",
          "partes": [{ "tipo": "texto", "valor": "2" }],
          "esCorrecta": false,
          "esElErrorTipico": true,
          "queRevela": "Leíste nada más el subíndice y dejaste el 2 de adelante afuera. El subíndice cuenta los átomos de una molécula, no de todas."
        },
        {
          "letra": "C",
          "partes": [{ "tipo": "texto", "valor": "3" }],
          "esCorrecta": false,
          "esElErrorTipico": false,
          "queRevela": "Contaste los tres átomos que tiene una molécula de agua, sin separar el hidrógeno del oxígeno."
        },
        {
          "letra": "D",
          "partes": [{ "tipo": "texto", "valor": "6" }],
          "esCorrecta": false,
          "esElErrorTipico": false,
          "queRevela": "Contaste todos los átomos de las dos moléculas. La pregunta pedía nada más los de hidrógeno."
        }
      ]
    },
    {
      "pasoDelCanon": 3,
      "enunciado": [
        { "tipo": "texto", "valor": "¿Cuál es el producto de" },
        { "tipo": "texto", "valor": "2" },
        { "tipo": "simbolo", "valor": "H", "sub": "2" },
        { "tipo": "texto", "valor": "+" },
        { "tipo": "simbolo", "valor": "O", "sub": "2" },
        { "tipo": "texto", "valor": "→" },
        { "tipo": "texto", "valor": "2" },
        { "tipo": "simbolo", "valor": "H", "sub": "2" },
        { "tipo": "texto", "valor": "O?" }
      ],
      "opciones": [
        {
          "letra": "A",
          "partes": [
            { "tipo": "texto", "valor": "2" },
            { "tipo": "simbolo", "valor": "H", "sub": "2" }
          ],
          "esCorrecta": false,
          "esElErrorTipico": false,
          "queRevela": "Leíste el lado de antes de la flecha. Ahí están los reactivos, lo que entra a la reacción."
        },
        {
          "letra": "B",
          "partes": [
            { "tipo": "simbolo", "valor": "H", "sub": "2" },
            { "tipo": "simbolo", "valor": "O", "sub": "2" }
          ],
          "esCorrecta": false,
          "esElErrorTipico": false,
          "queRevela": "Bajaste el 2 del frente y lo convertiste en subíndice del oxígeno. Con ese subíndice ya no es agua, es otra sustancia."
        },
        {
          "letra": "C",
          "partes": [
            { "tipo": "simbolo", "valor": "H", "sub": "2" },
            { "tipo": "texto", "valor": "O" }
          ],
          "esCorrecta": false,
          "esElErrorTipico": false,
          "queRevela": "Diste con la sustancia y dejaste el coeficiente afuera. El 2 del frente también se lee."
        },
        {
          "letra": "D",
          "partes": [
            { "tipo": "texto", "valor": "2" },
            { "tipo": "simbolo", "valor": "H", "sub": "2" },
            { "tipo": "texto", "valor": "O" }
          ],
          "esCorrecta": true,
          "esElErrorTipico": false,
          "queRevela": "Leíste completo el lado de después de la flecha, con su coeficiente."
        }
      ]
    },
    {
      "pasoDelCanon": 4,
      "enunciado": [
        { "tipo": "texto", "valor": "¿Qué cambia si le pones un 2 al frente a" },
        { "tipo": "simbolo", "valor": "H", "sub": "2" },
        { "tipo": "texto", "valor": "O?" }
      ],
      "opciones": [
        {
          "letra": "A",
          "partes": [{ "tipo": "texto", "valor": "qué sustancia es" }],
          "esCorrecta": false,
          "esElErrorTipico": false,
          "queRevela": "Estás tratando el número de adelante como si fuera un subíndice. El subíndice sí cambia la sustancia; el coeficiente no la toca."
        },
        {
          "letra": "B",
          "partes": [{ "tipo": "texto", "valor": "cuántas moléculas hay" }],
          "esCorrecta": true,
          "esElErrorTipico": false,
          "queRevela": "El número de adelante cuenta moléculas. La fórmula de cada una se queda igual."
        },
        {
          "letra": "C",
          "partes": [{ "tipo": "texto", "valor": "cuánto pesa cada molécula" }],
          "esCorrecta": false,
          "esElErrorTipico": false,
          "queRevela": "El coeficiente dice cuántas moléculas hay, no cómo es cada una. Las dos moléculas de agua son idénticas a la de antes."
        },
        {
          "letra": "D",
          "partes": [{ "tipo": "texto", "valor": "cuántos elementos tiene" }],
          "esCorrecta": false,
          "esElErrorTipico": false,
          "queRevela": "Los elementos los dicen las letras, no el número de adelante. Siguen siendo hidrógeno y oxígeno."
        }
      ]
    },
    {
      "pasoDelCanon": 2,
      "enunciado": [
        { "tipo": "texto", "valor": "¿Cuántas sustancias hay antes de la flecha en" },
        { "tipo": "texto", "valor": "2" },
        { "tipo": "simbolo", "valor": "H", "sub": "2" },
        { "tipo": "texto", "valor": "+" },
        { "tipo": "simbolo", "valor": "O", "sub": "2" },
        { "tipo": "texto", "valor": "→" },
        { "tipo": "texto", "valor": "2" },
        { "tipo": "simbolo", "valor": "H", "sub": "2" },
        { "tipo": "texto", "valor": "O?" }
      ],
      "opciones": [
        {
          "letra": "A",
          "partes": [{ "tipo": "texto", "valor": "1" }],
          "esCorrecta": false,
          "esElErrorTipico": false,
          "queRevela": "Leíste el lado izquierdo como una sola cosa. El signo de más está ahí porque son dos sustancias separadas."
        },
        {
          "letra": "B",
          "partes": [{ "tipo": "texto", "valor": "3" }],
          "esCorrecta": false,
          "esElErrorTipico": false,
          "queRevela": "Contaste también el agua. El agua está después de la flecha, así que no es reactivo."
        },
        {
          "letra": "C",
          "partes": [{ "tipo": "texto", "valor": "2" }],
          "esCorrecta": true,
          "esElErrorTipico": false,
          "queRevela": "Contaste lo que el signo de más separa: hidrógeno y oxígeno, dos sustancias."
        },
        {
          "letra": "D",
          "partes": [{ "tipo": "texto", "valor": "4" }],
          "esCorrecta": false,
          "esElErrorTipico": false,
          "queRevela": "Contaste moléculas, no sustancias: dos de hidrógeno y dos de oxígeno. La pregunta pedía cuántas sustancias distintas hay."
        }
      ]
    }
  ],
  "noSePuede": null
}
```

Fíjate en cuatro cosas de ese ejemplo:

1. La correcta cae en C, A, D, B y C. No está siempre en el mismo lugar, y no
   se repite en dos preguntas seguidas.
2. En cada pregunta las cuatro opciones tienen la misma forma: cuatro frases de
   tres palabras, o cuatro números de un dígito, o cuatro fórmulas.
3. El error típico aparece una sola vez en todo el bloque, en la pregunta cuyo
   `pasoDelCanon` es 4. Lo de «es igual a» de la primera pregunta es el
   `erroresSecundarios[0]` del canon: entró obligatoriamente como distractor, con
   `esElErrorTipico` en `false`, y su `queRevela` nombra esa creencia. Ninguna de
   las dos confusiones del `errorTipico` se quedó fuera del bloque.
4. Las cinco preguntas tocan los pasos 1, 4, 3, 4 y 2. El paso que se repite es
   el del error.
5. Ninguna opción pasa de cuatro átomos ni de 57 caracteres de texto por átomo, y
   ninguna llega a dos renglones: la más larga es «cuánto pesa cada molécula», de 25.

### Cuándo llenas `noSePuede`

`null` si el bloque salió completo.

Lo llenas cuando lo que el tema necesita preguntar no cabe en los cuatro
átomos: la opción es una gráfica, un trazo, un color, una tabla de dos
columnas, o una frase que no cabe en un renglón de 64 de alto.

Antes de rendirte, intenta **una** reformulación: preguntar por el número en vez
de por el dibujo, por el nombre en vez de por el color, por un pedazo del
procedimiento en vez de por el resultado. Si la reformulación cambia lo que el
tema enseña, entonces sí llena `noSePuede` y di qué hace falta.

`noSePuede` viaja siempre, aunque las preguntas salgan bien.

### Antes de devolver, revísate

1. ¿Son de tres a cinco preguntas, cada una con exactamente cuatro opciones
   A, B, C, D en ese orden?
2. ¿Cada pregunta tiene una sola opción con `esCorrecta` en `true`?
3. ¿La correcta cambia de letra entre preguntas?
4. ¿Hay exactamente una opción en todo el bloque con `esElErrorTipico` en
   `true`, y es una equivocada, y está en la pregunta del paso
   {{canon.error.pasoQueCorrompe}}?
5. ¿Cada entrada de `canon.erroresSecundarios` entró como distractor en alguna
   pregunta, con `esElErrorTipico` en `false`?
6. ¿Las cuatro opciones de cada pregunta son parejas en forma y en largo? Hasta
   cuatro átomos, y hasta 57 caracteres de texto POR ÁTOMO: la tarjeta mide 270 px
   a 20 px, así que 29 caracteres es un renglón y 57 son dos. El tope se
   multiplica por cuatro, así que cuatro átomos largos no caben aunque cada uno
   cumpla.
7. ¿Los tres distractores de cada pregunta revelan tres cosas distintas, y cada
   uno es una confusión que alguien comete de verdad?
8. ¿`queRevela` está en las cuatro, en segunda persona, sin felicitar y sin
   regañar?
9. ¿Cada átomo lleva su `tipo` y su `valor` completos, sin abreviar?
10. ¿Ningún renglón lleva `hueco`? ¿Ninguna `fraccion` tiene átomos adentro?
    ¿Ningún `simbolo` va sin `sub` ni `sup`?
11. ¿Nada de `"3/5"` en un renglón, nada de guion por menos, nada de `x` por `×`?
12. ¿Cada `pasoDelCanon` es un paso que el canon sí tiene, y el bloque toca más
    de uno?
13. ¿Ningún número se salió de {{canon.cotas.numeros}}?
14. ¿Cero emoji, cero signos de admiración, cero «es fácil», cero campos de
    estado?
15. **La lista, campo por campo.** Tacha uno por uno: `preguntas` y
    `noSePuede`. Cada pregunta lleva `enunciado`, `pasoDelCanon` y `opciones`, y
    cada opción lleva los cuatro: `partes`, `esCorrecta`, `esElErrorTipico` y
    `queRevela`. Con cinco preguntas son veinte opciones de cuatro campos cada
    una: la que se queda a medias tira las cinco preguntas. `esElErrorTipico` va
    en las veinte, en `false` donde no toca; no se omite. La `letra` no va en esta
    lista: es la posición en el arreglo y la pone quien llama.
