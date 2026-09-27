# Caso aparte · el tema que no encaja en las seis estaciones

**Cuándo se llama:** una vez por cada entrada de `noEncajan[]` del temario, y
**después** de que el anfitrión ya tiene sus seis estaciones generadas.
**Sistema:** `contenido/prompts/00-sistema.md`
**Esquema:** `contenido/esquema/X4-no-encaja.schema.json`
**Entra:** una entrada de `noEncajan[]`, el tema anfitrión que el temario le
asigna, el canon del anfitrión, y lo que la estación anfitriona ya generó.
**Sale:** un aporte, ya escrito en la forma de la estación por la que entra.

El temario trae 37 temas en `noEncajan[]`: temas que el programa de la SEP sí
cubre pero que no sostienen seis estaciones. Los modelos atómicos son historia,
no procedimiento. El enlace metálico es una imagen que se cree. Las
construcciones con regla y compás se contestan con un trazo. Los organelos de la
célula son una lista de nombres.

Ninguno de esos 37 se tira. Cada uno entra por una rendija de un tema que sí
tiene las seis, y el temario ya dijo por cuál en su campo `queHacer`. La tabla de
los 37, con su anfitrión y su rendija, está al final de este archivo y es la
lista de trabajo. **Esa tabla no se manda a la API:** el llamador la usa para
armar la entrada de cada llamada.

---

## Mensaje del usuario

Vas a absorber un tema. No le vas a escribir seis estaciones: le vas a escribir
**un pedazo**, y ese pedazo se cose a una estación de otro tema que sí las
tiene.

### El tema que no encaja

- Nombre: {{absorbido.tema}}
- Por qué no aguanta seis estaciones: {{absorbido.porQue}}
- Qué dijo el temario que se hiciera con él: {{absorbido.queHacer}}
- Por dónde entra: {{absorbido.entraPor}}

Los tres primeros están copiados del temario palabra por palabra. El cuarto es
la decisión ya tomada: **no la revisas y no la cambias**. Si crees que la
rendija está mal elegida, lo dices en `porQueAhi` y aun así escribes el aporte
para la rendija que se te dio.

### El tema anfitrión

Cuidado con esta parte: **`{{tema.titulo}}` es el ANFITRIÓN, no el tema que
estás absorbiendo.** El absorbido es `{{absorbido.tema}}` y no tiene número de
tema, porque no es un tema del temario: vive en `noEncajan[]`.

- Materia: {{materia}} · {{materiaNombre}}
- Anfitrión: tema {{tema.numero}}, {{tema.titulo}}
- Familia: {{tema.familia}}
- Grado: {{tema.grado}}
- Al terminar el anfitrión, el estudiante dice: {{tema.quedaSabiendo}}
- Error típico del anfitrión: {{tema.errorTipico}}
- Los cinco pasos del anfitrión, en borrador: {{tema.losCincoPasos}}
- Notación que pide el anfitrión: {{tema.notacion}}

El grado que manda es el del anfitrión. Si el tema absorbido se ve en un grado
más alto, se recorta a lo que cabe en el grado del anfitrión, no al contrario.

### El canon del anfitrión

Es ley. No renombras un paso, no cambias los números del ejemplo, no usas
sinónimos de las palabras del vocabulario, y no te sales de las cotas.

```json
{{canon}}
```

Tres campos que vas a usar seguido:

- Procedimiento: {{canon.procedimiento.nombre}}
- Ejemplo canónico: {{canon.ejemplo.deQueVa}} — **este ejemplo ya lo vio el
  estudiante tres veces. Tu aporte usa otro caso.**
- Lo que el estudiante cree y lo lleva al error: {{canon.error.creenciaDeAtras}}
- Números que el tema puede usar: {{canon.cotas.numeros}}

### Lo que la estación anfitriona ya generó

```json
{{absorbido.yaGenerado}}
```

Es la salida de la estación por la que vas a entrar, ya escrita. La lees por una
razón: **para no repetirla.** Si tu pregunta es la que ya está, o tu escalón usa
los mismos números, le quitaste un turno al estudiante y no le diste nada.
Cuando entras por `video`, esto es lo que vas a reemplazar, y lo reemplazas
entero.

### Las cinco rendijas

| `entraPor` | Qué escribes | Qué le pasa a la estación del anfitrión |
|---|---|---|
| `video` | la estación 1 completa, otra vez | se reemplaza: el video ahora también cuenta esto |
| `contacto` | de 1 a 3 preguntas de opción múltiple | se le anexan al final de `preguntas[]` |
| `escalera` | de 1 a 3 escalones | se le anexan al final de `escalones[]` |
| `motivos` | 1 o 2 motivos equivocados | se le anexan al final de `motivos[]` |
| `fuera` | nada | nada: el tema queda afuera del círculo |

No existe una rendija para la estación 3 ni para la 6. La 3 es el paso central
del anfitrión y no se comparte. La 6 pide explicar el tema del anfitrión con
palabras propias, y meterle un tema ajeno la convierte en dos preguntas.

**`fuera` es una respuesta completa, no una derrota.** Siete de los 37 van
afuera: el temario lo dice con todas sus letras («Dejarlo fuera de Andamio»,
«Dejarlo fuera del circuito», «posponer»). Cuando te toque uno de ésos,
`aporte` no viaja y `noSePuede` viene lleno. Un aporte inventado para no llegar
con las manos vacías es peor que el hueco: entra al círculo de un tema que sí
funcionaba y lo ensucia.

### Qué escribes en cada rendija

**`video`.** La pregunta que abre el tema sigue siendo la del anfitrión; el
tema absorbido entra en la segunda frase del resumen y en los criterios de
búsqueda. Uno de los criterios dice, con esas palabras, que el video tiene que
cubrir el tema absorbido: si no lo dices, quien elija el video va a escoger uno
que sólo habla del anfitrión y el aporte se pierde sin que nadie se dé cuenta.
No escribes duración: la duración sale del video que se elija, y no se inventa.

**`contacto`.** Cada pregunta trae cuatro opciones y una sola correcta. Cada
opción cabe en un renglón: una fracción, una operación, o tres o cuatro
palabras. `queRevela` de una opción equivocada dice qué cree quien la elige, no
qué hizo mal. Aquí no se cobra nada: se diagnostica.

**`escalera`.** Cada escalón trae una situación de la vida real, un renglón con
un solo hueco, la pregunta, la respuesta y dos o tres pistas. Entran al final,
así que son los escalones más difíciles de la escalera — y aun así se quedan
dentro de las cotas del canon. La situación es lo que el tema absorbido aporta:
el caso que el anfitrión solo no traía.

**`motivos`.** Van a la estación 5, donde el estudiante ya marcó el paso malo y
ahora dice por qué. Todos los motivos que entran por aquí llevan `esElBueno` en
`false`: el motivo correcto ya lo escribió la estación 5 del anfitrión y no
puede haber dos. Tu motivo tiene que sonar razonable — un motivo que nadie
elegiría no enseña nada al descartarse — y tiene que ser distinto palabra por
palabra de los que ya están.

### Cómo se escriben los renglones

Cuatro átomos y no hay más:

| Átomo | Para qué |
|---|---|
| `{"tipo":"texto","valor":"÷"}` | palabras y todos los signos sueltos: `+ − × ÷ = < > ≈ →` |
| `{"tipo":"fraccion","arriba":3,"abajo":5}` | cualquier fracción, apilada |
| `{"tipo":"simbolo","valor":"H","sub":"2"}` | subíndice, superíndice, carga, unidad, variable con letra |
| `{"tipo":"hueco"}` | el recuadro que el estudiante llena |

Lo que se rompe si no lo respetas:

- `fraccion.arriba` y `fraccion.abajo` son **una cadena de un renglón**. No
  caben átomos dentro. Si arriba necesita un subíndice, se escribe con palabras
  («masa del soluto»).
- Un `simbolo` sin `sub` ni `sup` es `texto`, y el esquema lo rechaza.
- `sub` y `sup` en el mismo `simbolo` salen **uno junto al otro, no apilados en
  la misma columna**. Cuando la notación del tema pide los dos números alineados
  a la izquierda del símbolo (el `²³₁₁Na` del número de masa y el número
  atómico), eso no se puede dibujar: se escribe el número de masa como `sup` a
  la derecha y los dos valores en palabras en el mismo renglón.
- Un renglón lleva **un solo hueco**. Con dos, la pantalla escribe lo tecleado
  en los dos y el estudiante ve su respuesta duplicada.
- Nunca `"3/5"` en un renglón: eso es una `fraccion`. La diagonal en `texto`
  sólo vale dentro de una unidad compuesta (`m/s`, `mg/L`).
- El menos es `−` (U+2212), no un guion. El por es `×`, no `x` ni `*`.

### Lo que se puede teclear

El teclado tiene doce teclas: `1`–`9`, `0`, `/` y borrar. Toda respuesta casa
con:

```
^[0-9]+(/[0-9]+)?$
```

No hay punto decimal, ni signo menos, ni letras, ni paréntesis. Las unidades
**nunca** se teclean: van en la situación o en el renglón, y el hueco recibe
sólo el número.

Antes de rendirte, intenta **una vez** reformular: si el resultado es `0.8`,
pide `8/10`; si la respuesta es «se hunde», pide el número que se compara; si
la respuesta es un nombre, pregunta un conteo. Si la reformulación cambia lo que
el tema enseña, llena `noSePuede` y di qué teclado o qué dibujo haría falta.

### Lo que no haces

- **No inventas el anfitrión.** Viene en la entrada. Tampoco eliges otro porque
  te late más.
- **No escribes seis estaciones.** Un solo pedazo, por una sola rendija.
  `aporte` lleva exactamente una de sus cuatro llaves.
- **No rehaces el anfitrión.** No corriges su ejemplo, no reescribes sus pasos,
  no tocas sus preguntas.
- **No repites el ejemplo canónico**, ni sus números, ni el caso que la estación
  anfitriona ya usó.
- **No renombras un paso del canon** ni usas un sinónimo de una palabra de su
  vocabulario, aunque el tema absorbido use otra palabra.
- **No conviertes un `fuera` en aporte.** Si el temario lo manda afuera, va
  afuera.
- **No usas `video` como salida cómoda.** «Que se mencione en el video» es una
  respuesta de verdad sólo cuando el temario lo dice. Si la rendija que te toca
  es `escalera` y te cuesta, escribes el escalón o llenas `noSePuede`; no te
  pasas a `video`.
- **No pones `esElBueno` en `true`.**
- **No numeras nada.** Los escalones y las preguntas son arreglos; la app deriva
  el índice y el progreso. No escribes «escalón 4 de 5» ni «pregunta 2 de 4».
- **No pides estado.** Ni cuántas pistas quedan, ni los segundos para la
  siguiente, ni monedas, ni en qué escalón va. Las pistas son una lista con su
  orden y su texto.
- **No cambias el nombre del tema absorbido** para que suene mejor: `{{absorbido.tema}}`
  se copia letra por letra, con su paréntesis y todo, porque así se rastrea de
  vuelta al temario.
- **No metes markdown** en ningún campo: son cadenas planas que la pantalla
  pinta tal cual.

### Un ejemplo completo

Tema absorbido: `Isótopos y el carbono-14`. Anfitrión: Química 14, `Número
atómico y número de masa`. El temario dice: «Fundirlo como los escalones 4 y 5
de "Número atómico y número de masa": dos átomos con el mismo Z y distinta A, y
la pregunta de si siguen siendo el mismo elemento.»

Fíjate en cuatro cosas. El ejemplo canónico del anfitrión es el sodio, y estos
escalones usan carbono. El procedimiento es el mismo del canon, `A − Z`, y las
pistas lo nombran por su número de paso. La notación `²³₁₁Na` no se puede
dibujar, así que el número de masa va como `sup` a la derecha y los dos valores
escritos en el renglón. Y el aporte del tema absorbido no está en la cuenta
—que es la del anfitrión— sino en la última pista del segundo escalón.

```json
{
  "temaNumero": 14,
  "materia": "quimica",
  "temaAbsorbido": "Isótopos y el carbono-14",
  "anfitrion": { "numero": 14, "titulo": "Número atómico y número de masa" },
  "queSeRescata": "Dos átomos con el mismo número de protones y distinto número de neutrones siguen siendo el mismo elemento.",
  "entraPor": "escalera",
  "porQueAhi": "El procedimiento del carbono 14 es el mismo del anfitrión: restar A menos Z. Lo único que agrega es un caso donde A cambia y el elemento no, y eso cabe en dos escalones al final de la escalera sin necesitar sus propias seis estaciones.",
  "costura": {
    "donde": "Al final de escalones[] de la estación 4 del anfitrión, como los escalones 4 y 5.",
    "reemplazaOAgrega": "agrega",
    "queNoDuplica": "No usa el sodio del ejemplo canónico, usa carbono. Y no vuelve a pedir protones ni electrones, que son los escalones anteriores: aquí sólo se piden neutrones."
  },
  "aporte": {
    "escalera": {
      "escalones": [
        {
          "situacion": "Todo el carbono del aire que respiras tiene 6 protones. En la tabla periódica el carbono ocupa una sola casilla, y ahí dice Z igual a 6.",
          "expresion": [
            { "tipo": "texto", "valor": "El" },
            { "tipo": "simbolo", "valor": "C", "sup": "12" },
            { "tipo": "texto", "valor": "tiene A = 12 y Z = 6. Neutrones = 12 − 6 =" },
            { "tipo": "hueco" }
          ],
          "pregunta": "¿Cuántos neutrones tiene el carbono 12?",
          "respuesta": {
            "tecleado": "6",
            "aceptaTambien": [],
            "comoSeLee": "seis neutrones"
          },
          "pistas": [
            { "orden": 1, "texto": "El número de masa cuenta protones y neutrones juntos. El número atómico cuenta nada más protones." },
            { "orden": 2, "texto": "Paso 5 del procedimiento: restas A menos Z. Aquí A es 12 y Z es 6." }
          ]
        },
        {
          "situacion": "En un museo fechan un hueso con carbono 14. Ese carbono tiene número de masa 14, y cae en la misma casilla de la tabla que el carbono del aire.",
          "expresion": [
            { "tipo": "texto", "valor": "El" },
            { "tipo": "simbolo", "valor": "C", "sup": "14" },
            { "tipo": "texto", "valor": "tiene A = 14 y Z = 6. Neutrones = 14 − 6 =" },
            { "tipo": "hueco" }
          ],
          "pregunta": "¿Cuántos neutrones tiene el carbono 14?",
          "respuesta": {
            "tecleado": "8",
            "aceptaTambien": [],
            "comoSeLee": "ocho neutrones"
          },
          "pistas": [
            { "orden": 1, "texto": "Cambió el número de arriba, no el de abajo: Z sigue siendo 6." },
            { "orden": 2, "texto": "Paso 5 otra vez, A menos Z. Aquí A es 14 y Z sigue en 6." },
            { "orden": 3, "texto": "14 menos 6. Y fíjate: los protones no se movieron, así que este átomo sigue siendo carbono." }
          ]
        }
      ]
    }
  },
  "noSePuede": null
}
```

### Antes de devolver, revísate

1. ¿`temaAbsorbido` está copiado letra por letra del temario?
2. ¿`anfitrion` es el que venía en la entrada, no otro?
3. ¿`aporte` trae **una sola** llave, y es la que dice `{{absorbido.entraPor}}`?
4. ¿Si `entraPor` es `fuera`, `aporte` no viaja y `noSePuede` viene lleno?
5. ¿Tu aporte usa un caso distinto del ejemplo canónico y de lo que la estación
   anfitriona ya traía?
6. ¿Cada renglón con hueco tiene **exactamente uno**?
7. ¿Toda respuesta tecleada casa con `^[0-9]+(/[0-9]+)?$`, sin unidades?
8. ¿Ninguna `fraccion` tiene átomos adentro? ¿Ningún `simbolo` va sin `sub` ni
   `sup`?
9. ¿Nada de `"3/5"` en un renglón, nada de guion por menos, nada de `x` por `×`?
10. ¿Las pistas son una lista con `orden` y `texto`, y ningún campo es un
    contador?
11. ¿Los `motivos`, si los hay, llevan todos `esElBueno` en `false` y son
    distintos de los que el anfitrión ya tenía?
12. ¿`queSeRescata` se puede leer sin repetir el título del tema absorbido? Si no
    se puede, no hay nada que absorber: `entraPor` es `fuera`.
13. **La lista, campo por campo.** Tacha uno por uno: `temaAbsorbido`,
    `queSeRescata`, `entraPor`, `porQueAhi`, `costura` y `noSePuede`. `anfitrion`
    viaja siempre salvo el caso único del tema que el temario manda fuera sin
    nombrar anfitrión, y lleva `numero` y `titulo`. `aporte` viaja salvo cuando
    `entraPor` es `fuera`, y lleva **exactamente una** de las cuatro llaves, la que
    nombra `entraPor`:
    - `video`: `pregunta`, `resumen`, `consultaDeBusqueda` y `criterios`.
    - `contacto`: `preguntas`, y cada una `enunciado` y `opciones`; cada opción
      `partes`, `esCorrecta` y `queRevela`.
    - `escalera`: `escalones`, y cada uno `situacion`, `expresion`, `pregunta`,
      `respuesta` (con `tecleado`, `aceptaTambien` y `comoSeLee`) y `pistas`.
    - `motivos`: `motivos`, y cada uno `texto`, `esElBueno` y `queRevela`.
    `costura` es la que se va, y es la que dice dónde se pega todo esto: lleva
    `donde`, `reemplazaOAgrega` y `queNoDuplica`. Escríbela antes del `aporte`, no
    después.
---

## Apéndice · no va en la llamada

### Los cinco placeholders nuevos

Este caso es el único que necesita un objeto de entrada que el contrato no tiene
todavía. Los cinco cuelgan de una sola raíz, `absorbido`, y sus valores salen
del temario sin transformarse:

| Placeholder | De dónde sale |
|---|---|
| `{{absorbido.tema}}` | `noEncajan[i].tema`, letra por letra |
| `{{absorbido.porQue}}` | `noEncajan[i].porQue`, letra por letra |
| `{{absorbido.queHacer}}` | `noEncajan[i].queHacer`, letra por letra |
| `{{absorbido.entraPor}}` | la columna «entra por» de la tabla de abajo |
| `{{absorbido.yaGenerado}}` | la salida ya generada de la estación anfitriona por la que entra, serializada |

Los tres primeros son campos que `noEncajan[]` ya tiene hoy en los cuatro
temarios. Los otros dos los pone el llamador. **Hay que agregar esta raíz a
`CONTRATO.md` §2** antes de correr las llamadas: mientras no esté, un
`{{absorbido.tema}}` sin resolver aborta la llamada, que es exactamente lo que
el contrato manda hacer.

`{{absorbido.yaGenerado}}` obliga a un orden: **esta llamada corre al final**,
cuando el anfitrión ya tiene sus seis estaciones. No se puede paralelizar con
ellas.

### La tabla de los 37

30 aportes y 7 que quedan afuera. «2 llamadas» y «3 llamadas» significan que el
`queHacer` del temario nombra más de una rendija o más de un anfitrión: cada
combinación es una llamada aparte, con su propio `{{absorbido.entraPor}}` y su
propio `{{absorbido.yaGenerado}}`. Son 6 filas de 2 llamadas y 1 de 3, así que
salen **45 llamadas para 37 temas**. Las dos filas que traen una alterna y las
tres que reparten un tema entre varios anfitriones en la nota (los organelos)
pueden subir ese número: eso lo decide quien arme la corrida, no este prompt.

#### Matemáticas · 8

| Tema de `noEncajan[]` | Anfitrión | Entra por |
|---|---|---|
| Construcciones con regla y compás (mediatriz, bisectriz, alturas y puntos notables) | 47 · Ángulos entre paralelas | `fuera` — la respuesta es un trazo; si se quiere rescatar el ángulo de la bisectriz, `escalera` |
| Simetría, traslación, rotación y reflexión | 38 · El plano cartesiano | `escalera` — ojo: reflejar en el eje y da coordenadas negativas, que el teclado no escribe; candidato fuerte a `noSePuede` |
| Cuerpos geométricos: desarrollos planos, vistas y aristas | 52 · Volumen de prismas y cilindros | `video` |
| Estimación y cálculo mental | 28 · Raíz cuadrada: exacta y aproximada | `escalera` (también cabe en 21 · Porcentajes: qué son y cómo se sacan) |
| Probabilidad frecuencial y experimentos aleatorios | 59 · Probabilidad clásica | `video` |
| Lectura crítica de gráficas engañosas (eje cortado, escalas distintas) | 57 · Leer gráficas de barras y circulares | `escalera` — último escalón |
| Escalas, planos y mapas | 20 · Proporcionalidad directa y valor unitario | `escalera` (2 llamadas: también 55 · Semejanza de triángulos y Tales) |
| Media, mediana y moda con datos agrupados en intervalos | 58 · Media, mediana y moda | `fuera` — se posterga a la segunda vuelta del tema |

#### Biología · 10

| Tema de `noEncajan[]` | Anfitrión | Entra por |
|---|---|---|
| El plato del bien comer y la jarra del buen beber | 5 · Los nutrimentos de la comida | `contacto` + `escalera` (2 llamadas) |
| Aparatos reproductores: partes y sus nombres | 18 · El ciclo menstrual, día por día | `contacto` (2 llamadas: también 19 · Fecundación y embarazo) |
| Los organelos de la célula, uno por uno | 2 · La célula, la unidad de lo vivo | `contacto` — la mitocondria se va a 10 · De dónde sale la energía y el cloroplasto a 9 · Fotosíntesis: comer del aire |
| Niveles de organización: célula, tejido, órgano, sistema, organismo | 2 · La célula, la unidad de lo vivo | `video` (alterna: 7 · El viaje del taco: digestión) |
| Biodiversidad de México: megadiversidad y especies endémicas | 31 · Usar una clave dicotómica | `escalera` — con ejemplares mexicanos |
| Cuidado del ambiente: las tres erres y acciones sustentables | 35 · Efecto invernadero: la cadena | `escalera` — con kg de CO₂ y litros de agua, no con conductas |
| Sexualidad como proyecto de vida: afectos, identidad, género y equidad | — | `fuera` — no hay paso objetivamente mal; la parte con datos ya es tema propio |
| Adicciones, tabaco, alcohol y salud mental | 11 · El viaje del oxígeno | `escalera` — sólo la parte fisiológica del alvéolo |
| Primeros auxilios e higiene personal | 13 · La cadena de un contagio | `fuera` — si se rescata el lavado de manos como eslabón que se corta, `escalera` |
| Historia de la biología: Mendel, Darwin, Pasteur, Hooke | 23 · El cuadro de Punnett / 26 · Selección natural, paso a paso / 13 · La cadena de un contagio | `video` (3 llamadas: Mendel, Darwin, Pasteur) |

#### Física · 10

| Tema de `noEncajan[]` | Anfitrión | Entra por |
|---|---|---|
| Marco de referencia (el movimiento es relativo) | 3 · Distancia recorrida y desplazamiento | `video` + `escalera` (2 llamadas) |
| Conversión de unidades (km/h ↔ m/s) | 4 · Rapidez: metros por segundo | `escalera` + `motivos` (2 llamadas) |
| Presión y flotación (Pascal, Arquímedes) | 2 · Densidad: flotar o hundirse | `fuera` — espera un bloque de fluidos; la flotación ya vive en densidad |
| Equilibrio térmico y calorimetría | 21 · Calor no es temperatura | `escalera` — sólo la parte cualitativa |
| Conductores y aislantes | 25 · El circuito cerrado | `escalera` — el foco que no prende por el clip de plástico |
| Inducción electromagnética (el generador) | 29 · El electroimán | `escalera` — último escalón |
| Espectro electromagnético | 35 · Refracción: el popote quebrado | `video` (alterna: 30 · Ondas: qué viaja y qué no, por `escalera`) |
| Lentes, el ojo y la miopía | 35 · Refracción: el popote quebrado | `escalera` — sólo por qué la lupa agranda |
| El Sistema Solar y la gravitación universal | 12 · Masa y peso no son lo mismo | `escalera` — cuánto pesarías en la Luna y en Marte |
| Historia de la física (Galileo, Newton, Franklin) | 10 · Primera ley: la inercia / 8 · Caída libre: todos caen igual | `video` (2 llamadas) |

#### Química · 9

| Tema de `noEncajan[]` | Anfitrión | Entra por |
|---|---|---|
| Isótopos y el carbono-14 | 14 · Número atómico y número de masa | `escalera` — escalones 4 y 5 |
| Enlace metálico (el mar de electrones) | 19 · Metales, no metales y metaloides | `video` — por qué conducen y son maleables |
| Tipos de reacción: síntesis, descomposición y sustitución | 28 · La ecuación química | `escalera` — un tipo por escalón |
| Modelos atómicos históricos (Dalton, Thomson, Rutherford, Bohr) | 16 · El modelo de Bohr: los niveles | `video` |
| Cálculos estequiométricos (gramos → moles → gramos) | 31 · El mol y la masa molar | `fuera` — es de bachillerato |
| Electronegatividad y polaridad del enlace | 22 · Enlace covalente: compartir | `video` — una frase, sin ejercicios: no se les da la tabla de electronegatividades |
| Química y tecnología (el proyecto del bloque 5) | — | `fuera` — proyecto abierto, sin respuesta única |
| Propiedades intensivas y extensivas | 2 · Densidad: por qué flota o se hunde | `contacto` — la densidad no cambia si cortas el pedazo |
| El número de Avogadro y la conversión mol ↔ partículas | 31 · El mol y la masa molar | `video` — como dato, sin ejercicios |
