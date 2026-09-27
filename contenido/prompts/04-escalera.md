# Estación 4 · la escalera

**Cuándo se llama:** después del canon (paso 0). No depende de las otras cinco
estaciones y no habla con ellas.
**Sistema:** `contenido/prompts/00-sistema.md`
**Esquema:** `contenido/esquema/04-escalera.schema.json`
**Entra:** un tema del temario (`contenido/temarios/<materia>.json`) más su canon.
**Sale:** `temaNumero`, `materia`, `escalones[]` (de tres a cinco) y `noSePuede`.

La estación 3 enseña un paso del procedimiento con el ejemplo del canon. La 4 lo
usa otra vez con datos distintos, y en el último escalón lo usa al revés. Quien
sólo memorizó aguanta los primeros escalones y se cae en el último: ahí está la
diferencia entre entender y repetir.

---

## Mensaje del usuario

Vas a escribir la escalera de un tema: de tres a cinco escalones del mismo
procedimiento, con datos que cambian y dificultad que sube.

### Lo que recibes

- El tema del temario, abajo.
- El canon completo, abajo. Es ley.
- Nada más. No recibes lo que escribieron las otras cinco estaciones y no hay
  manera de preguntárselo. Por eso existe el canon: es lo único que compartes
  con ellas. Si te sales de él, el estudiante ve dos procedimientos distintos
  para el mismo tema y concluye que no entendió nada.

### El tema

- Materia: {{materiaNombre}} (`{{materia}}`)
- Número: {{tema.numero}}
- Título: {{tema.titulo}}
- Familia: {{tema.familia}}
- Grado: {{tema.grado}}
- Al terminar, el estudiante dice: {{tema.quedaSabiendo}}
- Depende de los temas: {{tema.dependeDe}}
- Error típico: {{tema.errorTipico}}
- Los cinco pasos, en borrador: {{tema.losCincoPasos}}
- Notación que pide el tema: {{tema.notacion}}

`dependeDe` te marca el techo: un escalón no puede necesitar nada que no esté en
este tema ni en los que aparecen ahí. Si para resolverlo hace falta un tema
posterior, no es un escalón más difícil, es otro tema.

### El canon

```json
{{canon}}
```

De todo eso, lo que la escalera usa a cada rato:

- Procedimiento: {{canon.procedimiento.nombre}}
- El ejemplo canónico va de: {{canon.ejemplo.deQueVa}}
- Los números que el tema puede usar: {{canon.cotas.numeros}}
- Lo que el estudiante cree cuando se equivoca: {{canon.error.creenciaDeAtras}}

Los cinco pasos, su numeración, las palabras del vocabulario y las cotas no se
tocan. No renombras un paso, no usas un sinónimo de una palabra del vocabulario
y no te sales de los números de `cotas`.

---

## La forma de la escalera

Cinco escalones cuando el tema aguanta cinco; nunca menos de tres. La pantalla
dibuja una barrita por escalón (`app/estacion/escalera.tsx:52-66`), así que tres
se ven bien y cinco también.

La subida tiene una forma fija:

1. **El primer escalón arranca parado.** Es casi el ejemplo del canon: los
   mismos números o unos igual de chicos, la misma situación de siempre. Sirve
   para que el estudiante confirme que sí puede, no para filtrarlo. Si el primer
   escalón ya cuesta, la escalera no empieza.
2. **Los de en medio suben por la forma en que vienen los datos, no por el
   tamaño de la cuenta.** La aritmética se queda congelada en el nivel del
   escalón 1: los mismos rangos, la misma dificultad de multiplicar y dividir. Lo
   que sube es otra cosa:

   - un dato que hay que sacar de la frase en vez de venir dado («salió a las 7 y
     llegó a las 7 con 1 minuto»);
   - un dato de sobra que no se usa, y hay que darse cuenta;
   - los dos datos dados en el orden contrario al de la cuenta;
   - el resultado que hay que interpretar, además de calcular.

   **Un escalón cuya única dificultad nueva es una cuenta más pesada no mide el
   tema: mide aritmética.** Un estudiante que entendió perfectamente qué es la
   rapidez y no trae la tabla del 9 falla ese escalón, gasta sus tres pistas, y
   las pistas le enseñan a dividir en vez de enseñarle rapidez. La app registra
   «no pudo con el tema», y no es cierto. No entender el concepto y no traer la
   aritmética son dos cosas distintas, y un maestro nunca las confunde.

   El procedimiento es el mismo, paso por paso.
3. **El último, o el penúltimo, es el problema inverso.** Le das el resultado y
   le quitas un dato de entrada. En el diseño se ve así: «el maestro borró el
   divisor sin querer al limpiar el pizarrón». Para resolverlo, el estudiante
   tiene que saber qué hace cada paso, no en qué orden van.

Un escalón inverso y nada más, salvo que el tema dé para dos: uno al que le
falta un dato y otro al que le falta el otro. El inverso nunca es el escalón 1.
Lo marcas con `esInverso: true`.

En `pasoDelCanon` dices sobre cuál de los cinco pasos cae el hueco. En los
escalones normales suele ser el paso de la cuenta; en el inverso, el paso donde
se sacaba el dato que borraste. Si el hueco cae en un paso que el canon no
enseñó, el escalón está mal.

---

## Las situaciones

**Una frase, y el esquema la corta a 125 caracteres.** Ese número está medido en
la pantalla, no puesto a ojo: son los cuatro renglones que caben antes de que la
tarjeta del ejercicio se empiece a ir para abajo. Unas veinte palabras.
Cuéntalas. Es el límite que más se rompe, y se rompe por escribir dos oraciones
donde cabe una.

```
[112] sí   En el taller cortan 2/3 de una tabla en pedazos de 1/6 de tabla cada
           uno. Necesitan saber cuántos pedazos salen.

[164] no   Un jardinero repartió 4/5 de litro de agua entre 2/3 de litro que cada
           maceta necesita. El apunte se manchó y no se leyó cuántos litros se
           repartieron al principio.
[118] sí   Al jardinero se le manchó el apunte: dio 2/3 de litro a cada maceta y
           ya no se lee con cuántos empezó.
```

Lo que sobra casi siempre es la segunda oración explicando qué hay que hacer.
Eso no va aquí: la pregunta lo dice.

**Los escalones inversos son los que se pasan.** Como hay que decir qué se sabe y
qué se borró, sale la tentación de contarlo en dos oraciones. Cabe en una, con
dos puntos:

```
[167] no   El maestro escribió que en el mercado dividieron 3/4 de un paquete de
           azúcar entre porciones, y salieron 9/2 de porciones. Pero borró de qué
           tamaño eran las porciones.
[103] sí   Al maestro se le borró el tamaño de las porciones: de 3/4 de paquete
           salieron 9/2 de porción.

[176] no   Una costurera apuntó que dividió un trozo de cinta entre porciones de
           2/9 de metro, y le salieron 6 porciones. Se le mojó el apunte donde
           venía cuánta cinta tenía al principio.
[ 99] sí   A la costurera se le mojó el apunte: de su cinta salieron 6 porciones
           de 2/9 de metro cada una.
```

El patrón que sirve: **quién y qué se perdió, dos puntos, los datos que quedan.**

Mexicana y ordinaria: la tiendita, el camión, el tinaco, la receta,
el recibo de luz, la cancha, la libreta donde se apuntan los pendientes.

La situación pone los datos y la escena, y nada más. No explica el
procedimiento: eso ya pasó en la estación 3.

Cinco escalones son cinco escenas distintas. Cambiar el número y dejar la misma
tiendita cinco veces no es una escalera, es la misma pregunta cinco veces.

Prohibido:

- **«Juan tiene 3 manzanas.»** Nadie ha vivido eso. Nada de nombres propios
  inventados de protagonista: le pasa a ti, o a alguien por su oficio (el
  repartidor, la señora de la tiendita, el entrenador).
- **El problema de libro.** Trenes que salen de dos ciudades, albercas con dos
  llaves, obreros que cavan zanjas.
- **Inventar un dato que se puede verificar.** Ni la distancia real entre dos
  estaciones del metro, ni el precio de algo, ni una marca, ni una cifra
  oficial. Los números del escalón son del ejercicio, no del mundo.
- **La escena de adorno.** Si le quitas la situación y el ejercicio es el mismo,
  la situación no estaba haciendo nada.

---

## El renglón

El renglón se arma con los cuatro átomos, y no hay más:

| Átomo | Se ve así |
|---|---|
| `{"tipo":"texto","valor":"÷"}` | palabras y signos sueltos: `+ − × ÷ = < > ≈ →` |
| `{"tipo":"fraccion","arriba":"120 m","abajo":"15 s"}` | apilada de verdad, con su raya |
| `{"tipo":"simbolo","valor":"s","sup":"2"}` | subíndice, superíndice, carga, unidad |
| `{"tipo":"hueco"}` | el recuadro que el estudiante llena |

Reglas duras:

- **Un solo `hueco` por renglón.** La pantalla escribe lo tecleado en todos los
  huecos a la vez (`src/componentes/Expresion.tsx:104`): con dos, el estudiante
  ve su respuesta duplicada.
- **El `hueco` va pelón:** `{"tipo":"hueco"}`. Sin valor, sin ancho, sin alto.
  La respuesta correcta viaja en `respuesta`.
- **Dentro de una fracción no caben átomos.** `arriba` y `abajo` son una cadena
  de un renglón (`src/componentes/Fraccion.tsx:19-45`). Un hueco no puede ser el
  numerador ni el denominador de una fracción.
- **Por eso el inverso se escribe con `÷`.** Cuando el hueco cae donde iría el
  numerador o el denominador, sacas la división de la fracción y la escribes en
  un renglón: `400 ÷ [hueco] = 5`. No hay otra forma.
- **Nunca `"3/5"` en un renglón.** Eso es una `fraccion`. La diagonal en `texto`
  sólo vale dentro de una unidad compuesta (`m/s`, `mg/L`).
- **Un `simbolo` sin `sub` ni `sup` es `texto`.** El esquema lo rechaza.
- **El menos es `−` (U+2212), no un guion.** El por es `×`, no `x` ni `*`.

### El renglón mide 310 px

La pantalla dibuja el renglón a 32 px dentro de una tarjeta de 350
(`app/estacion/escalera.tsx:79-84`), y le quedan unos 310 px de ancho. Eso son
más o menos catorce caracteres de texto, más una fracción, más el hueco. Lo que
no cabe se envuelve: se sigue leyendo, pero deja de verse como un renglón.

Aprieta: **de tres a cinco átomos**, ocho es el tope duro. Las palabras van en
la situación y en la pregunta, no en el renglón.

### Las unidades no se teclean

El hueco recibe sólo el número. La unidad vive en la situación y en la pregunta
(«¿cuántos metros por segundo?»), nunca dentro del hueco.

Una fracción sí aguanta la unidad adentro: `arriba: "120 m"`, `abajo: "15 s"`.
Un renglón con `÷` no, porque se alarga y se envuelve; ahí la unidad se queda en
la situación y el renglón lleva números pelones.

---

## La pregunta

Una frase corta que dice **qué** va en el hueco, con su unidad. «¿Cuántos
metros por segundo avanza el camión?», «¿Qué fracción iba en el hueco?». No
repite la situación y no explica el procedimiento.

---

## La respuesta

`respuesta.tecleado` es lo que el estudiante escribe, y tiene que casar con:

```
^[0-9]+(/[0-9]+)?$
```

Dígitos, o dígitos con una diagonal. El campo de la estación 4 es un
`TextInput` del sistema (`app/estacion/escalera.tsx:86-95`) y físicamente acepta
letras, pero por contrato pide lo mismo que el teclado de doce teclas de la
estación 3 (`app/estacion/completar.tsx:23-28`). Sin punto decimal, sin signo
menos, sin letras, sin paréntesis, sin espacios.

`aceptaTambien` son las otras formas que también das por buenas: `["6/8"]`
cuando la buena es `3/4` y el tema todavía no enseña simplificar. Si el tema sí
enseña simplificar, no aceptes la forma sin simplificar: déjalo vacío.

`comoSeLee` es el número del hueco dicho en palabras, con su unidad, para el
lector de pantalla: «ocho metros por segundo». La unidad se dice aunque no se
teclee.

---

## Las pistas

Dos o tres por escalón, y suben:

1. **Reencuadra.** Dice de qué va la pregunta con otras palabras. No da ningún
   número nuevo.
2. **Señala el paso.** Nombra la acción del paso del canon que toca aquí, con
   los números de este escalón: «divides la distancia entre el tiempo: 120 entre
   15». Nombra la acción, **no el número del paso**: el estudiante no lleva la
   numeración en la cabeza. Es la misma regla que la estación 3, y está escrita en
   `CONTRATO.md` §3.
3. **Se acerca hasta casi tocarla.** Deja la cuenta planteada, o dice qué número
   buscar, o apunta a la estructura del renglón.

**Ninguna pista contiene el número de la respuesta, ni su fracción, ni sus
dígitos por separado, ni la descomposición que los arma.** Es la misma regla que
la estación 3, con las mismas palabras, y aquí aprieta igual: «nueve por diez son
90, y los 54 que faltan son otros seis nueves» dice diez y seis, o sea dice 16.
El estudiante que esperó los segundos para ganarse esa pista ya no tiene nada que
resolver, y la estación 4 es justo la que separa entender de repetir.

Con dos pistas, escribes la 1 y la 2. Los escalones difíciles llevan tres.

Las pistas del escalón inverso no explican el procedimiento otra vez: apuntan a
que aquí el resultado ya está dado y lo que falta es un dato de entrada.

---

## Prohibido

- Más de un `hueco` en un renglón.
- Un `hueco` dentro de una fracción, o pedir el numerador o el denominador.
- Una respuesta con decimal, con signo negativo, con letras o con unidad.
- Un resultado que no sea entero ni fracción exacta. Si la división no cierra,
  cambia los números.
- Salirte de `cotas.numeros`, de `cotas.unidades` o de los símbolos de `cotas`.
- Renombrar un paso del canon, cambiar el ejemplo del canon o usar un sinónimo
  de una palabra del vocabulario.
- Un escalón que enseñe un procedimiento distinto al del canon, aunque llegue al
  mismo resultado.
- Que el escalón 1 sea el más difícil, o que el inverso sea el 1.
- Dos escalones con la misma situación y los números cambiados.
- **Un escalón cuya única dificultad nueva es una cuenta más pesada.** Si un
  estudiante que entiende el tema puede fallarlo por la aritmética, el escalón
  mide otra cosa. La aritmética de los escalones 2 a 5 se queda en el tamaño de la
  del escalón 1.
- Una pista que escriba la respuesta, sus dígitos por separado, o la suma o el
  producto que la arma.
- Una pista que diga el número de un paso del canon.
- Un átomo abreviado, sin `tipo` ni `valor`.
- Poner en el esquema algo que es de la app: en cuál escalón va el estudiante,
  cuántas pistas le quedan, los segundos para la siguiente, lo que trae
  tecleado. Tú entregas un arreglo; el progreso lo deriva la pantalla.

---

## Cuándo llenas `noSePuede`

`null` cuando la escalera salió completa.

Lo llenas cuando el procedimiento del tema no se puede practicar con este
teclado ni con estos cuatro átomos: la respuesta es una palabra, es un trazo,
es un decimal, es un negativo, o el renglón necesita una tabla o un dibujo.

Antes de rendirte, intenta **una** reformulación: pedir el numerador en vez del
resultado, pedir el número que se compara en vez de «se hunde», pedir `8/10` en
vez de `0.8`. Si la reformulación cambia lo que el tema enseña, entonces sí
llena `noSePuede` y di qué hace falta.

Un escalón que la pantalla no puede dibujar es peor que un escalón que no
existe: el estudiante se traba y cree que el que está mal es él.

---

## Un ejemplo completo

**El tema** (Física 4, tal cual del temario):

- Título: Rapidez: metros por segundo · Familia: movimiento · Grado: 6º primaria
- Error típico: divide al revés, tiempo entre distancia.
- Notación que pide el tema: fracción apilada con unidades dentro, y el hueco
  aceptando una unidad compuesta tecleada (`m/s`).

El temario pide que el hueco acepte `m/s`. El teclado no tiene letras, así que
la unidad se queda en la pregunta y el hueco recibe el número. Ésa es la
reformulación que sí se permite: no cambia lo que el tema enseña, y por eso este
tema **no** llena `noSePuede`.

**El canon que entra** (recortado a lo que la escalera usa). Es el mismo recorte
que aparece en `06-explicar.md`, palabra por palabra: los dos prompts reciben el
mismo canon y no pueden pintarlo distinto.

- Procedimiento: «Calcular la rapidez de algo que se mueve».
- Pasos: 1 sacas la distancia del enunciado, 2 sacas el tiempo, 3 revisas que las
  dos unidades combinen, 4 divides la distancia entre el tiempo, 5 escribes el
  resultado con su unidad.
- Ejemplo: alguien recorre 120 m en 15 s. Resultado 8 m/s, «ocho metros por
  segundo».
- Error: divide al revés, tiempo entre distancia. `pasoQueCorrompe`: 4.
  `creenciaDeAtras`: cree que en una división el número grande va arriba.
- Cotas: enteros de hasta tres cifras, la división siempre sale exacta;
  distancias de 50 a 900 m, tiempos de 10 a 180 s; resultados enteros en m/s, sin
  decimales.

**La salida:**

```json
{
  "temaNumero": 4,
  "materia": "fisica",
  "escalones": [
    {
      "situacion": "Vas en el camión de la ruta y cuentas: pasa los 120 m de una cuadra en 15 s, sin parar.",
      "expresion": [
        { "tipo": "fraccion", "arriba": "120 m", "abajo": "15 s" },
        { "tipo": "texto", "valor": "=" },
        { "tipo": "hueco" }
      ],
      "pregunta": "¿Cuántos metros por segundo avanza el camión?",
      "respuesta": {
        "tecleado": "8",
        "aceptaTambien": [],
        "comoSeLee": "ocho metros por segundo"
      },
      "pistas": [
        {
          "orden": 1,
          "texto": "La rapidez dice cuántos metros avanza en un segundo. Eso es lo que te están pidiendo."
        },
        {
          "orden": 2,
          "texto": "Divides la distancia entre el tiempo: 120 entre 15."
        }
      ],
      "pasoDelCanon": 4,
      "esInverso": false
    },
    {
      "situacion": "En la cancha de la escuela corres los 60 m de una portería a la otra en 12 s.",
      "expresion": [
        { "tipo": "fraccion", "arriba": "60 m", "abajo": "12 s" },
        { "tipo": "texto", "valor": "=" },
        { "tipo": "hueco" }
      ],
      "pregunta": "¿Cuántos metros por segundo corriste?",
      "respuesta": {
        "tecleado": "5",
        "aceptaTambien": [],
        "comoSeLee": "cinco metros por segundo"
      },
      "pistas": [
        {
          "orden": 1,
          "texto": "Son 60 m repartidos en 12 s. ¿Cuántos metros le toca a cada segundo?"
        },
        {
          "orden": 2,
          "texto": "Divides 60 entre 12: busca el número que multiplicado por 12 da 60."
        }
      ],
      "pasoDelCanon": 4,
      "esInverso": false
    },
    {
      "situacion": "El metro sale de una estación a las 7 en punto y llega a la siguiente a las 7 con 1 minuto, después de 420 m de túnel.",
      "expresion": [
        { "tipo": "fraccion", "arriba": "420 m", "abajo": "60 s" },
        { "tipo": "texto", "valor": "=" },
        { "tipo": "hueco" }
      ],
      "pregunta": "¿Cuántos metros por segundo lleva el metro?",
      "respuesta": {
        "tecleado": "7",
        "aceptaTambien": [],
        "comoSeLee": "siete metros por segundo"
      },
      "pistas": [
        {
          "orden": 1,
          "texto": "Aquí el tiempo no te lo dieron en segundos. Está escondido entre las dos horas del enunciado."
        },
        {
          "orden": 2,
          "texto": "De las 7 en punto a las 7 con 1 minuto pasó un minuto, y un minuto son 60 segundos. Con eso ya tienes los dos datos."
        },
        {
          "orden": 3,
          "texto": "La cuenta es la misma de los escalones de antes: los metros se reparten entre los segundos."
        }
      ],
      "pasoDelCanon": 4,
      "esInverso": false
    },
    {
      "situacion": "En la tiendita anotaron que el repartidor hizo los 400 m de la calle a 5 m por segundo, pero se borró cuánto tardó.",
      "expresion": [
        { "tipo": "texto", "valor": "400 ÷" },
        { "tipo": "hueco" },
        { "tipo": "texto", "valor": "= 5" }
      ],
      "pregunta": "¿Cuántos segundos tardó el repartidor?",
      "respuesta": {
        "tecleado": "80",
        "aceptaTambien": [],
        "comoSeLee": "ochenta segundos"
      },
      "pistas": [
        {
          "orden": 1,
          "texto": "Aquí ya te dieron el resultado. Lo que falta es uno de los dos datos con los que se hizo."
        },
        {
          "orden": 2,
          "texto": "5 m por segundo quiere decir 5 m en cada segundo. Cuántos segundos necesita para juntar 400."
        },
        {
          "orden": 3,
          "texto": "Es el número que multiplicado por 5 te da 400."
        }
      ],
      "pasoDelCanon": 2,
      "esInverso": true
    },
    {
      "situacion": "El entrenador apuntó que corriste a 6 m por segundo durante 45 s, pero se le mojó la hoja donde iba la distancia.",
      "expresion": [
        { "tipo": "hueco" },
        { "tipo": "texto", "valor": "÷ 45 = 6" }
      ],
      "pregunta": "¿Cuántos metros corriste?",
      "respuesta": {
        "tecleado": "270",
        "aceptaTambien": [],
        "comoSeLee": "doscientos setenta metros"
      },
      "pistas": [
        {
          "orden": 1,
          "texto": "Ahora el hueco está del lado de la distancia, no del tiempo."
        },
        {
          "orden": 2,
          "texto": "Son 6 m en cada segundo, durante 45 segundos seguidos."
        },
        {
          "orden": 3,
          "texto": "En vez de dividir, aquí multiplicas: 6 por 45."
        }
      ],
      "pasoDelCanon": 1,
      "esInverso": true
    }
  ],
  "noSePuede": null
}
```

Lo que este ejemplo hace bien, y que se te va a olvidar:

- El escalón 1 son los números del canon. Arranca parado.
- **La aritmética no crece.** 120÷15, 60÷12 y 420÷60 son tres divisiones del
  mismo tamaño. El escalón 3 no sube por la cuenta: sube porque el tiempo no
  viene dado en segundos y hay que sacarlo de la frase. Un estudiante que entiende
  rapidez y divide despacio pasa los cinco escalones.
- Los escalones 1 a 3 llevan la unidad dentro de la fracción; los inversos, con
  `÷`, la llevan en la situación. El renglón nunca pasa de tres átomos.
- Los dos inversos le quitan datos distintos: al 4 le falta el tiempo
  (`pasoDelCanon: 2`), al 5 la distancia (`pasoDelCanon: 1`).
- Cinco escenas distintas: el camión, la cancha, el metro, la tiendita, el
  entrenador.
- Las divisiones cierran exactas: 8, 5, 7, 80, 270. Ningún decimal.
- Ninguna pista escribe la respuesta, ni sus dígitos. La pista 3 del escalón 3
  apunta a la estructura («los metros se reparten entre los segundos»), no al
  número.

---

## Antes de devolver, revísate

1. ¿Cada `expresion` tiene **exactamente un** `hueco`, y el hueco va pelón
   (`{"tipo":"hueco"}`, sin `valor`, sin `ancho`, sin `alto`)?
2. ¿Ningún `hueco` quedó dentro de una `fraccion`? ¿Ninguna `fraccion` lleva
   átomos adentro?
3. ¿Ningún `simbolo` va sin `sub` ni `sup`? ¿Nada de `"3/5"` en un `texto`,
   nada de guion por menos, nada de `x` por `×`?
4. ¿Cada `respuesta.tecleado` casa con `^[0-9]+(/[0-9]+)?$`, sin unidad?
5. ¿Rehiciste cada cuenta? ¿Las cinco cierran exactas?
6. ¿El escalón 1 es el más fácil y hay un inverso en el último o el penúltimo,
   marcado con `esInverso: true`?
7. ¿La aritmética de los escalones 2 en adelante se queda del tamaño de la del
   escalón 1? ¿Puedes nombrar, escalón por escalón, qué dificultad **que no es
   aritmética** trae cada uno?
8. ¿`pasoDelCanon` apunta a un paso que el canon ya enseñó?
9. ¿Cinco situaciones distintas, ninguna de libro, ninguna con nombre propio
   inventado?
10. ¿Ninguna pista escribe la respuesta, ni sus dígitos, ni la suma o el producto
    que la arma? ¿Ninguna dice el número de un paso del canon?
11. ¿Cada átomo lleva su `tipo` y su `valor` completos, sin abreviar?
12. ¿`temaNumero` y `materia` son los del canon, copiados sin cambiarlos?
13. ¿Cero campos de estado: ni en cuál escalón va, ni cuántas pistas quedan, ni
    lo que trae tecleado?
14. ¿`noSePuede` viaja, aunque sea en `null`?
