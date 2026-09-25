# Estación 5 · cazar el error

**Cuándo se llama:** una vez por tema, después del canon. No espera a ninguna
otra estación.
**Sistema:** `contenido/prompts/00-sistema.md`
**Esquema:** `contenido/esquema/05-error.schema.json`
**Entra:** un tema del temario (`contenido/temarios/<materia>.json`) y su canon.
**Sale:** `temaNumero`, `materia`, y un procedimiento resuelto por alguien más con
exactamente un paso mal, lo que se contesta al tocar cada paso, los motivos y las
pistas.

Esta estación es la única donde el estudiante lee un procedimiento ajeno en vez
de hacer el suyo. Si el paso malo se nota a simple vista, la estación no enseña
nada: se vuelve un juego de buscar el renglón raro.

---

## Mensaje del usuario

Vas a escribir la estación 5 de un tema: cazar el error.

En pantalla se ve un procedimiento de cinco pasos, resuelto por alguien más, con
exactamente un paso mal. El estudiante toca el paso que acusa. Cuando ya lo
marcó, se le pregunta qué se hizo mal y elige entre unos motivos. Aquí no se
corrige nada y no se teclea nada: se acusa un paso y se elige un motivo.

## Qué recibes

El tema del temario:

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

Y el canon del tema, completo:

{{canon}}

Atajos, para que no se te pasen:

- Procedimiento: {{canon.procedimiento.nombre}}
- El ejemplo va de: {{canon.ejemplo.deQueVa}}
- El error cae en el paso: {{canon.error.pasoQueCorrompe}}
- Lo que el estudiante cree: {{canon.error.creenciaDeAtras}}
- Números que puede usar el tema: {{canon.cotas.numeros}}

**No recibes lo que escribieron las otras cinco estaciones.** Corren en
paralelo y no se pueden hablar contigo. Lo único que comparten contigo es el
canon, y por eso el canon es ley: sus cinco pasos, su numeración, los números de
su ejemplo, las palabras de su vocabulario y sus cotas. Nunca escribas «el
ejercicio que ya resolviste» ni «como viste en el video»: no sabes qué decía. Lo
único que puedes dar por visto es el ejemplo del canon, porque las estaciones 3 y
4 trabajan sobre él.

## Cómo se escriben los renglones

Todo lo que se ve como matemáticas, química o física se arma con cuatro átomos:

| Átomo | Se ve así | Para qué |
|---|---|---|
| `{"tipo":"texto","valor":"÷"}` | ÷ | palabras, signos, flechas (`→`), comparaciones |
| `{"tipo":"fraccion","arriba":3,"abajo":5}` | tres quintos apilados | cualquier fracción |
| `{"tipo":"simbolo","valor":"H","sub":"2"}` | H con 2 al pie | subíndice, superíndice, carga, unidad, variable con letra |
| `{"tipo":"hueco"}` | recuadro punteado | **aquí no se usa** |

Reglas que no se negocian:

- `fraccion.arriba` y `fraccion.abajo` son **una sola cadena** cada uno. No caben
  átomos adentro y no se anida una fracción dentro de otra. Si arriba necesita un
  subíndice, se escribe con palabras: `masa del soluto`.
- Nunca `"3/5"` en un renglón: eso es una `fraccion`. La diagonal en `texto` sólo
  vale dentro de una unidad compuesta (`m/s`, `mg/L`).
- Un `simbolo` sin `sub` ni `sup` es `texto`.
- El menos es `−` (U+2212), no un guion. El por es `×`, no `x` ni `*`.
- **Ningún renglón de esta estación lleva `hueco`.** En la 5 no hay nada que
  llenar. Un hueco aquí es un recuadro punteado que no se puede tocar.

- Cada átomo va **completo**, con su `tipo` y su `valor`. `{"texto":"× 5"}` no es
  un átomo: es un objeto sin `tipo`, y la pantalla lo dibuja como un recuadro
  vacío (`src/componentes/Expresion.tsx:104`).

Ejemplos del alcance. 360 = 2³ × 3² × 5:

```json
[{"tipo":"texto","valor":"360 ="},
 {"tipo":"simbolo","valor":"2","sup":"3"},
 {"tipo":"texto","valor":"×"},
 {"tipo":"simbolo","valor":"3","sup":"2"},
 {"tipo":"texto","valor":"× 5"}]
```

2H₂ + O₂ → 2H₂O:

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

Y 10 m/s² es `[{"tipo":"texto","valor":"10 m/"},{"tipo":"simbolo","valor":"s","sup":"2"}]`.

## Qué tienes que producir

### 1. `enunciado`

Un renglón que diga de quién es la resolución que se va a leer, con los datos del
ejemplo del canon escritos con átomos, y que cierre avisando que hay exactamente
un paso mal y que hay que tocarlo. Los mismos números de `canon.ejemplo`: no
cambias ninguno.

### 2. `pasos`

Cinco pasos, numerados del 1 al 5, en la voz de quien resolvió: primera persona
corta y luego la cuenta («Volteo la segunda:», «Divido entre el tiempo:»). Se
arman así:

- Los pasos **antes** de `canon.error.pasoQueCorrompe`: los renglones del canon,
  con sus números tal cual.
- El paso **en** `canon.error.pasoQueCorrompe`: `canon.error.renglonMalo`. Ése es
  el paso malo, y va en esa posición y en ninguna otra.
- Los pasos **después** del malo: los pasos del canon, pero rehechos con el
  número malo que les llegó. El último tiene que aterrizar exactamente en
  `canon.error.resultadoMalo`.

Cada paso cabe en dos renglones de un teléfono de 390. Si necesita tres, sobra
explicación.

**Los cinco pasos se escriben con la misma voz y el mismo largo.** Verbo en
primera persona, y enseguida la cuenta escrita: «Anoto con la que arrancó:»,
«Divido entre el tiempo:», «Resto para sacar el cambio:». Eso vale también —y
sobre todo— para el paso malo. Si cuatro pasos traen una cuenta y el malo es una
frase suelta sin operación, el malo se caza sin entender nada: se toca el renglón
que no se parece a los otros. Ahí toda la sección del arrastre deja de servir,
porque el paso malo se anunció solo.

El canon te da `renglonMalo` ya con esa forma. Si te llegó como una frase sin
cuenta —pasa cuando el error es omitir una operación— escríbela con el número que
el estudiante supone: un 0, el mismo número repetido, el dato que sí vio. Suponer
que el coche arrancó de cero es un error real de 2º de secundaria, y escrito como
`20 m/s − 0 m/s = 20 m/s` mantiene la voz y el largo de los otros cuatro.

La prueba: tapa los números de los cinco renglones. Si el malo sigue
distinguiéndose, rehazlo.

### 3. El arrastre: lo que hace que esta estación sirva

**Los pasos después del malo tienen que arrastrar el error y ser coherentes con
él.** En el diseño, el paso 4 dice «Abajo: 3 + 4 = 7» y el paso 5 dice «Queda:
10/7»: el 7 malo del paso 4 reaparece en el paso 5, porque quien resolvió siguió
trabajando con lo que traía. Así se ve una resolución de verdad.

**Si los pasos siguientes están bien, el malo se delata solo y la estación se
vuelve un juego de buscar el renglón raro.** El estudiante toca el único paso que
no cuadra con los demás, acierta sin haber entendido nada, y la estación se
convierte en un ejercicio de vista.

Por eso `arrastre` es un campo obligatorio: dices qué números de los pasos
posteriores vienen del error, nombrando sus pasos. Si no puedes nombrarlos, tus
pasos posteriores no arrastran nada y el ejercicio está mal armado: rehazlos
antes de devolver.

Si `canon.error.pasoQueCorrompe` es 5, no hay nada después que arrastrar. Dilo
así en `arrastre` y di cuál es entonces la señal que delata el error, que suele
ser `canon.error.comoSeCacha`.

### 4. `pasoMalo`

El número del paso corrompido. Es exactamente `canon.error.pasoQueCorrompe`. No
eliges otro paso porque te parezca más cazable: la estación 3 enseñó ese paso y la
5 lo cobra. Uno solo está mal: nunca dos, nunca cero.

### 5. `siLoTocas`, en cada paso

Qué se contesta si el estudiante acusa ese paso. Paso por paso, uno distinto en
cada uno:

- En un paso que está bien: di qué hace bien **ese** paso, nombrando su cuenta o
  sus números, de modo que la respuesta no le quede a ningún otro paso. Nunca
  «no, ese no».
- En un paso que arrastra el error: la cuenta sí está bien hecha con los números
  que le llegaron. Dilo, y di que ese paso recibió sus números en vez de
  inventarlos, sin nombrar el paso malo ni el número corrompido. El estudiante ya
  gastó un toque; no le regales el otro.
- En el paso malo: confirma la acusación y nada más. Qué se hizo mal se pregunta
  en `porQue` y se contesta en `motivos`.

### 6. `porQue` y `motivos`

`porQue` es la pregunta corta que aparece cuando el paso ya está marcado.

`motivos` son de dos a cuatro, exactamente uno con `esElBueno` en `true`:

- El bueno describe el error del canon, no una versión suavizada.
- Los malos salen de `canon.error.creenciaDeAtras` y de confusiones reales del
  tema: cambiar el orden de una resta, mirar el número de abajo en vez del de
  arriba, quedarse con el dato más grande. Tienen que sonar razonables, porque un
  motivo que nadie escogería no diagnostica nada.
- `queRevela` de un motivo malo dice qué cree el estudiante que lo trae ahí, y
  cuál es la señal concreta de los renglones que ese motivo no explica. El del
  bueno dice por qué sí es ése, contra lo que se ve en los renglones.
- Cada motivo es de una frase: el botón es angosto.

### 7. `pistas`

Dos o tres, escalonadas. La 1 reencuadra sin señalar nada. La 2 estrecha la
búsqueda a una zona o a un dato. La 3, si va, dice qué comparar. Ninguna dice el
número del paso malo ni nombra el motivo bueno. Cuántas quedan y cuándo se
liberan lo pone la app: tú sólo escribes el orden y el texto.

### 8. `noSePuede`

`null` cuando la estación salió completa. Se llena cuando `renglonMalo` no se
puede escribir con los cuatro átomos, cuando el error sólo se ve en una tabla o
en un dibujo, o cuando el error del canon no deja nada que arrastrar y el
ejercicio queda trivial. Antes de llenarlo, intenta una vez reescribir el renglón
malo con los átomos que sí hay. Si esa reescritura cambia el error que el tema
enseña, entonces sí: `noSePuede`.

## Lo que no haces

- No inventas un error nuevo porque te suene mejor que el del temario. El paso
  malo es `canon.error.renglonMalo`, en la posición
  `canon.error.pasoQueCorrompe`.
- No dejas los pasos posteriores al malo bien resueltos.
- No corriges nada. Ningún paso trae la versión buena al lado, ni un «debería
  ser», ni un paréntesis aclarando.
- No marcas el paso malo. Ni con comillas, ni con un signo distinto, ni
  haciéndolo más corto que los otros, ni escribiéndolo con otra voz, ni dejándolo
  sin la cuenta que los otros cuatro sí traen. Se ve igual que los otros cuatro.
- No pones dos pasos malos, ni cero, ni seis pasos, ni cuatro.
- No cambias los números del ejemplo del canon, ni te sales de
  `canon.cotas.numeros`.
- No metes `hueco` en ningún renglón.
- No repites la misma frase de `siLoTocas` en dos pasos, ni escribes un «no, ese
  no» genérico.
- No pones dos motivos que digan lo mismo con otras palabras.
- No pones un motivo malo que se caiga por absurdo («sumó dos números al azar»).
- No adelantas la respuesta en `porQue` ni en las pistas.
- No usas sinónimos de las palabras de `canon.vocabulario`.
- No pones nada de estado: ni cuántas pistas quedan, ni en qué paso va, ni el
  estado de la estación, ni monedas, ni «paso 3 de 5».

## Un ejemplo completo

Para el tema 7 de Física, «Aceleración: cambiar de velocidad», 2º de secundaria.
Su error típico en el temario: confunde ir rápido con acelerar. Del canon que
recibirías, lo que manda aquí:

```
procedimiento.nombre  Calcular una aceleración con dos velocidades y un tiempo
pasos[1]  Anotas la velocidad inicial        v_i = 4 m/s
pasos[2]  Anotas la velocidad final          v_f = 20 m/s
pasos[3]  Restas final menos inicial         20 m/s − 4 m/s = 16 m/s
pasos[4]  Divides el cambio entre el tiempo  16 m/s ÷ 4 s = 4 m/s²
pasos[5]  Lees el signo del resultado        a = 4 m/s², positiva
ejemplo   un coche que pasa de 4 m/s a 20 m/s en 4 s; resultado 4 m/s²
error.pasoQueCorrompe  3
error.renglonMalo      Resto para sacar el cambio: 20 m/s − 0 m/s = 20 m/s
error.resultadoMalo    a = 5 m/s²
error.creenciaDeAtras  cree que acelerar es ir rápido, así que el número grande
                       de la velocidad final ya es la respuesta
```

Y la salida:

```json
{
  "temaNumero": 7,
  "materia": "fisica",
  "enunciado": [
    { "tipo": "texto", "valor": "Alguien calculó la aceleración de un coche:" },
    { "tipo": "simbolo", "valor": "v", "sub": "i" },
    { "tipo": "texto", "valor": "= 4 m/s," },
    { "tipo": "simbolo", "valor": "v", "sub": "f" },
    { "tipo": "texto", "valor": "= 20 m/s, en 4 s. Hay exactamente un paso mal. Tócalo." }
  ],
  "pasos": [
    {
      "numero": 1,
      "partes": [
        { "tipo": "texto", "valor": "Anoto con la que arrancó:" },
        { "tipo": "simbolo", "valor": "v", "sub": "i" },
        { "tipo": "texto", "valor": "= 4 m/s" }
      ],
      "siLoTocas": "Ese paso sólo copia la velocidad con la que el coche arrancaba, y los 4 m/s venían en el problema. Copiar bien un dato no es el error."
    },
    {
      "numero": 2,
      "partes": [
        { "tipo": "texto", "valor": "Anoto con la que terminó:" },
        { "tipo": "simbolo", "valor": "v", "sub": "f" },
        { "tipo": "texto", "valor": "= 20 m/s" }
      ],
      "siLoTocas": "Los 20 m/s también venían en el problema, y ese paso los anota en su lugar. El error no está en copiar la velocidad final."
    },
    {
      "numero": 3,
      "partes": [
        { "tipo": "texto", "valor": "Resto para sacar el cambio:" },
        { "tipo": "texto", "valor": "20 m/s − 0 m/s = 20 m/s" }
      ],
      "siLoTocas": "Ahí está. Ese renglón es el que les pasa su número a los dos pasos que siguen."
    },
    {
      "numero": 4,
      "partes": [
        { "tipo": "texto", "valor": "Divido entre el tiempo:" },
        { "tipo": "fraccion", "arriba": "20 m/s", "abajo": "4 s" },
        { "tipo": "texto", "valor": "= 5 m/" },
        { "tipo": "simbolo", "valor": "s", "sup": "2" }
      ],
      "siLoTocas": "La división está bien hecha: 20 entre 4 da 5, y abajo están los segundos. Ese paso no inventó ninguno de sus dos números, los recibió."
    },
    {
      "numero": 5,
      "partes": [
        { "tipo": "texto", "valor": "Sale positiva, así que gana velocidad: a = 5 m/" },
        { "tipo": "simbolo", "valor": "s", "sup": "2" }
      ],
      "siLoTocas": "Leer el signo es lo último y ese paso lo lee bien: positiva significa que el coche iba ganando velocidad. Ese renglón repite el número que le llegó."
    }
  ],
  "pasoMalo": 3,
  "arrastre": "El 20 del paso 3 es el 20 de arriba de la división del paso 4, y de ahí sale el 5 del paso 5. Los pasos 4 y 5 están bien hechos con un número malo: si sólo buscaras el renglón raro, no encontrarías ninguno.",
  "porQue": "¿Y qué hizo mal en ese paso?",
  "motivos": [
    {
      "texto": "Tomó la velocidad final como si ya fuera el cambio de velocidad.",
      "esElBueno": true,
      "queRevela": "Es lo que pasó: el 20 entró a la división sin haberle quitado los 4 m/s del arranque. El renglón sí resta, pero le resta 0, como si el coche hubiera salido detenido. Los 4 m/s del problema no aparecen en ninguna cuenta."
    },
    {
      "texto": "Restó al revés: la inicial menos la final.",
      "esElBueno": false,
      "queRevela": "Quien escoge esto ya sabe que ahí va una resta y sólo duda del orden. Pero al revés sería 4 menos 20, y eso deja un número negativo. La resta está en el orden bueno; lo que está mal es el segundo número."
    },
    {
      "texto": "Dividió entre la velocidad en vez de entre el tiempo.",
      "esElBueno": false,
      "queRevela": "Detrás de esto está creer que la aceleración se mide contra la rapidez. Abajo de la fracción del paso 4 están los 4 s, con su unidad de tiempo: esa división sí se hizo entre el tiempo."
    },
    {
      "texto": "Se le olvidó anotar el tiempo.",
      "esElBueno": false,
      "queRevela": "El tiempo sí se usó: son los 4 s que están abajo en el paso 4. Lo que no aparece en ninguna cuenta es la velocidad del arranque."
    }
  ],
  "pistas": [
    {
      "orden": 1,
      "texto": "Cuatro de los cinco pasos hacen bien lo que les toca. El error no es una cuenta mal hecha: es un número que no debería estar donde está."
    },
    {
      "orden": 2,
      "texto": "El problema traía tres datos. Búscalos en los renglones: uno se anotó y después no volvió a aparecer en ninguna cuenta."
    },
    {
      "orden": 3,
      "texto": "En uno de los cinco renglones aparece un número que el problema nunca dio. Compara los renglones con los tres datos del enunciado."
    }
  ],
  "noSePuede": null
}
```

Fíjate en lo que hace ese ejemplo: el paso 4 divide bien y el paso 5 lee bien el
signo. Los dos están mal sólo porque el 20 del paso 3 no era el cambio de
velocidad. Y el paso 3 **escribe su resta**, con verbo en primera persona y la
cuenta completa, igual que los otros cuatro: lo que está mal es el 0, no la forma
del renglón. Ninguno de los cinco se ve raro por sí solo, así que tapando los
números no se distingue cuál es.

## Antes de devolver, revísate

1. ¿`pasoMalo` es exactamente `canon.error.pasoQueCorrompe`?
2. ¿El renglón de ese paso es `canon.error.renglonMalo`?
3. ¿El último paso aterriza en `canon.error.resultadoMalo`?
4. ¿Cada paso después del malo usa el número malo, y sigue estando bien hecho con
   ese número?
5. ¿Puedes nombrar, en `arrastre`, qué número de qué paso salió de cuál?
6. ¿Son cinco pasos, del 1 al 5, con la numeración del canon?
7. ¿Ningún renglón lleva `hueco`?
8. ¿Ninguna `fraccion` tiene átomos adentro? ¿Ningún `simbolo` va sin `sub` ni
   `sup`?
9. ¿Nada de `"3/5"` en un renglón, nada de guion por menos, nada de `x` por `×`?
10. ¿El paso malo tiene la misma voz (verbo en primera persona más la cuenta) y
    un número de átomos parecido a los otros cuatro? Si tapas los números, ¿se
    distingue del resto? Si sí, rehazlo.
11. ¿Cada átomo lleva su `tipo` y su `valor` completos, sin abreviar?
12. ¿Los cinco `siLoTocas` son distintos entre sí, y cada uno sólo le queda a su
    paso?
13. ¿Exactamente un motivo tiene `esElBueno` en `true`, y los otros suenan
    razonables?
14. ¿`temaNumero` y `materia` son los del canon, copiados sin cambiarlos?
15. ¿`noSePuede` viaja, aunque sea en `null`?
