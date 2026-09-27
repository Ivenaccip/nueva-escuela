# Estación 6 · explicarlo con tus palabras

**Cuándo se llama:** después del paso 0. No necesita a las otras cinco estaciones.
**Sistema:** `contenido/prompts/00-sistema.md`
**Esquema:** `contenido/esquema/06-explicar.schema.json`
**Entra:** un tema del temario y el canon completo.
**Sale:** `temaNumero`, `materia`, los tres textos que la pantalla ya pinta
(`titulo`, `aclaracion`, `nota`) y la **rúbrica**, que hoy no existe en ningún
archivo.
**Ruteo:** los temas con `notacion: "lineal"`. Un tema de `tabla` o `figura`
llega aquí sólo si su canon dice que la explicación se puede pedir en palabras.

La última estación y la única sin respuesta correcta y sin pistas. Lo que aquí
se genera no es un ejercicio: es con qué se va a juzgar un texto libre que
todavía no existe. Hoy la pantalla guarda lo escrito en `useState` y el botón
`listo` sólo navega al cierre (`app/estacion/explicar.tsx:14-22`): sin rúbrica no
hay nada contra qué juzgar la explicación.

---

## Mensaje del usuario

Vas a escribir la estación 6 de un tema, la última. Aquí el estudiante ya
resolvió el tema y lo único que le queda es decir por qué funciona, escribiendo
en un campo vacío. No hay opciones, no hay hueco, no hay pistas.

Produces dos cosas distintas:

1. Los tres textos que el estudiante lee en la pantalla: la petición, la
   aclaración y la nota del pie.
2. La rúbrica: con qué se va a calificar lo que escriba. Nadie más la va a
   escribir, y la llamada que califique no va a tener el temario ni el canon a la
   vista más que a través de ella.

## El tema

- Materia: {{materia}} ({{materiaNombre}})
- Número: {{tema.numero}}
- Título: {{tema.titulo}}
- Familia: {{tema.familia}}
- Grado: {{tema.grado}}
- Al terminar, el estudiante dice: {{tema.quedaSabiendo}}
- Ya recorrió los temas: {{tema.dependeDe}}
- Error típico: {{tema.errorTipico}}

## El canon, que es ley

```json
{{canon}}
```

Los cinco pasos, su numeración, los números del ejemplo, las palabras del
vocabulario y las cotas ya están decididos. No los renombras, no los cambias y
no usas sinónimos: las otras cinco estaciones están leyendo el mismo canon sin
poder hablar contigo.

Lo que más te sirve de ahí:

- El procedimiento se llama: {{canon.procedimiento.nombre}}
- El ejemplo va de: {{canon.ejemplo.deQueVa}}
- El error se cae en el paso: {{canon.error.pasoQueCorrompe}}
- Y se cae porque el estudiante cree que: {{canon.error.creenciaDeAtras}}
- Números que puede usar el tema: {{canon.cotas.numeros}}

**Lo que no recibes:** lo que escribieron las estaciones 1 a 5. No lo necesitas
y no lo adivines. Todo lo que ellas usaron salió del mismo canon que tienes
enfrente, así que si te apoyas en el canon vas a coincidir con ellas sin haberlas
leído. No digas «como viste en el video» ni «el ejercicio anterior»: no sabes qué
decía.

## 1. La petición (`titulo`)

Es lo que la pantalla pinta en grande (`app/estacion/explicar.tsx:31`). Una sola
pregunta, concreta, sobre este tema y este ejemplo.

Concreta quiere decir que se puede contestar mal. «Explícame por qué el resultado
salió más grande que con lo que empezaste» se puede contestar mal; «explica el
tema» no, porque cualquier cosa pasa.

De dónde sale la buena: del hueco que deja el paso {{canon.error.pasoQueCorrompe}}
del canon. Es el paso donde alguien que sólo memorizó el procedimiento se cae, y
por eso es el único lugar donde una explicación con palabras dice algo que las
estaciones 3, 4 y 5 no pudieron medir.

Sirven:

- «Explícame por qué la distancia va arriba y el tiempo abajo.»
- «Explícame por qué el resultado salió más grande que con lo que empezaste.»
- «Explícame por qué los dos lados tienen que quedar con el mismo número de
  átomos.»

No sirven:

- «Explica el tema.» · «Dime qué aprendiste.» · «Resume lo que viste en el
  video.» Eso se contesta repitiendo el resumen.
- «¿Cuál es la fórmula de la rapidez?» Eso no es una explicación, es un dato.
- «Explica los cinco pasos.» Eso es la lista, y la lista ya la tiene.
- Dos preguntas en una. Una sola.

En el relleno del diseño el título dice «Explícamelo como si yo no supiera»
(`src/contenido/demo.ts`). Sirve para ver la pantalla, no como modelo: no dice
de qué.

**La petición va en palabras, no en símbolos.** Los tres textos de esta pantalla
son cadenas planas que `<Text>` pinta tal cual: aquí no hay fracciones apiladas
ni subíndices, porque esta pantalla no usa `Expresion`. Entonces:

- Una fracción se dice con palabras: «tres quintos entre un cuarto». Nunca
  `3/5` en un renglón: eso está prohibido en todo el proyecto (`AGENTS.md`).
- Una fórmula con subíndice se dice por su nombre: «agua», «dióxido de carbono».
  No `H2O` pelón, que se lee mal.
- Los números sueltos del canon sí se escriben con cifras: 120, 15, 8.
- Las unidades se escriben como se escriben cuando no llevan exponente: metros,
  segundos, «metros por segundo».

## 2. `aclaracion` y `nota`

`aclaracion` son las dos o tres líneas debajo del título
(`app/estacion/explicar.tsx:32`). Dicen tres cosas: que va con sus palabras, que
aquí no hay nada que copiar, y que no hay pistas a propósito. Y acotan la
petición: de qué tiene que hablar y de qué no hace falta.

`nota` es la línea chica del pie (`app/estacion/explicar.tsx:53`): que puede
discutir lo que se le conteste. Escríbela sabiendo que tus `contraargumentos`
son lo único que la sostiene. Si no hay con qué contestarle, esta línea es una
promesa vacía.

Ninguna de las dos adelanta la respuesta. Si la aclaración ya explica el tema, el
campo de abajo no mide nada.

## 3. La rúbrica

Aquí está el trabajo. Piensa en quién la va a leer: otra llamada, que ve el texto
del estudiante y tu rúbrica, y nada más. No tiene el temario, no vio el video y
no puede inventar criterios.

### `ideasQueCuentan` (2 a 4)

Las ideas que tienen que aparecer para que la explicación cuente como entendida.

- Son **ideas, no frases**. El estudiante las puede decir con las palabras que
  quiera, en el orden que quiera, sin usar ni una palabra del vocabulario.
- Salen del `porQue` de los pasos del canon, no de campos nuevos.
- Ninguna es el procedimiento repetido. «Hay que voltear la segunda fracción» es
  el truco, no una idea: eso va en `suenanBienYNoDicen`.
- Dos o tres bastan casi siempre. Cuatro es el techo, y una lista de cuatro ya se
  parece a una lista de palabras obligatorias.
- `comoSuenaDicha` es la misma idea escrita como la escribiría un chavo de
  {{tema.grado}}. Es lo que le permite a la segunda llamada reconocer la idea
  cuando viene dicha de otro modo. Si no puedes escribirla así, la idea está
  redactada como definición y hay que bajarla.
- `porQueImporta` dice qué se cae si la idea falta. Si la respuesta honesta es
  «nada», la idea no va en la lista.
- `esImprescindible` va en `true` en **exactamente una**: la que contesta el
  `titulo`. En las demás, `false`.

### Cuál es la imprescindible

De las ideas que escribas, casi siempre una contesta la pregunta que hiciste y las
otras sirven para **cachar el error**. No son lo mismo, y la diferencia decide si
la estación mide algo.

En el ejemplo de abajo el `titulo` es «Explícame por qué la distancia va arriba y
el tiempo abajo». Tres ideas, `minimoParaContar` en 2. Sin marcar la
imprescindible, un estudiante que escribe las ideas 2 y 3 —«al revés me da el
tiempo de cada metro» y «si me sale segundos sobre metros la puse al revés»—
cuenta como entendido sin haber dicho nunca por qué los metros van arriba. Las dos
ideas que aprobó son señales para detectar el error, no la razón: eso es saberse el
truco de detectar el truco.

La segunda llamada no ve más que tu rúbrica. Si no marcas cuál de las tres no era
opcional, no tiene forma de saberlo.

### `minimoParaContar`

Cuántas de esas ideas tienen que aparecer para que la explicación cuente. Nunca
más que el número de ideas de la lista. Pedir todas es pedir un párrafo completo
a un chavo de 12 años escribiendo en un teléfono: pídelas todas sólo cuando de
verdad todas son imprescindibles.

**La explicación cuenta si aparecen al menos `minimoParaContar` ideas Y entre
ellas la imprescindible.** El mínimo es un número; la imprescindible es una
condición aparte, y las dos se tienen que cumplir. Sin eso, el estudiante puede
aprobar con las ideas que sirven para cachar el error y no con la que contesta la
pregunta.

### `suenanBienYNoDicen` (2 a 4)

Respuestas que parecen buenas y no dicen nada. Son el caso que la segunda llamada
va a fallar si tú no lo escribes: se ven correctas y el estudiante se va creyendo
que entendió.

El caso clásico, y casi siempre uno de los tuyos: **repetir el truco con otras
palabras**, o nombrar la fórmula sin decir qué significa. Los otros dos que más
salen: la regla que se cae con otros números, y «así lo hicimos en clase».

Escríbelas en primera persona, como las escribiría el estudiante, y que suenen
bien de verdad: una respuesta mala a la vista no le sirve de nada a quien
califica.

`queLaDelata` es la señal, dicha para quien califica. `queLeFalta` nombra cuál de
las `ideasQueCuentan` no apareció, para que se le pueda pedir sin regalársela.

### `contraargumentos` (2 a 4)

Esto es lo que hace honesta la nota del pie. Si el estudiante puede discutir la
respuesta, alguien tiene que saber qué contestarle.

Cada uno es: si dice esto, se le contesta esto, y con eso queda a la vista esta
idea.

- Uno atiende la creencia de {{canon.error.creenciaDeAtras}}, que es la que más
  va a aparecer escrita.
- Uno atiende a quien sí entendió y no sabe cómo escribirlo. Ése no necesita que
  le expliquen otra vez: necesita una pregunta corta que pueda contestar.
- **Cuando el canon trae `erroresSecundarios`, uno de tus `contraargumentos` o una
  de tus `suenanBienYNoDicen` sale de `erroresSecundarios[0]`.** Es la confusión
  que no cupo en `error`, y esta estación y la 2 son las dos únicas que pueden
  recogerla: si tú la dejas fuera, se pierde del tema entero.
- Si lo que el estudiante dice es cierto a medias, `seLeContesta` **le concede la
  parte cierta** antes de empujar. Negarle algo que él ya vio con sus ojos lo
  enseña a no discutir.
- `seLeContesta` no le da la explicación completa. Da una razón y, cuando se
  pueda, una pregunta que él mismo puede resolver con el ejemplo del canon.
- `aDondeLoEmpuja` dice qué idea de `ideasQueCuentan` queda a la vista si acepta
  el empujón. Sin eso, la contestación es nada más tener la última palabra.

### `ejemploQueSiCuenta`

Una explicación completa que sí cuenta, en primera persona, de dos a cuatro
frases, escrita como la escribiría un estudiante de {{tema.grado}}: no como la
escribirías tú. Es el **piso** de lo que cuenta, no la mejor explicación posible.
Quien califica lo va a usar de referencia, así que si lo escribes demasiado bien,
va a reprobar a medio mundo.

### `noCuentaEnContra`

Lo que no se le puede quitar: la ortografía, los acentos, que escriba corto, que
no use ni una palabra del vocabulario, que no ponga ningún número. Se califica la
idea, no la redacción. Sin esta lista, la segunda llamada se pone a corregir
ortografía y el estudiante aprende que lo que importaba era escribir bonito.

## Para qué sirve la rúbrica: la segunda llamada

Lo que el estudiante escriba **no se califica aquí**. Tu salida se guarda con el
tema. Cuando el estudiante toca `listo`, la app hace una segunda llamada:

- de sistema va el mismo `contenido/prompts/00-sistema.md`, sin cambios;
- de usuario va el prompt de calificación —otro archivo, que todavía no existe—
  y dentro de él, pegados tal cual: el objeto completo que devuelves aquí
  (`titulo`, `aclaracion`, `nota` y `rubrica`), el canon del tema, y el texto que
  el estudiante escribió;
- de salida sale si cuenta o no cuenta, cuál idea le faltó, y qué se le contesta.

Esa llamada no ve nada más. De ahí todo lo de arriba:

- una idea que no esté en `ideasQueCuentan` no se le va a pedir;
- una respuesta hueca que no esté en `suenanBienYNoDicen` se va a aceptar;
- un desacuerdo que no esté en `contraargumentos` se va a contestar con «te falta
  algo», sin decir qué sigue.

## Lo que no haces

- No pides «explica el tema», «dime qué aprendiste» ni «resume el video».
- No metes dos preguntas en el `titulo`.
- No adelantas la respuesta en la `aclaracion`.
- No escribes ninguna fracción con diagonal, ningún subíndice ni ningún
  superíndice en ningún campo: los tres textos y la rúbrica son texto plano.
- No usas números que no estén en el canon ({{canon.cotas.numeros}}).
- No devuelves `borrador`: lo que el estudiante lleva escrito es estado de la
  app, no contenido.
- No inventas campos ni criterios de fuera del esquema: ni puntaje, ni
  porcentaje, ni nivel, ni monedas, ni pistas. Esta estación no tiene pistas y no
  reparte puntos.
- No escribes una idea que sólo se pueda reconocer si aparece una palabra
  exacta. Si `comoSuenaDicha` es la única forma de decirla, la idea está mal.
- No repites la misma idea en `ideasQueCuentan` y en `suenanBienYNoDicen` con
  otras palabras: una es la razón y la otra es el truco, y no se parecen.
- No mencionas la app, la estación, el sistema ni la IA dentro de los textos que
  el estudiante lee.
- No copias el estilo sin acentos de las descripciones del esquema: lo que el
  estudiante lee va con sus acentos y su puntuación.

## `noSePuede`

Siempre viaja. `null` cuando el tema se puede explicar con palabras, que es casi
siempre: aquí no hay teclado que limite nada, el campo es un `TextInput` libre
(`app/estacion/explicar.tsx:37-45`).

Se llena cuando la única pregunta que valdría la pena necesita algo que el
estudiante nunca vio en pantalla: una gráfica, una recta numérica, un diagrama.
Antes de llenarlo, intenta una vez pedir el por qué de otra parte del
procedimiento que sí se pueda decir en palabras. Si al reformular la pregunta
deja de hablar de lo que el tema enseña, entonces sí llénalo y di qué falta.

## Un ejemplo completo

Física, tema 4, «Rapidez: metros por segundo», 6º de primaria. El canon que
llegó, en corto. Es el mismo recorte que aparece en `04-escalera.md`, palabra por
palabra: los dos prompts reciben el mismo canon y no pueden pintarlo distinto.

- `procedimiento.nombre`: «Calcular la rapidez de algo que se mueve».
- Los cinco pasos: 1 sacas la distancia del enunciado · 2 sacas el tiempo ·
  3 revisas que las dos unidades combinen · 4 divides la distancia entre el
  tiempo · 5 escribes el resultado con su unidad.
- `ejemplo`: alguien recorre 120 m en 15 s. Resultado 8 m/s, «ocho metros por
  segundo».
- `error`: divide al revés, el tiempo entre la distancia. `pasoQueCorrompe`: 4.
  `creenciaDeAtras`: cree que en una división el número grande va arriba.
  `comoSeCacha`: la unidad sale al revés, s/m, y «segundos por metro» no dice qué
  tan rápido va.
- `erroresSecundarios[0]`: mezcla metros con horas sin revisarlo.
  `creenciaDeAtras`: cree que las unidades son una etiqueta que se pega al final,
  no algo que tenga que combinar antes de dividir.
- `cotas.numeros`: enteros de hasta tres cifras, la división siempre sale exacta;
  distancias de 50 a 900 m, tiempos de 10 a 180 s.
- `formaDeRespuesta`: `numero`. `notacion`: `lineal`.

Y la salida:

```json
{
  "temaNumero": 4,
  "materia": "fisica",
  "titulo": "Explícame por qué la distancia va arriba y el tiempo abajo.",
  "aclaracion": "Con tus palabras, sin escribir la fórmula. Aquí no hay pistas ni nada que copiar, y eso es a propósito: quiero leer cómo lo piensas.",
  "nota": "Si no estás de acuerdo con lo que te conteste, escríbelo y lo discutimos.",
  "rubrica": {
    "ideasQueCuentan": [
      {
        "idea": "La rapidez dice cuántos metros avanza en un segundo, y para saber eso hay que repartir los 120 metros entre los 15 segundos.",
        "porQueImporta": "Sin esta idea, el orden de la división es algo que hay que recordar. Con ella, el orden es el único posible: lo que se reparte son los metros.",
        "comoSuenaDicha": "Divido para saber cuánto avanza en un segundo, y lo que avanza son metros.",
        "esImprescindible": true
      },
      {
        "idea": "Si divides al revés no te sale un error: te sale otra cosa, cuánto tiempo le costó cada metro.",
        "porQueImporta": "Quien cree que al revés está mal a secas se queda sin piso cuando alguien sí pide segundos por metro, y vuelve a dudar del orden.",
        "comoSuenaDicha": "Al revés me dice el tiempo de cada metro, que no es qué tan rápido va.",
        "esImprescindible": false
      },
      {
        "idea": "La unidad delata el orden: metros por segundo trae los metros arriba y los segundos abajo.",
        "porQueImporta": "Es la única forma de cachar el error sin volver a hacer la cuenta, y es lo que la estación 5 va a pedir.",
        "comoSuenaDicha": "Si me sale segundos sobre metros, la puse al revés.",
        "esImprescindible": false
      }
    ],
    "minimoParaContar": 2,
    "suenanBienYNoDicen": [
      {
        "respuesta": "Porque la fórmula de la rapidez es distancia entre tiempo.",
        "queLaDelata": "Nombra la fórmula y se detiene ahí. No dice qué significa el 8 que salió, así que tampoco podría decir por qué no es al revés.",
        "queLeFalta": "Que diga qué queda repartido en qué: los metros repartidos en los segundos."
      },
      {
        "respuesta": "Porque el número grande va arriba y el chico abajo.",
        "queLaDelata": "Es una regla sobre el tamaño de los números, no sobre lo que miden. Con 12 metros en 15 segundos la regla se cae sola.",
        "queLeFalta": "Que diga que arriba va lo que se reparte, sin importar cuál de los dos números sea más grande."
      },
      {
        "respuesta": "Porque así lo hicimos en clase y así me sale bien.",
        "queLaDelata": "La razón que da es de dónde viene el procedimiento, no qué hace. Es la respuesta de quien lo aprendió de memoria.",
        "queLeFalta": "Que diga qué significa el número que le salió: cuántos metros por cada segundo."
      },
      {
        "respuesta": "Porque arriba va la distancia y abajo el tiempo, y el tiempo son los segundos o las horas, da igual.",
        "queLaDelata": "Acomoda bien los dos lugares y luego trata la unidad como una etiqueta que se pega al final. Con metros arriba y horas abajo el número que sale no es metros por segundo, y él no lo revisaría.",
        "queLeFalta": "Que diga que arriba va lo que se reparte y abajo en cuántos pedazos, y que los dos tienen que estar en unidades que combinen antes de dividir."
      }
    ],
    "contraargumentos": [
      {
        "siDice": "Da igual cómo la pongas, nada más es el resultado volteado.",
        "seLeContesta": "Sí es el número volteado, y aun así no contesta lo mismo. Dividir 15 entre 120 dice cuánto tiempo le costó cada metro. Es un dato verdadero, pero no es la rapidez. ¿Cuál de los dos te sirve para saber si va más rápido que otro corredor?",
        "aDondeLoEmpuja": "A ver que las dos divisiones contestan preguntas distintas, que es la primera idea de la lista."
      },
      {
        "siDice": "La rapidez es distancia entre tiempo porque así está definida.",
        "seLeContesta": "Una definición dice cómo se llama algo, no por qué se hace así. Aquí la razón alcanza: reparto 120 metros en 15 segundos y me toca lo que avanza en cada segundo. Dime ese número y dime qué mide.",
        "aDondeLoEmpuja": "A cambiar así es por esto es lo que se reparte, que es lo que le va a servir cuando cambien las unidades."
      },
      {
        "siDice": "Sí entendí, nada más no sé cómo escribirlo.",
        "seLeContesta": "Entonces contesta una sola cosa: en un segundo, ¿cuántos metros avanzó? Si ese número te sale, ya está explicado. Escribe eso y nada más.",
        "aDondeLoEmpuja": "A que vea que la idea ya la tiene y lo que falta es decirla corta."
      }
    ],
    "ejemploQueSiCuenta": "La rapidez es cuántos metros avanza en un segundo. Tengo 120 metros repartidos en 15 segundos, así que reparto los metros entre los segundos y me tocan 8 en cada uno. Si lo hago al revés me sale cuánto tiempo le costó cada metro, que también se puede calcular, pero no es lo que me preguntaron.",
    "noCuentaEnContra": [
      "La ortografía, los acentos y que escriba todo en minúsculas.",
      "Que no use las palabras rapidez, distancia ni tiempo: si dice cuánto avanza en un segundo, ya dijo la idea.",
      "Que no escriba ningún número: la idea cuenta sin hacer la cuenta."
    ]
  },
  "noSePuede": null
}
```

Tres cosas de ese ejemplo:

- La petición no es «explica qué es la rapidez». Es la pregunta que el paso 4
  deja abierta, y es exactamente la que el error típico contesta mal.
- La idea 1 es la imprescindible: es la única que contesta el `titulo`. Las ideas
  2 y 3 sirven para cachar el error, y un estudiante que sólo escriba esas dos
  llega al mínimo de 2 y **no** cuenta, porque le falta la imprescindible.
- La cuarta `suenanBienYNoDicen` sale de `erroresSecundarios[0]`: es la confusión
  de las unidades, que no cupo en `error` y que si esta estación no recoge, se
  pierde del tema entero.
- Ninguna de las ideas dice «divide la distancia entre el tiempo». Ése es el
  truco, y por eso aparece en `suenanBienYNoDicen`, no en `ideasQueCuentan`.
- El contraargumento del resultado volteado **le concede** que sí es el número
  volteado. Es cierto, el estudiante ya lo vio, y negárselo sería enseñarle que
  discutir no sirve.

## Antes de devolver, revísate

1. ¿El `titulo` es una sola pregunta, y se puede contestar mal?
2. ¿Se puede contestar con el ejemplo del canon en dos o tres frases, sin haber
   visto el video?
3. ¿Ninguna de las `ideasQueCuentan` es el procedimiento dicho con otras
   palabras?
4. ¿La idea marcada `esImprescindible` es la que contesta el `titulo`, y no una de
   las que sirven para detectar el error? ¿Es exactamente una?
5. ¿`minimoParaContar` no pasa del número de ideas de la lista?
6. ¿Cada `respuesta` de `suenanBienYNoDicen` suena lo bastante bien para que
   alguien la escriba de verdad?
7. ¿Uno de los `contraargumentos` sale de {{canon.error.creenciaDeAtras}}?
8. ¿Otro atiende a quien entendió y no sabe escribirlo?
9. ¿Si el canon trajo `erroresSecundarios`, alguna `suenanBienYNoDicen` o algún
   `contraargumento` sale de `erroresSecundarios[0]`?
10. ¿La `nota` promete algo que los `contraargumentos` sí pueden cumplir?
11. ¿Ningún campo trae una fracción con diagonal, un subíndice o un superíndice?
12. ¿Cero campos de estado: ni `borrador`, ni pistas, ni puntaje, ni monedas?
13. ¿`noSePuede` viaja, aunque sea `null`?
14. **La lista, campo por campo.** Tacha uno por uno: `titulo`,
    `aclaracion`, `nota`, `rubrica` y `noSePuede`. Los tres primeros son los que la
    pantalla pinta y van los tres, no dos. `rubrica` lleva los seis:
    `ideasQueCuentan`, `minimoParaContar`, `suenanBienYNoDicen`,
    `contraargumentos`, `ejemploQueSiCuenta` y `noCuentaEnContra`. Adentro: cada
    idea lleva `idea`, `porQueImporta`, `comoSuenaDicha` y `esImprescindible`; cada
    `suenanBienYNoDicen` lleva `respuesta`, `queLaDelata` y `queLeFalta`; cada
    contraargumento lleva `siDice`, `seLeContesta` y `aDondeLoEmpuja`. Los dos que
    se van son `ejemploQueSiCuenta` y `noCuentaEnContra`: cierran la rúbrica, que
    ya es larga, y para entonces la atención se fue en los contraargumentos.
