# Estación 3 · completar el paso

**Cuándo se llama:** una vez por tema, después del canon (paso 0).
**Sistema:** `contenido/prompts/00-sistema.md`
**Esquema:** `contenido/esquema/03-completar.schema.json`
**Entra:** el tema del temario (`contenido/temarios/<materia>.json`) y el canon completo.
**Sale:** el renglón con un hueco, la respuesta correcta, las escrituras que también
valen, el texto de las pistas y lo que se le contesta si teclea el error típico.

**Sólo para temas con `canon.notacion: "lineal"` y `canon.formaDeRespuesta: "numero"`
o `"fraccion"`.** Si el canon dice `palabra` o `trazo`, el tema va a
`X3-respuesta-no-numerica.md`; si dice `tabla`, a `X1-tabla.md`; si dice `figura`,
a `X2-figura.md`. La tabla de ruteo completa, con las nueve combinaciones de
`notacion` × `formaDeRespuesta`, vive en `contenido/CONTRATO.md` §3 y es la única
copia: ésta de aquí es un atajo. Si el llamador se equivoca y manda uno de esos
aquí, la salida es `noSePuede` lleno, no un ejercicio disfrazado.

Es la estación donde el límite de la app aprieta más: el estudiante contesta con un
teclado de doce teclas (`app/estacion/completar.tsx`, la constante `FILAS`) que sólo
tiene `1`–`9`, `0`, `/` y borrar.

---

## Mensaje del usuario

Escribes la estación 3 de un tema de Andamio: **completar el paso**.

La pantalla muestra el procedimiento casi resuelto, con un solo recuadro vacío. El
estudiante teclea abajo lo que falta y lo ve aparecer en el recuadro. No hay opciones
que elegir: aquí se escribe.

Recibes el tema y el canon. **No recibes lo que escribieron las otras cinco
estaciones**, y ellas no reciben lo tuyo: el canon es lo único que comparten. Por eso
no lo contradices ni lo completas por tu cuenta.

### El tema

- Materia: {{materia}} ({{materiaNombre}})
- Número: {{tema.numero}}
- Título: {{tema.titulo}}
- Familia: {{tema.familia}}
- Grado: {{tema.grado}}
- Al terminar, el estudiante dice: {{tema.quedaSabiendo}}
- Error típico: {{tema.errorTipico}}
- Notación que pide el tema: {{tema.notacion}}

### El canon, que es ley

```json
{{canon}}
```

Para que no se te pase:

- Procedimiento: {{canon.procedimiento.nombre}}
- El ejemplo va de: {{canon.ejemplo.deQueVa}}
- El error se cae en el paso: {{canon.error.pasoQueCorrompe}}
- Lo que el estudiante cree: {{canon.error.creenciaDeAtras}}
- Números permitidos: {{canon.cotas.numeros}}

Los cinco pasos, su numeración, los números del ejemplo, las palabras del
vocabulario y las cotas ya están decididos. No renumeras un paso, no cambias un
número del ejemplo, no usas un sinónimo de una palabra del vocabulario y no te sales
de las cotas. Tu renglón se escribe **sobre el ejemplo canónico**, con esos mismos
números: el estudiante ya lo vio en el video y lo va a volver a ver en la 4 y en la
5, y tiene que reconocerlo.

### El teclado: doce teclas

```
1 2 3
4 5 6
7 8 9
/ 0 borrar
```

No hay punto decimal, ni signo menos, ni letras, ni paréntesis, ni espacio, ni `^`,
ni `=`, ni coma. Tu respuesta tiene que casar con:

```
^[0-9]+(/[0-9]+)?$
```

Valen `7`, `200`, `12/5`. No valen `0.8`, `−25`, `2 3/4`, `NaCl`, `m/s`, `(a+b)`,
`15%`, `2³`.

#### La diagonal es la raya de UNA fracción, y nada más

`a/b` se dibuja **apilado**, como la fracción a sobre b
(`src/componentes/Expresion.tsx:171` y `193`), y el lector de pantalla lo dicta
«a entre b» (`Expresion.tsx:54-55`). Nunca significa «por», ni «y sobran», ni
«a», ni «con», ni separa factores.

```
mal   "tecleado": "6/3"     para «6 cajas y sobran 3 pelotas»
                            pasa la expresión regular, pasa ajv, y la pantalla
                            dibuja seis tercios. Éste es el fallo peor: se publica.
mal   "tecleado": "2/3/3"   para «2³ × 3²», usando la diagonal de separador
mal   "tecleado": "3/2"     para la razón «3 a 2», si lo que se quiere es 3:2
bien  "tecleado": "3/2"     para la fracción tres medios, y para una razón
                            simplificada cuando la pregunta pide «escrita como
                            fracción»
```

**Si tu respuesta son dos números que no son numerador y denominador, la pregunta
está mal planteada.** Pártela en dos: un escalón que pregunte por el primero y
otro por el segundo. Para 33 ÷ 5 = 6 y sobran 3, un escalón lleva
`[{"tipo":"texto","valor":"33 ÷ 5 = 6 y sobran"},{"tipo":"hueco"}]` con
«¿Cuántas pelotas sobran?» y `"3"`, y el otro lleva el hueco en el 6 con
«¿Cuántas cajas se llenan?».

#### El hueco no cabe dentro de un superíndice

`$defs.simbolo.sup` es una cadena, no un átomo, así que un `hueco` no valida ahí
y `Expresion.tsx:150` lo pinta como `<Text>`, no como átomo. Lo mismo para `sub` y
para los dos lados de una `fraccion`. Si lo que falta es un exponente, el hueco va
suelto en el renglón y la pregunta lo nombra: «¿cuántas veces se repite el 2?»,
con el renglón mostrando la división sucesiva, no la potencia.

**Las unidades no se teclean.** Van escritas en el renglón, como `texto`, pegadas
después del hueco (`… son [hueco] g`). El hueco recibe sólo el número.

### Dónde va el hueco

Uno, y sólo uno. La pantalla escribe lo tecleado en *todos* los huecos del renglón a
la vez (`src/componentes/Expresion.tsx:104`): con dos, el estudiante ve su respuesta
duplicada y el ejercicio deja de tener sentido.

Ese hueco es **el resultado de un solo paso del canon**, y anotas cuál en
`pasoDelCanon`. No es el resultado de dos pasos juntos ni del procedimiento completo:
eso es la estación 4.

Elige, de preferencia, el paso {{canon.error.pasoQueCorrompe}}, el que el error
corrompe: ahí el hueco sirve para cachar la creencia de atrás, y el estudiante que se
equivoca teclea algo que tú ya previste. Si el resultado de ese paso no se puede
teclear, elige otro paso, anótalo y deja `siTecleaElError` en `null`.

Reglas del renglón:

- Lo de antes del hueco ya va resuelto, con los números del ejemplo.
- Lo de después del hueco no trae el resultado ya escrito. Si el renglón se resuelve
  solo leyéndolo, no hay nada que completar.
- El hueco **no va dentro de una fracción**: `arriba` y `abajo` son cadenas y no
  admiten átomos. Si lo que falta es un piso de la fracción, la fracción se escribe
  con palabras (`masa del soluto` sobre `masa de la disolución`) y el hueco se
  pregunta aparte, en el mismo renglón. El ejemplo de abajo hace justo eso.

### Cómo se escriben los renglones

Cuatro átomos, y no hay más:

| Átomo | Se ve |
|---|---|
| `{"tipo":"texto","valor":"÷"}` | palabras y signos sueltos: `+ − × ÷ = < > ≈ →` |
| `{"tipo":"fraccion","arriba":3,"abajo":5}` | tres quintos apilados |
| `{"tipo":"simbolo","valor":"H","sub":"2"}` | H con 2 al pie |
| `{"tipo":"hueco"}` | el recuadro por llenar |

- Una fracción no lleva átomos adentro, y no se anida. `arriba` y `abajo` son una
  cadena corta cada uno; si hace falta un subíndice ahí, se escribe con palabras.
- Nunca `"3/5"` dentro de un `texto`: eso es una `fraccion`. La diagonal en `texto`
  sólo vale dentro de una unidad (`m/s`, `mg/L`).
- Un `simbolo` sin `sub` ni `sup` es `texto`; el esquema lo rechaza.
- El menos es `−` (U+2212), no un guion. El por es `×`, no `x` ni `*`.
- Del `hueco` escribes `{"tipo":"hueco"}` y nada más: ni el valor, ni el ancho, ni el
  alto. La respuesta viaja en `respuesta`.

### La respuesta

- `tecleado`: la respuesta correcta tal como sale del teclado.
- `aceptaTambien`: las otras escrituras del **mismo** número que la app debe dar por
  buenas. `4` y `4/1` son la misma cosa; `12/5` y `24/10` también, cuando el tema no
  exige la forma simplificada. Vacío es lo normal. Aquí no van respuestas parecidas
  que en realidad son otro número.
- `comoSeLee`: la respuesta dicha en voz alta, sin signos: «doce quintos».
- `queFalta`: qué se espera en el hueco, en palabras y con su unidad si la lleva. No
  es la respuesta. Es lo que la pantalla le dicta a quien usa lector de pantalla.

### Las pistas

Tres, escalonadas. Dos si el hueco es tan corto que la tercera repetiría a la
segunda. Son una lista con su orden y su texto: cuántas quedan y cuándo se libera la
siguiente lo pone la app.

1. Reencuadra la pregunta. Dice qué te está pidiendo el hueco, sin tocar la cuenta.
2. Nombra **la acción** del paso que hay que usar, con las palabras de
   `queSeHace`, y **sin decir su número**. El estudiante no lleva la numeración
   del canon en la cabeza: nunca ha visto la lista numerada en pantalla, así que
   «paso 2 del procedimiento» le gasta una pista sin decirle nada. Es la misma
   regla en las estaciones 3, 4 y 5, y está escrita en `CONTRATO.md` §3.
3. Deja la cuenta planteada y casi la dice.

**Ninguna pista contiene el número de la respuesta**, ni la fracción de la
respuesta, ni sus dígitos por separado, ni la descomposición que los arma. Una
pista que suelta el número no es una pista.

### Si teclea el error típico

`siTecleaElError` es lo que se le contesta cuando teclea justo lo que sale de
{{canon.error.creenciaDeAtras}}. Nombra la creencia, no a la persona, y lo devuelve
al paso del canon sin darle la respuesta. Va en `null` sólo cuando el error típico no
produce un valor tecleable en este hueco.

### Cuándo llenas `noSePuede`

- La respuesta necesita un decimal, un negativo, un espacio, un paréntesis, un
  exponente, una unidad tecleada o letras.
- El paso no se puede escribir con los cuatro átomos.
- El canon trae `notacion: "tabla"` o `"figura"`, o `formaDeRespuesta: "palabra"` o
  `"trazo"`.

Antes de rendirte, un intento de reformular: si el resultado es `0.15`, tal vez el
hueco puede pedir el numerador o la masa completa; si la respuesta es «se hunde», tal
vez puede pedir el número que se compara. Si la reformulación cambia lo que el tema
enseña, entonces sí: `noSePuede` lleno, diciendo qué teclado o qué átomo hace falta.
Vale más un `noSePuede` lleno que un ejercicio que la pantalla no puede dibujar: ahí
el estudiante se traba y cree que el que está mal es él.

### Prohibido

- Más de un hueco, o ningún hueco.
- Un hueco dentro de una fracción.
- Pedir la unidad en el hueco, o pedir el número y la unidad juntos.
- Una respuesta con decimal, negativo, letra, paréntesis, exponente, coma o espacio.
- Un hueco que sea el resultado de todo el procedimiento, o de dos pasos juntos.
- Dejar el resultado ya escrito en el renglón, después del hueco.
- Cambiar los números del ejemplo del canon, o inventar otro ejemplo.
- Inventar un paso que el canon no tiene, renumerar los suyos o renombrarlos.
- Una pista que contenga el número de la respuesta, sus dígitos por separado, o
  la suma o el producto que la arma.
- Una pista que diga el **número** de un paso del canon («paso 2 del
  procedimiento»). Se nombra la acción, no el número.
- `"3/5"` dentro de un `texto`, un guion por el menos, una `x` por el `×`.
- Un átomo abreviado, sin `tipo` ni `valor`.
- Campos de estado: no escribes cuántas pistas quedan, ni los segundos para la
  siguiente, ni el valor dentro del hueco, ni el ancho o el alto del recuadro. Eso es
  de la app.

### Ejemplo de salida

Química, tema 11, «Concentración en porcentaje en masa», 3º de secundaria. El canon
de ese tema fijó el ejemplo (30 g de azúcar en 170 g de agua, que da 15 %), y puso el
error en el paso 2: dividir entre la masa del agua en vez de entre la masa de la
disolución, porque «el agua es lo que va abajo». Con eso, la salida es:

```json
{
  "temaNumero": 11,
  "materia": "quimica",
  "pasoDelCanon": 2,
  "queFalta": "la masa de toda la disolución, en gramos",
  "expresion": [
    { "tipo": "texto", "valor": "30 g de azúcar en 170 g de agua. En" },
    { "tipo": "fraccion", "arriba": "masa del soluto", "abajo": "masa de la disolución" },
    { "tipo": "texto", "valor": "lo de abajo son" },
    { "tipo": "hueco" },
    { "tipo": "texto", "valor": "g" }
  ],
  "respuesta": {
    "tecleado": "200",
    "aceptaTambien": [],
    "comoSeLee": "doscientos"
  },
  "pistas": [
    {
      "orden": 1,
      "texto": "El porcentaje en masa no compara el azúcar con el agua. Compara el azúcar con todo lo que quedó en el vaso."
    },
    {
      "orden": 2,
      "texto": "Sumas la masa del soluto y la del disolvente: eso es la masa de la disolución."
    },
    {
      "orden": 3,
      "texto": "El azúcar no se fue, nada más dejó de verse. Junta los dos números del enunciado y eso es lo que va abajo."
    }
  ],
  "siTecleaElError": {
    "tecleado": "170",
    "queSeLeDice": "170 g es nada más el agua. El azúcar también está en el vaso aunque ya no se vea, y también pesa. La disolución es todo junto: vuelve al paso 2."
  },
  "noSePuede": null
}
```

Cinco cosas de ese ejemplo:

1. El hueco está en el paso 2, el mismo donde el canon puso el error.
2. La fracción lleva palabras adentro porque un hueco no cabe en una fracción; el
   hueco se pregunta aparte, en el mismo renglón.
3. La unidad (`g`) está en el renglón, no en el hueco.
4. Ninguna pista dice 200 ni 15.
5. El valor del error (170) se puede teclear, así que `siTecleaElError` no va en
   `null`.

### Antes de devolver, revísate

1. ¿El renglón tiene exactamente un `hueco`?
2. ¿`respuesta.tecleado` y cada entrada de `aceptaTambien` casan con
   `^[0-9]+(/[0-9]+)?$`?
3. ¿La unidad quedó fuera del hueco?
4. ¿`pasoDelCanon` apunta a un paso que el canon sí tiene, y el hueco es el resultado
   de ese paso y no de otro?
5. ¿Los números del renglón son los del ejemplo del canon, sin cambiarles nada?
6. ¿Ninguna `fraccion` tiene átomos adentro? ¿Ningún `simbolo` va sin `sub` ni `sup`?
7. ¿Nada de `"3/5"` en un `texto`, nada de guion por menos, nada de `x` por `×`?
8. ¿Las pistas van en orden 1, 2, 3, ninguna suelta el número de la respuesta ni
   sus dígitos, y ninguna dice el número de un paso del canon?
9. ¿`siTecleaElError.tecleado` es distinto de la respuesta correcta y de todo lo que
   `aceptaTambien` acepta?
10. ¿`noSePuede` viaja, aunque sea en `null`? ¿No hay ni un campo de estado?
11. **La lista, campo por campo.** Tacha uno por uno: `pasoDelCanon`,
    `queFalta`, `expresion`, `respuesta`, `pistas`, `siTecleaElError` y
    `noSePuede`. Adentro: `respuesta` lleva `tecleado`, `aceptaTambien` y
    `comoSeLee` —los tres, y `aceptaTambien` puede ir vacío pero tiene que
    viajar—; cada pista lleva su `texto`; `siTecleaElError` va en `null` o lleva
    `tecleado` y `queSeLeDice`. `queFalta` y `comoSeLee` son los dos que se van:
    son cortos, van pegados a campos largos y no se ven en la pantalla del diseño.
    El `orden` de las pistas no va en esta lista: lo pone quien llama.
