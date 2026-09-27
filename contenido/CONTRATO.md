# El contrato del contenido

Este documento manda. Todo prompt, todo esquema y todo generador de contenido de
Andamio se somete a lo que dice aquí. Si un prompt y este archivo se
contradicen, el que está mal es el prompt.

Existe porque el contenido de los 165 temas no lo escribe una llamada a la API,
sino siete por tema (el canon y las seis estaciones), y esas siete no se hablan
entre ellas. Lo único que comparten es este contrato.

Dónde vive todo:

```
contenido/
  LEEME.md                 la página que se lee primero: el orden de las llamadas
  CONTRATO.md              este archivo
  generar.mjs              genera un tema completo llamando a la API
  temarios/*.json          los 165 temas, ya escritos
  temas/*.json             la salida, un archivo por tema
  esquema/
    partes.json            los átomos, como $defs reutilizables
    armar.mjs              copia los $defs dentro de cada esquema
    revisar.mjs            compila los once esquemas y valida sus ejemplos
    canon-ejemplo.json     el canon de referencia, que sí valida
    00-canon.schema.json   la salida del paso 0
    NN-<estacion>.schema.json
    X<n>-<caso>.schema.json
  prompts/
    00-sistema.md          el bloque de sistema, va en TODAS las llamadas
    00-canon.md            el paso 0
    NN-<estacion>.md
    X<n>-<caso>.md         los temas que no caben en el camino normal
```

**Si es la primera vez que abres esto, lee `LEEME.md` antes.** Este archivo dice
qué es ley; ése dice en qué orden se llama y qué cuesta.

---

## 1. Los cuatro átomos

Todo lo que en pantalla se ve como matemáticas, química o física se arma con
cuatro átomos y no hay más. El tipo vive en `src/contenido/tipos.ts` y lo dibuja
`src/componentes/Expresion.tsx`.

```ts
export type ParteMat =
  | { tipo: 'texto'; valor: string }
  | { tipo: 'fraccion'; arriba: string | number; abajo: string | number }
  | { tipo: 'simbolo'; valor: string; sub?: string; sup?: string }
  | { tipo: 'hueco'; valor?: string; ancho?: number; alto?: number };
```

`simbolo` es el átomo nuevo. Con él la cobertura del temario pasa de 21 % a
69 %: un solo átomo resuelve subíndice, superíndice, carga, unidad compuesta y
variable con letra. No hacen falta cinco átomos distintos. Ya está en
`src/contenido/tipos.ts` y `Expresion` ya lo dibuja y lo dicta: sin eso, toda
Química y toda Física salían como recuadros vacíos.

Cada átomo se escribe **completo**, con su `tipo` y su `valor`. `{"texto":"S"}`
no es un átomo abreviado: es un objeto sin `tipo`, y cualquier átomo sin `tipo`
reconocido cae en la rama del hueco (`src/componentes/Expresion.tsx`) y se pinta
como un recuadro punteado. No hay forma corta.

Del `hueco`, la IA escribe **sólo** `{ "tipo": "hueco" }`. `valor`, `ancho` y
`alto` son de la app y del diseño, nunca del contenido.

### Qué cubre cada uno

| Átomo | Ejemplo en JSON | Se ve |
|---|---|---|
| `texto` | `{"tipo":"texto","valor":"÷"}` | palabras, `+ − × ÷ = < > ≈ →` |
| `fraccion` | `{"tipo":"fraccion","arriba":3,"abajo":5}` | tres quintos apilados |
| `simbolo` | `{"tipo":"simbolo","valor":"H","sub":"2"}` | H con 2 al pie |
| `hueco` | `{"tipo":"hueco"}` | recuadro punteado |

### Las cuatro materias, resueltas con estos átomos

**Matemáticas** · 360 = 2³ × 3² × 5

```json
[{"tipo":"texto","valor":"360 ="},
 {"tipo":"simbolo","valor":"2","sup":"3"},
 {"tipo":"texto","valor":"×"},
 {"tipo":"simbolo","valor":"3","sup":"2"},
 {"tipo":"texto","valor":"× 5"}]
```

**Química** · 2H₂ + O₂ → 2H₂O

```json
[{"tipo":"texto","valor":"2"},
 {"tipo":"simbolo","valor":"H","sub":"2"},
 {"tipo":"texto","valor":"+"},
 {"tipo":"simbolo","valor":"O","sub":"2"},
 {"tipo":"texto","valor":"→"},
 {"tipo":"texto","valor":"2"},
 {"tipo":"simbolo","valor":"H","sub":"2"},
 {"tipo":"texto","valor":"O"}]
```

La flecha de reacción es `texto`. El ion calcio es
`{"tipo":"simbolo","valor":"Ca","sup":"2+"}`. En `Ca(OH)₂` el paréntesis va en
`texto` y el 2 en un `simbolo` con el paréntesis de cierre:
`{"tipo":"simbolo","valor":")","sub":"2"}`.

**Física** · 10 m/s²  y  v_f = 18 m/s

```json
[{"tipo":"texto","valor":"10 m/"},{"tipo":"simbolo","valor":"s","sup":"2"}]
[{"tipo":"simbolo","valor":"v","sub":"f"},{"tipo":"texto","valor":"= 18 m/s"}]
```

**Biología** · casi todo es `texto` corrido. Las palomitas y taches del temario
(`¿se reproduce? ✓`) van dentro de `texto`; no hay átomo de palomita.

### Las reglas que no se negocian

1. **Una fracción no lleva átomos adentro.** `arriba` y `abajo` son una cadena
   de un renglón (`src/componentes/Fraccion.tsx:19-45`), de hasta 40 caracteres.
   Si lo de arriba necesita un subíndice, se escribe con palabras: `masa del
   soluto`, `velocidad final − inicial`.
2. **Nunca `"3/5"` en un renglón.** Eso es una `fraccion`. Regla del repo
   (`AGENTS.md`). La diagonal en `texto` sólo vale dentro de una unidad
   compuesta (`m/s`, `mg/L`).
3. **Un `simbolo` sin `sub` ni `sup` es `texto`.** El esquema lo rechaza.
4. **Un renglón lleva un solo `hueco`.** `Expresion` aplica lo tecleado a
   *todos* los huecos del renglón (`src/componentes/Expresion.tsx`): con dos
   huecos, el estudiante ve su respuesta duplicada; con cero, la estación 3
   muestra un renglón ya resuelto y el teclado no escribe en ninguna parte. Los
   esquemas lo hacen cumplir, no sólo lo piden: `renglonConHueco` lleva
   `contains` con `minContains: 1` y `maxContains: 1`, y `renglon` lleva un `not`
   que rechaza cualquier hueco. Un `$ref` a esos dos `$defs` basta.
5. **El menos es `−` (U+2212), no `-`.** El por es `×`, no `x` ni `*`.
6. **Nada de markdown dentro de los campos.** Son cadenas planas que
   `<Text>` pinta tal cual: ni `**`, ni `_`, ni `\n` de adorno.

---

## 2. Los placeholders

Todos los prompts usan **la misma** convención, y sólo ésta:

```
{{ruta.puntuada}}
```

- Doble llave, sin espacios por dentro: `{{tema.titulo}}`, no `{{ tema.titulo }}`.
- La ruta es un camino puntuado dentro del objeto de entrada.
- **No hay condicionales, ni bucles, ni filtros, ni valores por omisión.** Sólo
  sustitución de cadena.
- Un placeholder que no se puede resolver es un error del llamador: se aborta la
  llamada, no se manda la cadena vacía ni el literal.
- Si el valor es un objeto o un arreglo, se serializa como JSON con sangría de
  2 y se inserta tal cual.
- Los placeholders aparecen **sólo en el mensaje del usuario**. El bloque de
  sistema (`00-sistema.md`) no lleva ninguno: es el mismo texto en las 1 155
  llamadas.
- Ningún prompt contiene `{{` literal por otra razón. No hay escape.

### El juego completo

Del temario (`contenido/temarios/<materia>.json`), lo pone el llamador:

| Placeholder | De dónde sale |
|---|---|
| `{{materia}}` | `clave` del temario: `matematicas`, `biologia`, `fisica`, `quimica` |
| `{{materiaNombre}}` | `nombre` del temario: `Matemáticas` |
| `{{tema.numero}}` | `temas[i].numero` |
| `{{tema.titulo}}` | `temas[i].titulo` |
| `{{tema.familia}}` | `temas[i].familia` |
| `{{tema.grado}}` | `temas[i].grado` |
| `{{tema.quedaSabiendo}}` | `temas[i].quedaSabiendo` |
| `{{tema.dependeDe}}` | `temas[i].dependeDe`, serializado |
| `{{tema.errorTipico}}` | `temas[i].errorTipico` |
| `{{tema.losCincoPasos}}` | `temas[i].losCincoPasos` |
| `{{tema.notacion}}` | `temas[i].notacion` |

Del canon (la salida del paso 0), lo pone el llamador en las seis estaciones:

| Placeholder | Qué trae |
|---|---|
| `{{canon}}` | el canon completo, serializado. Va siempre. |
| `{{canon.procedimiento.nombre}}` | el nombre del procedimiento |
| `{{canon.ejemplo.deQueVa}}` | de qué va el ejemplo canónico |
| `{{canon.error.pasoQueCorrompe}}` | en qué paso se cae el error |
| `{{canon.error.creenciaDeAtras}}` | qué cree el estudiante |
| `{{canon.cotas.numeros}}` | qué números puede usar el tema |

Un prompt de estación puede usar los atajos que necesite, pero **siempre**
incluye `{{canon}}` completo: los atajos son para llamar la atención sobre un
campo, no para recortar la entrada.

Del repo, sólo en `00-canon.md`:

| Placeholder | Qué trae |
|---|---|
| `{{ejemploCanon}}` | `contenido/esquema/canon-ejemplo.json`, el canon de referencia, serializado |

De una entrada de `noEncajan[]` del temario, sólo en `X4-no-encaja.md`:

| Placeholder | De dónde sale |
|---|---|
| `{{absorbido.tema}}` | `noEncajan[i].tema` |
| `{{absorbido.porQue}}` | `noEncajan[i].porQue` |
| `{{absorbido.queHacer}}` | `noEncajan[i].queHacer` |
| `{{absorbido.entraPor}}` | la estación anfitriona que el llamador decidió leyendo `queHacer` |
| `{{absorbido.yaGenerado}}` | lo que esa estación del anfitrión ya devolvió, serializado |

No hay más. Un placeholder que no esté en estas cuatro tablas es un error del
prompt.

---

## 3. La forma del canon

El canon es el paso 0 y se genera **una vez por tema**. Esquema:
`contenido/esquema/00-canon.schema.json`. Prompt:
`contenido/prompts/00-canon.md`.

```
canon
├── temaNumero, materia, titulo        copiados del temario, para trazar
├── notacion                           lineal | tabla | figura   → a qué prompt va
├── formaDeRespuesta                   numero | fraccion | palabra | trazo
├── procedimiento
│   ├── nombre
│   └── pasos[5]
│       ├── numero        1..5
│       ├── queSeHace     la acción, segunda persona
│       ├── renglon       ParteMat[]  ese paso escrito sobre el ejemplo
│       └── porQue        la razón, no el cómo
├── ejemplo
│   ├── deQueVa, planteamiento, resultado, resultadoEnPalabras
├── error
│   ├── enUnaFrase, creenciaDeAtras
│   ├── pasoQueCorrompe   1..5, tiene que existir en procedimiento.pasos
│   ├── renglonMalo       ese paso escrito mal, sobre el mismo ejemplo
│   ├── resultadoMalo     a dónde llega el error
│   └── comoSeCacha       la señal que lo delata sin rehacer la cuenta
├── erroresSecundarios[0..2]   las otras confusiones de errorTipico
│   └── enUnaFrase, creenciaDeAtras
├── vocabulario[3..8]     palabra, queEs, noEsLoMismoQue?
├── cotas                 numeros, unidades[], simbolos[]
└── noSePuede             null | { que, porQue, queHagoConEsto }
```

**Por qué existe.** Las estaciones 3, 4 y 5 hablan del mismo procedimiento. La
3 enseña un paso, la 4 lo usa al revés, la 5 lo corrompe. Sin un canon previo,
cada llamada inventa sus propios cinco pasos y la estación 5 acaba acusando un
paso que la 3 nunca enseñó: el estudiante ve dos procedimientos distintos para
el mismo tema y concluye que no entendió nada.

**Qué es ley para las seis estaciones:** los cinco pasos y su numeración, los
números del ejemplo, las palabras del vocabulario, y las cotas. Una estación no
renombra un paso, no cambia el ejemplo y no usa sinónimos.

**Un solo `error`, y las demás confusiones no se tiran.** 58 de los 165 temas
traen dos confusiones en `errorTipico` («2 + 3 × 4 = 20; y −3² = 9»). En `error`
va la que se cae en un paso, con su `pasoQueCorrompe`; las otras van en
`erroresSecundarios`, que es un arreglo de 0 a 2 y siempre viaja. La estación 2
convierte cada una en un distractor obligatorio con `esElErrorTipico: false`, y la
6 saca de la primera una `suenanBienYNoDicen` o un `contraargumento`. Si nadie las
recoge, el tema enseña el procedimiento y deja intacta la creencia que hace que el
estudiante no crea su propio resultado.

**Las pistas nombran la acción, no el número del paso.** Igual en las estaciones
3, 4 y 5. El estudiante nunca ve la lista numerada del canon en pantalla, así que
«paso 2 del procedimiento» le gasta una pista sin decirle nada. Y ninguna pista,
en ninguna estación, escribe la respuesta, ni sus dígitos por separado, ni la suma
o el producto que la arma.

**El canon de referencia.** `contenido/esquema/canon-ejemplo.json` es un canon
entero que valida contra `00-canon.schema.json`: Matemáticas 9, división de
fracciones, el mismo tema que `src/contenido/demo.ts` ya tiene dibujado en el
canvas. `00-canon.md` lo usa como su ejemplo completo, interpolado en
`{{ejemploCanon}}`. Un prompt nuevo saca su ejemplo de ahí en vez de inventarse un
canon recortado.

**`notacion` es el ruteo.** El canon decide, y el llamador manda el tema al
prompt que corresponde. `tabla` y `figura` no van a los prompts normales de
estación: hoy la app no dibuja ni tablas ni figuras (ver §5).

### La tabla de ruteo, que vive sólo aquí

Las estaciones 1 y 6 van siempre a `01-ver.md` y `06-explicar.md`: el video se ve
igual y la explicación se escribe igual sea cual sea la notación. Lo que rutea es
qué pasa con las estaciones 2, 3, 4 y 5.

| `notacion` | `formaDeRespuesta` | 2 | 3 y 4 | 5 |
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

Tres cosas que la tabla no dice sola:

- **`formaDeRespuesta` no rutea la estación 2.** Ahí no se teclea: se toca una
  tarjeta. Un tema con respuesta de `palabra` sí puede tener su estación 2 normal.
- **`X1-tabla` es una sola llamada** que devuelve las cuatro estaciones juntas,
  porque el canon fija el procedimiento y no la forma de la rejilla.
- **`expresion` es el renglón que faltaba, y es el que más pesa.** Es la respuesta
  que necesita un carácter que el teclado no tiene: el punto decimal, el signo menos,
  un exponente, la `×`, los dos puntos de una razón, o `<`/`>`/`=`. Sin ese renglón,
  la factorización del tema 2 se fue a `04-escalera`, la escalera pidió `2³ × 3² × 5`
  y `$defs.tecleado` la rechazó tres veces seguidas: el tope tenía razón, lo que
  estaba mal era el ruteo. De los veinte primeros temas de matemáticas, **diez** están
  en ese caso (ver `LEEME.md`), así que no es un caso raro: es la mitad del temario.
- **`X4-no-encaja` no está en la tabla.** No se rutea por notación: se llama una
  vez por cada entrada de `noEncajan[]`, después de que el anfitrión ya tiene sus
  seis estaciones.

---

## 4. Contenido y estado son cosas distintas

Hoy `src/contenido/tipos.ts` los mezcla: `pistas: 5` y `escalon: 4` viven junto
al enunciado, como si un contador de pistas fuera contenido. No lo es. Y al
revés: la respuesta correcta, el texto de las pistas y la rúbrica **no existen
en ningún lado**, y sin ellas la app no puede calificar nada.

| Lo escribe la IA (contenido) | Lo pone la app (estado) |
|---|---|
| enunciados, situaciones, preguntas | `estado` de cada estación (`hecha` / `actual` / `cerrada`) |
| los renglones de átomos | `pistas` (cuántas quedan) |
| **la respuesta correcta de cada hueco** | `pistaEn` (los segundos para la siguiente) |
| las opciones, y **cuál es la correcta** | `escalon` (en cuál va) |
| **lo que revela cada opción equivocada** | `indice` / `total` del tema en la materia |
| **el texto de cada pista, escalonado** | `monedas` que se llevó |
| qué paso está mal y por qué | `respuestaInicial` (lo que el diseño muestra tecleado) |
| los motivos de la estación 5, y cuál es el bueno | `borrador` (lo que el estudiante lleva escrito) |
| **la rúbrica de la estación 6** | `hueco.valor`, `hueco.ancho`, `hueco.alto` |
| — | la frase del cierre, el aviso del guardián y las monedas |

En negritas, lo que hoy no existe en ningún archivo y es lo primero que la API
tiene que producir.

### El cierre no necesita IA

`ContenidoCierre` (`src/contenido/tipos.ts`) tiene tres campos y ninguno se
genera:

- `frase` es **`quedaSabiendo` del temario, tal cual**. Ya está escrita, ya está
  en primera persona y ya dice exactamente lo que el cierre tiene que cobrar: «Ya
  puedo dividir una fracción entre otra, y explicar por qué el resultado sale más
  grande». Pedírsela a la API sería pagar por reescribir peor una frase que un
  humano ya escribió 165 veces.
- `guardian` es **copy fijo**, el mismo en los 165 temas. El tema vuelve más
  adelante; no hay nada que personalizar y personalizarlo sólo abre la puerta a
  prometer una dificultad concreta.
- `monedas` es estado de la app.

Así que **son siete llamadas por tema, no ocho**: el canon y las seis estaciones.
No hay `07-cierre.md` y no hace falta.

### Falta el adaptador

`src/contenido/autoria.ts` tiene los tipos del contenido redactado, el espejo de
los esquemas. `src/contenido/tipos.ts` tiene los de la pantalla. **No son la misma
forma y no se pueden intercambiar**: la salida de `04-escalera` es
`escalones: EscalonRedactado[]` y `escalera.tsx` espera `escalones: number` más
`escalon: number`; los `motivos` de la 5 pasan de `string[]` a objetos con
`esElBueno`; la 2 pierde `indice` y `total`.

Entre los dos va `src/contenido/adaptar.ts`, **que todavía no existe**: la única
puerta que recibe el `TemaRedactado` más el estado del estudiante y devuelve el
`Tema` que las pantallas ya saben pintar. Ahí y sólo ahí se derivan `escalon`,
`indice`, `total`, `pistas` como contador, `pistaEn` y `estaciones[].estado`; ahí
se aplana `escalones[i]` al escalón en curso; ahí se arma el `cierre`. Mientras no
exista, el contenido generado se puede guardar y validar, pero las pantallas siguen
leyendo `demo.ts`.

`src/contenido/calificar.ts` sí existe: son las funciones puras que comparan lo
tecleado con `respuesta.tecleado` y `aceptaTambien`, y que devuelven qué decir
(`siTecleaElError.queSeLeDice`, `queRevela`, `siLoTocas`). Lo que falta ahí es
quién las llame.

**Consecuencia para los esquemas:** ningún esquema de estación lleva un campo de
estado. Ni `pistas: number`, ni `escalon`, ni `indice`, ni `estado`. Si un
prompt pide uno, está mal.

### Las listas son listas

- La estación 2 no es «pregunta 2 de 4». Es `preguntas[]`, y la app deriva el
  índice. Hoy `ContenidoContacto` trae `indice` y `total`
  (`src/contenido/tipos.ts:55-57`): eso se va.
- La estación 4 no es «escalón 4 de 5». Es `escalones[]`, y la app deriva el
  progreso. Hoy `ContenidoEscalera` trae `escalon` y `escalones: number`
  (`src/contenido/tipos.ts:70-72`): eso se va.
- Las pistas son `pistas[]` con su orden y su texto, no un entero.

---

## 5. Lo que la UI de hoy NO puede dibujar

Cada límite con su archivo y su línea. Ningún prompt puede pedir algo que caiga
en esta lista.

### El teclado: dígitos y diagonal, nada más

`app/estacion/completar.tsx:23-28`

```js
const FILAS = [['1','2','3'], ['4','5','6'], ['7','8','9'], ['/','0',BORRAR]];
```

Doce teclas. **No hay** punto decimal, signo menos, letras, paréntesis,
espacio, `^`, `=` ni `,`. La respuesta de la estación 3 tiene que casar con:

```
^[0-9]+(/[0-9]+)?$
```

Por decisión del contrato, la estación 4 se somete a la misma regla, aunque su
campo sea un `TextInput` del sistema (`app/estacion/escalera.tsx:86-95`) y
físicamente acepte letras. Mientras el teclado de la 3 sea éste, las dos
estaciones piden lo mismo.

Lo que esto mata: `0.8 g/cm³` como respuesta, `−25 m`, `NaCl`, `se hunde`,
`(a+b)²`. Las unidades **nunca** se teclean: van en el enunciado, y el hueco
recibe sólo el número.

**La diagonal es la raya de UNA fracción y nada más.** `a/b` se dibuja apilado como
a sobre b (`src/componentes/Expresion.tsx:171` y `193`) y el lector de pantalla lo
dicta «a entre b» (`Expresion.tsx:54-55`). No es «por», ni «y sobran», ni «a», ni un
separador de factores.

Esto importa más que el resto de la sección, porque es el único fallo del juego que
**no deja rastro**: un `"6/3"` escrito para «6 cajas y sobran 3 pelotas» pasa la
expresión regular, pasa ajv, pasa la auditoría, y la pantalla dibuja seis tercios. Se
publica. Si la respuesta son dos números que no son numerador y denominador, la
pregunta está mal planteada y se parte en dos escalones.

**El hueco no cabe dentro de un superíndice, de un subíndice ni de una fracción.**
`$defs.simbolo.sup` es una cadena, no un átomo, y `Expresion.tsx:150` lo pinta como
`<Text>`. Si lo que falta es un exponente, el hueco va suelto en el renglón y la
pregunta lo nombra. Y no hay átomo de raya de periodo: nada va encima de una cifra,
así que un decimal periódico no se puede ni dibujar.

### Un solo hueco por renglón

`src/componentes/Expresion.tsx:104`

```js
const escrito = valorHueco ?? parte.valor ?? '';
```

`valorHueco` es un solo string que se aplica a **todos** los huecos del renglón.
Dos huecos muestran lo mismo tecleado. No existe «completa los tres pasos».

### No hay tablas

Nada en `src/componentes/` dibuja una tabla. `Expresion` es una fila que se
envuelve (`src/componentes/Expresion.tsx:136-146`). Los temas cuya notación pide
tabla de dos o tres columnas (Química 5, 7, 19, 20, 29; Mate de datos) llegan
con `notacion: "tabla"` y hoy paran ahí.

### No hay figuras

Nada dibuja un plano cartesiano, una recta numérica, un diagrama de Lewis, un
esquema de fuerzas con flechas, una probeta, una escala de pH ni círculos
concéntricos. El único SVG del proyecto es el círculo del cierre
(`app/cierre.tsx:46-64`) y el de los iconos. Esos temas llegan con
`notacion: "figura"`.

### La opción de la estación 2 cabe en dos renglones

`app/estacion/contacto.tsx:120-131` — la tarjeta es `minHeight: 64`, no alto fijo, y
el envoltorio `flex: 1` de `contacto.tsx:70-77` está puesto a propósito para que una
opción larga **se parta** en vez de desbordarse. Aun así el bloque se ve mal cuando
una de las cuatro es el doble de alta que las otras, y una opción más larga se elige
por larga, no por cierta.

Medido en 390x844: la caja del texto son 270 px a 20 px, así que 29 caracteres es un
renglón y la tarjeta mide los 64 del diseño; 57 son dos renglones y mide 80; 85 son
tres y mide 113; a 86 la pantalla se desplaza. De ahí el tope: **hasta cuatro átomos,
y hasta 57 caracteres de texto en cada uno** (`textoCorto` en `partes.json`). Ese
tope es POR ÁTOMO y se multiplica: con las cuatro opciones a cuatro átomos de 57, las
tarjetas se van a 344 px cada una. Lo largo va en el `enunciado`, que es más ancho.

Los tres esquemas que pintan esa misma tarjeta la rutean por `parteMatCorta`:
`02-contacto`, `X1-tabla` y `X4-no-encaja`. Los dos últimos la rutaban por
`$defs.renglon` —24 átomos de 90— y era un tope treinta veces más flojo por la puerta
de atrás para la misma tarjeta de 64.

### El video no se reproduce

`app/estacion/ver.tsx:37-49` — la tarjeta es un recuadro y el `Pressable` de
reproducir **no tiene `onPress`**. `ContenidoVer`
(`src/contenido/tipos.ts:44-49`) no tiene ni URL. La estación 1 va a producir
una URL y una duración que hoy la pantalla ni recibe ni abre: el contenido se
guarda, la pantalla se conecta después.

### La estación 5 no sabe cuál motivo es el bueno

`app/estacion/error.tsx:79-100` — `motivos: string[]`, cadenas pelonas. No hay
cuál es la correcta, ni qué pasa al elegir mal. El contenido nuevo trae objetos;
la pantalla tendrá que leerlos.

### La estación 6 no tiene rúbrica

`app/estacion/explicar.tsx:14-22` — lo escrito se queda en `useState` y `listo`
sólo navega a `/cierre`. No hay nada contra qué juzgar la explicación. La
rúbrica es contenido nuevo.

### El texto de las pistas no tiene dónde leerse

Éste es el límite que no estaba declarado, y es el más caro.

Las estaciones 3, 4 y 5 generan pistas: 2 o 3 en la 3, 2 o 3 **por escalón** en la
4, 2 o 3 en la 5. Son hasta quince por tema, unas 2 500 en los 165. Y hoy no hay
por dónde leerlas:

- `app/estacion/completar.tsx` — el `Pressable` de «una pista en …» **no tiene
  `onPress`**. Es un adorno.
- `app/estacion/escalera.tsx` y `app/estacion/error.tsx` — no hay ni botón, sólo el
  contador de `BarraEstacion`.
- `src/componentes/` — no hay hoja, modal ni tarjeta donde quepa el texto.

Falta `src/componentes/HojaPista.tsx`: un `Modal` con la `Tarjeta` que ya existe,
que reciba `pistas[]` y el índice liberado. Es el primer componente que el
contenido nuevo pide, y hasta que exista los esquemas siguen pidiendo las pistas a
propósito: se generan una vez y duran, y bajarlas a opcionales ahora dejaría 165
temas sin ellas el día que la hoja se escriba.

### Nadie compara la respuesta

`app/estacion/completar.tsx`, `escalera.tsx`, `error.tsx` y `contacto.tsx` — los
tres «comprobar» y el «es ese» hacen `router.push` sin condición. El contenido que
la API produce para ese instante —`respuesta.tecleado`, `aceptaTambien`,
`siTecleaElError`, `opciones[].queRevela`, `motivos[].esElBueno`,
`pasos[].siLoTocas`— se guarda y nadie lo lee.

La mitad lógica ya está en `src/contenido/calificar.ts`: funciones puras que
comparan y devuelven qué decir. Falta la mitad de UI: un bloque de respuesta debajo
de la tarjeta (borde `colores.error` cuando falla, `colores.acento` cuando
acierta) y que `BotonPrincipal` avance sólo cuando la comparación pasa.
`siTecleaElError` es el caso más caro de perder: es un texto escrito para el
instante exacto en que el estudiante teclea 170, y ese instante hoy no existe.

### Tres de los cuatro teclados de X3 no existen

`app/estacion/completar.tsx` — `FILAS` es una constante. De los cuatro teclados que
`X3-respuesta-no-numerica` puede elegir, sólo `digitos` corre hoy: `fichas` pide que
`FILAS` salga del contenido, `opciones` pide una fila de opciones donde va el
teclado, `texto` pide un `TextInput` en la estación 3. Por eso ese prompt devuelve
`faltaCodigo` y, cuando va en `true`, `noSePuede` lleno con el teclado que falta y
un `planB` con dígitos. El llamador filtra por `noSePuede !== null`.

### Siempre seis estaciones

`app/cierre.tsx:23-29` — seis nodos calculados cada 60°, y `BarraEstacion`
tiene `const TOTAL = 6` (`src/componentes/BarraEstacion.tsx:16`). Ningún tema
puede tener cinco estaciones ni siete.

### El átomo nuevo ya se dibuja

`Expresion` ya tiene su rama para `simbolo` y `leerExpresion` ya lo dicta («H sub
2», «Ca 2 más»). Era el primer cambio de código que el contenido nuevo exigía, y
está hecho: sin él, `2H₂ + O₂ → 2H₂O` salía como cuatro recuadros vacíos y en la
estación 3 cada uno mostraba lo que el estudiante tecleaba.

Lo que sigue en pie es la regla: cualquier átomo cuyo `tipo` la pantalla no
reconozca cae en la rama del hueco. Un átomo abreviado, sin `tipo`, se pinta como
un recuadro punteado.

### Sin `fontWeight`, sin hex

Regla del repo (`AGENTS.md`): el peso ya viene en el `fontFamily` y ningún hex
sale de `src/tema`. El contenido no trae estilo: ni color, ni tamaño, ni peso.

---

### De dónde sale cada tope, y cuáles no salen de ninguna parte

Los once esquemas traen del orden de 840 líneas de `minLength`, `maxLength`,
`minItems` y `maxItems`. De todo eso, **diecisiete campos se pintan en una pantalla**,
y son los únicos que se pueden medir:

| Campo | Se pinta en |
|---|---|
| `ver.pregunta`, `ver.duracion`, `ver.resumen` | `ver.tsx:33`, `:47`, `:53` |
| `contacto.preguntas[].enunciado`, `opciones[].partes` | `contacto.tsx:41`, `:72-76` |
| `completar.expresion` | `completar.tsx:62-67` |
| `escalera.situacion`, `expresion`, `pregunta`, `respuesta` | `escalera.tsx:68`, `:74`, `:79`, `:86-95` |
| `error.enunciado`, `pasos[].partes`, `porQue`, `motivos[].texto` | `error.tsx:37`, `:65-69`, `:77`, `:95-97` |
| `explicar.titulo`, `aclaracion`, `nota` | `explicar.tsx:31`, `:32`, `:53` |

**La regla: un tope de un campo pintado lleva su medida escrita en la
`description`** — la pantalla, el ancho de la caja, el tamaño de letra, el
interlineado y en qué carácter cambia de renglón. Un tope sin su medida se vuelve a
poner a ojo dentro de seis meses, y así se pusieron casi todos los que había.

Tres cosas que conviene saber antes de medir el siguiente:

- **La estación 5 aprieta cinco veces más que las demás.** Su espaciador `flex: 1`
  mide 49 px; la 1 tiene 226, la 3 tiene 199 y la 4 tiene 259. Ahí es donde hay que
  medir primero, y es la razón de que `motivos` sean dos y de que el paso de la 5
  tenga su propio átomo de 33 caracteres (`renglonDePaso`).
- **Todo lo que va dentro de `Cuerpo` vive en un `ScrollView`**
  (`src/componentes/Cuerpo.tsx:14-24`), así que desbordar se paga en desplazamiento,
  no en recorte. Con una excepción que importa: `explicar.nota` vive en el `Pie`
  (`explicar.tsx:51-55`), fuera del scroll, y cada renglón que crece le quita 20 px
  al campo de escribir.
- **Los topes se multiplican.** Un tope por átomo con `maxItems` al lado no es el
  tope de la tarjeta: es el tope dividido entre el número de átomos.

**Los campos de prosa que ninguna pantalla pinta llevan `maxLength: 400`, uniforme
en los once esquemas.** Son `queRevela`, `siLoTocas`, `arrastre`, `comoSeLee`,
`queSeLeDice`, `pistas[].texto` y toda la `rubrica`. No pueden proteger nada —la
barra sólo dibuja el contador de pistas (`BarraEstacion.tsx:65-70`), no el texto— así
que un tope apretado ahí sólo compra reintentos. Antes la misma pista valía 200 en la
3, 160 en la 4 y 280 en la 5, sin ningún motivo. Cuando exista la superficie que los
pinte, se miden contra ella y se aprietan.

Lo mismo, pero más flojo, para la **bitácora de la estación 1** (`busqueda.criterios`,
`descarta`, `porQueEste`, `porQueEsaConfianza`): nada las lee, ya están en 500, 600 y
900, y ahí se quedan.

**Los topes de los cuatro esquemas aparte son provisionales.** X1, X2, X3 y X4 traen
casi quinientos topes sobre pantallas que **no existen**: ningún `.tsx` dibuja una
rejilla, una figura ni un teclado de fichas. No se aprieta ni uno hasta que la
pantalla exista, porque no hay contra qué medirlo. Las únicas excepciones medibles
hoy son las que reusan una pantalla que sí está: las opciones de la estación 2 (arriba)
y `X3.fichas` —`maxItems: 11` y `etiqueta` de 4— que reusa la rejilla de
`completar.tsx:23-28`: la tecla mide 110x56 y cuatro caracteres a 22 px son ~52 px.
Ése está medido y sale bien; no se toca.

---

## 6. La salida de emergencia

Todos los esquemas llevan `noSePuede`, y siempre viaja:

```json
"noSePuede": null
```

o

```json
"noSePuede": {
  "que": "el resultado del ejemplo es 0.8 g/cm³",
  "porQue": "el teclado de la estación 3 no tiene punto decimal",
  "queHagoConEsto": "pedir la división como fracción 8/10, o dejar el tema para cuando el teclado acepte decimales"
}
```

Vale más un tema con `noSePuede` lleno que un ejercicio que la pantalla no puede
dibujar: ahí el estudiante se traba y cree que el que está mal es él.

---

## 6bis. Lo que el llamador sabe, el modelo no lo escribe

Un campo obligatorio que el llamador ya sabe con certeza no protege nada: sólo agrega
una manera de tirar la llamada entera. Son los campos más cortos y los más del final
de cada objeto, que es justo lo que se le va a un modelo chico en una salida larga.

Éstos salen del `required` y los rellena `contenido/generar.mjs` **antes** de validar,
así que ni faltando ni mal escritos pueden tirar la llamada. Siguen en `properties`
para que el ejemplo de cada prompt sea un objeto completo:

| Campo | De dónde sale | Quién lo pone |
|---|---|---|
| `temaNumero`, `materia` | el temario | `sellarTraza` |
| `titulo` de raíz en 00-canon, X1, X2, X3 | el temario, «copiado sin cambiarlo» | `sellarTraza` |
| `opciones[].letra` | la posición: `'ABCD'[i]` | `sellarIndices` |
| `pistas[].orden`, `pasos[].numero` | la posición: `i + 1` | `sellarIndices` |
| `video.url`, `.titulo`, `.canal`, `.dondeSalio` (y en `alternativas`) | el oEmbed de YouTube y el campo `deDonde` del candidato (`buscar-videos.mjs:108-115`) | `sellarVideo` |
| `busqueda.consulta`, `.consultasAlternas` | `buscar-videos.mjs:137-143` la compone | `sellarVideo` |
| `faltaCodigo` en X3 | es `teclado !== 'digitos'` | `sellarTeclado` |
| `comoSeCompara.*` en X3 cuando el teclado no es `texto` | los tres van en `false` | `sellarTeclado` |

**Rellenar no es dejar de comprobar.** `comprobarTraza` y `comprobarIndices` corren
después: si el campo vino y no cuadra con su posición o con el temario, eso es una
respuesta cruzada y se rechaza. Rellenar quita la forma de fallar que no enseñaba
nada; la comprobación se queda con la que sí.

El `titulo` de `06-explicar` **no** está en esa lista: ése es la petición que la
pantalla pinta en grande, otra cosa con el mismo nombre. `TITULO_DEL_TEMARIO` en
`generar.mjs` es la lista de los cuatro pasos donde sí se sella.

Y el `idDeYouTube` tampoco: ése es la elección del modelo, es el único campo de
identidad del video que escribe, y con él el llamador rellena los otros cuatro.
`comprobarVideoEscogido` comprueba que esté en la lista de candidatos.

---

## 7. Los esquemas se mandan tal cual

Cada `*.schema.json` se usa como `input_schema` de una herramienta de la API de
Anthropic, así que **queda autocontenido**: sus `$defs` están dentro del propio
archivo y sus `$ref` son internos (`#/$defs/...`). Nada apunta a otro archivo.

Los átomos viven una sola vez, en `contenido/esquema/partes.json`, y se copian:

```bash
node contenido/esquema/armar.mjs             # revisa que todos estén al día
node contenido/esquema/armar.mjs --escribir  # los actualiza
```

Un esquema de estación se escribe sin bloque `$defs` y con `$ref` a
`#/$defs/parteMat`, `#/$defs/renglon`, `#/$defs/renglonConHueco`,
`#/$defs/tecleado` o `#/$defs/noSePuede`. `armar.mjs` le pega el bloque.

Reglas de forma, iguales en todos: `additionalProperties: false` en cada objeto,
`required` con todos los campos salvo los explícitamente opcionales,
`description` en español en cada campo, y límites de longitud en cada cadena
(una cadena sin tope se llena de relleno).

**Y el llamador valida.** La API **no** comprueba el `tool_use` contra el
`input_schema`: lo que devuelve el modelo puede no casar con el esquema que se le
mandó. El esquema sólo sirve si alguien lo corre. `contenido/generar.mjs` valida
cada respuesta con ajv 2020-12 antes de guardarla, y `node contenido/esquema/revisar.mjs`
comprueba que los once esquemas compilan y que el ejemplo de cada prompt valida
contra el suyo.

---

## 8. Cómo se hace la llamada

Cada esquema es el `input_schema` de **una** herramienta, y cada prompt de estación
manda la suya. Ésos son los nombres, y no cambian:

| Prompt | Herramienta | `description` de la herramienta |
|---|---|---|
| `00-canon.md` | `escribir_canon` | Fija el canon del tema: los cinco pasos, el ejemplo y el error, que las seis estaciones comparten. |
| `01-ver.md` | `escribir_estacion_ver` | Entrega la pregunta que abre el tema, el resumen y el video encontrado en la búsqueda. |
| `02-contacto.md` | `escribir_estacion_contacto` | Entrega el bloque de preguntas de cuatro opciones del primer contacto. |
| `03-completar.md` | `escribir_estacion_completar` | Entrega el renglón con un hueco, su respuesta y sus pistas. |
| `04-escalera.md` | `escribir_estacion_escalera` | Entrega los escalones de la escalera, con su respuesta y sus pistas. |
| `05-error.md` | `escribir_estacion_error` | Entrega el procedimiento con un paso mal, los motivos y las pistas. |
| `06-explicar.md` | `escribir_estacion_explicar` | Entrega los textos de la estación de explicar y la rúbrica con la que se califica. |
| `X1-tabla.md` | `escribir_caso_tabla` | Entrega las estaciones 2 a 5 de un tema que necesita rejilla. |
| `X2-figura.md` | `escribir_caso_figura` | Entrega la especificación de la figura y el plan B lineal. |
| `X3-respuesta-no-numerica.md` | `escribir_caso_teclado` | Elige el teclado del tema y escribe con él las respuestas de las estaciones 3 y 4. |
| `X4-no-encaja.md` | `escribir_caso_absorbido` | Entrega el aporte de un tema que no aguanta seis estaciones, cosido a una estación de otro. |

El modelo es **`claude-haiku-4-5`**. El id va sin sufijo de fecha
(`claude-haiku-4-5-20251001` da 404). Haiku 4.5 **no sirve `output_config.effort`**
—da error— y su pensamiento se pide con `budget_tokens`, no con `adaptive`.

El `system` es `00-sistema.md` tal cual, en las 1 155 llamadas. El prompt de la
estación, con los placeholders ya sustituidos, va como el único mensaje del
usuario.

### Las siete llamadas son iguales: forzadas y de un turno

`tool_choice: {"type": "tool", "name": "..."}` y un solo turno, en las once.
También `strict: true` en la herramienta, que hace que el servidor valide los
argumentos; si algún esquema sale rechazado por el subconjunto de `strict`, el
llamador lo apaga para toda la corrida y ajv sigue haciendo el trabajo.

**Esto antes no era así.** `01-ver` era la excepción, porque forzar la herramienta
y pedir búsqueda web del servidor son incompatibles: el modelo emitía la salida en
el primer turno y nunca buscaba. Esa excepción se acabó cuando la búsqueda salió
de la llamada.

### El video se busca aparte, y no lo busca quien escribe

La búsqueda de la estación 1 la hace **la API de OpenAI**, en
`contenido/buscar-videos.mjs`, antes de la llamada a Claude. Modelo `gpt-4.1-mini`
(documentado para la herramienta `web_search`, y el más barato que la sirve): aquí
no se le pide razonar, sólo buscar.

**Los ids de YouTube no se leen de lo que el modelo escribe.** Se leen de
`web_search_call.action.sources` y de las anotaciones `url_citation`, que es lo
único que el buscador visitó de verdad. Esto no es escrúpulo: un id inventado tiene
once caracteres válidos y casi siempre existe, así que lleva a un video cualquiera
y ninguna validación de forma lo caza. Después, cada id se comprueba contra el
oEmbed de YouTube, que además da el título y el canal de verdad —ahí no hay nada
que inventar— y prueba que el video es público y se deja incrustar.

`01-ver.md` recibe esa lista ya comprobada en `{{resultadosDeBusqueda}}` y su
trabajo es **escoger**, no encontrar. El llamador comprueba que el id que escogió
esté en la lista que se le dio; si no está, el video se tira y el tema se guarda
sin él.

Una lista vacía es una respuesta legítima. Un tema sin video se arregla después; un
video que no explica este tema se lo lleva el estudiante.

### Y el llamador comprueba, no confía

Antes de guardar cualquier respuesta:

1. **Contra el esquema**, con ajv 2020-12. La API no lo hace.
2. **`temaNumero` y `materia`** contra el tema que se pidió. Los siete esquemas de
   salida los traen por esto: un reintento que se cruza o una tanda que se reanuda a
   medias se caza aquí, y no con un tema cuya estación 5 acusa un paso de otro tema.
3. **Las URL de `01-ver`** contra el oEmbed de YouTube, que no pide llave, y el
   `title` y el `author_name` que devuelve contra el `titulo` y el `canal`
   reportados. Una URL que responde pero es otro video se tira igual.
4. **`noSePuede`**. Si viene lleno, el tema no se publica: se anota y se deja para
   cuando exista lo que falta.
