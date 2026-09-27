# Estación 1 · ver el video

**Cuándo se llama:** después del canon, y puede ir en paralelo con las otras
cinco estaciones: no depende de ninguna.
**Sistema:** `contenido/prompts/00-sistema.md`
**Esquema:** `contenido/esquema/01-ver.schema.json`
**Herramientas:** ninguna aparte de la de salida. **Tú no buscas.** La búsqueda ya
se hizo con la API de OpenAI (`contenido/buscar-videos.mjs`) y sus resultados
llegan interpolados en `{{resultadosDeBusqueda}}`, ya comprobados contra el oEmbed
de YouTube. Tu trabajo es **escoger** entre ellos, no encontrarlos.
**Entra:** un tema del temario (`contenido/temarios/<materia>.json`) y el canon
del tema (la salida del paso 0).
**Sale:** la pregunta que abre el tema, el resumen de dos frases, la búsqueda con
la que se encontró el video, el video elegido, dos respaldos y la confianza.
**Después:** quien llama **valida** las tres URL contra el endpoint oEmbed de
YouTube antes de guardar nada. El modelo no es la validación.

Es la única estación sin respuesta y sin pistas. También la única que sale a la
web, y por eso la única que puede inventar algo que se comprueba con un clic: un
id de YouTube.

---

## Mensaje del usuario

Vas a escribir lo que abre un tema de Andamio: la estación 1, la del video. Es
la primera de las seis y la única en la que el estudiante no contesta nada. Nada
más mira, y decide si ya lo sabía.

Tu trabajo tiene dos mitades y ninguna se puede saltar:

1. Escribir la pregunta con la que arranca el tema, y el resumen que la cierra.
2. **Buscar en la web** un video que de verdad exista y que contesta esa
   pregunta, más dos respaldos.

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

`losCincoPasos` es el borrador del temario. El canon ya lo abrió en cinco pasos
de verdad: manda el canon.

## El canon

{{canon}}

El canon se fijó antes que tú y lo comparten las seis estaciones de este tema.
Es ley: no renombras un paso, no cambias los números del ejemplo, no usas
sinónimos de las palabras de `vocabulario`.

Para lo tuyo, mira sobre todo esto:

- El procedimiento se llama {{canon.procedimiento.nombre}}. Si lo nombras, lo
  nombras así.
- El ejemplo canónico va de {{canon.ejemplo.deQueVa}}. **No lo uses.** La
  estación 3 lo va a mostrar, la 4 lo estira y la 5 lo rompe; si tú lo gastas
  aquí, el estudiante lo ve cuatro veces y la estación 3 llega sin novedad.
- Lo que el estudiante cree, y lo lleva al error: {{canon.error.creenciaDeAtras}}.
  Tu pregunta puede apuntar justo a esa creencia. No la corrige: corregirla es
  la estación 5.

Eres la primera. No recibes nada de las otras cinco estaciones, y lo que
escribas no es ley para ellas: ellas reciben el canon, no tu texto. Así que no
escribas ejercicios, ni opciones, ni pistas, ni respuestas. Aquí no hay ninguna.

## 1 · `pregunta`

Es lo primero que se ve, escrito grande arriba de la pantalla.

**No es el título del tema.** El título nombra el tema; esta pregunta abre el
hueco que el tema va a llenar. «División de fracciones» es un título; «¿Por qué
se voltea la segunda?» es la pregunta.

- Pregunta por el **por qué**, o por lo que el procedimiento esconde. No por el
  cómo: «¿Cómo se dividen dos fracciones?» no abre nada, sólo anuncia el índice.
- La contesta el video. Si el video no la contesta, es otra pregunta o es otro
  video.
- No dice la respuesta. Tampoco insinúa el truco.
- Es sobre la materia, no sobre el estudiante. No «¿Sabías que…?», no
  «¿Te has preguntado…?».
- Una sola pregunta. Abre con el signo de apertura y cierra con el de cierre.
- **Sin fórmulas.** Aquí no hay átomos: es una cadena que la pantalla pinta tal
  cual. Lo que necesite un subíndice, un exponente o una fracción se dice con
  palabras («el número de abajo», «el cloro se repite dos veces»). Un símbolo de
  elemento pelón sí se puede escribir: Ca, Cl, O.
- **Máximo 70 caracteres, y está medido**: se pinta a 27 puntos con interlineado
  de 33 en una pantalla de 390, y 70 es justo donde se acaba el tercer renglón.
  En 71 se va al cuarto y empuja el video fuera de la pantalla. Cuéntalos.

  Lo que hace que se pase es meter la respuesta en la pregunta. La pregunta
  señala el hueco; no lo explica.

  ```
  [95] no   ¿Por qué cuando divides un número grande entre uno chico no siempre
            el resultado es más grande?
  [43] sí   ¿Dividir siempre achica el resultado?

  [30] sí   ¿Por qué se voltea la segunda?     ← el del diseño, dos renglones
  ```

## 2 · `resumen`

Dos frases debajo del video. Dicen **la idea**, no el procedimiento.

- La prueba: si tu resumen se puede seguir como receta, está mal escrito. Ese
  texto es de la estación 3.
- La primera frase dice de qué se trata; la segunda cierra. Nada más.
- No repite la pregunta con otras palabras.
- No usa los números del ejemplo del canon.
- **Entre 60 y 220 caracteres, medido**: a 15 puntos con interlineado de 24, 220
  es donde se acaba el quinto renglón. El del diseño tiene 100 y ocupa tres, que
  es lo que conviene: dos frases cortas, no tres largas.
- No promete lo que el video va a decir («en este video vas a ver…»). Dice lo
  que queda cuando el video se acaba.
- Entre 60 y 200 caracteres. El de la pantalla de diseño tiene 101.

## 3 · Los videos que ya se buscaron

```
{{resultadosDeBusqueda}}
```

**Ésta es la única fuente de URLs que tienes.** Cada una de esas ya se comprobó:
el video existe, es público y se deja incrustar; el título y el canal vienen de
YouTube, no de un modelo.

La regla que no se negocia: **copia la URL de uno de los de arriba, carácter por
carácter.** No escribas ninguna otra. Un id de YouTube inventado tiene once
caracteres válidos y casi siempre existe —lleva a un video cualquiera, de
cualquier tema— así que ni tú ni nadie puede cacharlo mirando la forma. Lo único
que prueba algo es que el id esté en esa lista. Quien llama lo comprueba y tira
el video si no está.

Si la lista viene vacía, o si ninguno de los que trae sirve de verdad para este
tema, deja `video` en `null` y llena `noSePuede`. Un tema sin video se puede
arreglar después; un video que no explica este tema se lo lleva el estudiante.

En `busqueda` guardas con qué palabras buscarías tú este tema y qué criterio usaste
para escoger. Eso se guarda para el día en que el video muera y alguien tenga que
repetir la búsqueda sin volver a pensarlo todo.

Los `criterios` se pueden revisar mirando el video. «Que sea de buena calidad»
no es un criterio; «que diga por qué se cruzan las valencias y no nada más cómo»
sí lo es.

## 4 · Cómo se elige, en este orden

1. **Explica el por qué.** No nada más el algoritmo ni el truco para
   memorizarlo.
2. **Es del nivel de {{tema.grado}}.** Ni un examen de bachillerato ni un video
   para niños de primero.
3. **Español de México.** Si no hay, de América Latina. Si tampoco, de España, y
   entonces la confianza no puede ser `alta`. Lo declaras en
   `variedadDeEspanol`.
4. **Corto y al punto.** Llega al ejemplo pronto, sin presentación del canal ni
   pedir suscripción antes de empezar.
5. **El canal existe** y tiene más videos. Un canal con un solo video sube el
   riesgo de que el enlace muera.

Entre un video que explica el por qué y uno con mejor acento, **gana el que
explica el por qué**. Ése es el punto de esta estación.

Y un descarte que importa en las cuatro materias: **si el video enseña el error
típico del tema como si fuera el método, se va.** No se salva por bien
producido. Mira `{{tema.errorTipico}}` y el `error` del canon antes de elegir.

## 5 · Lo que no se hace con una URL

Lee esto dos veces. Es la parte de esta llamada que se rompe callada.

Un id de YouTube son once caracteres de ruido, y el ruido se imita sin darse
cuenta. Un id inventado casi siempre **existe**, y lleva a un video cualquiera.
Para el estudiante eso es peor que un enlace muerto: aprieta reproducir y ve
algo que no tiene nada que ver con lo que está estudiando, y concluye que la app
no sabe lo que hace.

- **No reportas ninguna URL que no haya aparecido literalmente en los resultados
  de búsqueda de esta llamada.** Ni una.
- No armas una URL con un id que recuerdes. No recuerdas ids.
- No completas ni corriges un id al que le falte un carácter. Si no salió
  entero, no salió.
- No cambias un carácter para que la URL se vea bien.
- No reportas un video porque conozcas el canal y supongas que tiene uno de este
  tema.
- No reportas un video que salió buscando otra cosa.
- No traduces, ni acortas, ni arreglas el título. Se copia como venía, con sus
  mayúsculas.
- No adivinas el canal. Si el resultado no traía canal, lo dices así y la
  confianza baja.
- **No estimas la duración. Nunca.** Si el tiempo no venía escrito en el
  resultado, omites `duracion`. Es el único campo opcional del esquema y existe
  exactamente por esto: una duración inventada se pinta sobre el video y el
  estudiante la descubre mal en el primer segundo.
- No rellenas `alternativas` para tener dos. Si la búsqueda trajo uno, pones uno
  y bajas la confianza. Un respaldo inventado es peor que no tener respaldo.
- Una sola forma de URL: la de `watch`, 43 caracteres. Nada de `youtu.be`, de
  `/shorts/`, de `/embed/`, de `/playlist`, ni de parámetros pegados al final.
- `url` e `idDeYouTube` tienen que decir lo mismo. Van separados a propósito:
  quien llama los compara y tira el video si no cuadran. Un par que no cuadra es
  un par inventado.
- `dondeSalio` es la huella: con qué consulta salió y cómo venía escrito el
  título. Si no lo puedes escribir sin adornarlo, no tienes ese video.

Y `confianza` se declara de verdad. `alta` sólo cuando la URL y el título
salieron literales, el canal se ve, explica el por qué y el español es de México
o de América Latina. Si falta algo, es `media`, y `porQueEsaConfianza` dice qué
falta, por su nombre. Una confianza inflada le quita a quien llama la única
señal que tiene.

## 6 · Tú no eres la validación

Quien llama comprueba las tres URL antes de guardar nada, con el endpoint oEmbed
de YouTube, que no pide llave:

```
https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=EL_ID_DE_ONCE_CARACTERES&format=json
```

- **200** con un JSON que trae `title` y `author_name`: el video existe, es
  público y se puede incrustar.
- **401, 403 o 404**: se borró, es privado o no deja incrustarse. Se pasa a la
  primera alternativa.
- **400**: el id está mal formado.
- oEmbed **no** devuelve duración. Ésa sale de la API de datos de YouTube
  (`contentDetails.duration`), y mientras no salga, el recuadro se queda vacío.

Y la comprobación que de verdad importa: el `title` y el `author_name` que
devuelve oEmbed se comparan con el `titulo` y el `canal` que tú reportaste. Si
la URL responde pero es otro video, se tira igual.

Que exista esa validación **no te afloja nada**. Atrapa la URL muerta; no atrapa
un video vivo que no explica este tema, o que lo explica para otro grado, o que
enseña el error típico como método. Eso sólo lo atrapas tú, y por eso se te pide
la huella y la confianza.

## 7 · Cuando no hay video

Antes de rendirte, reformula **una** vez: una consulta más corta, con las
palabras del temario en vez de las del canon, o apuntando al tema del que este
depende ({{tema.dependeDe}}).

Si tampoco:

- `video`: `null`
- `alternativas`: `[]`
- `confianza`: `baja`
- `noSePuede` lleno, con qué faltó, por qué y qué sigue.

`pregunta` y `resumen` se escriben igual. El tema abre con ellos y la tarjeta del
video se queda vacía: eso se puede ver en pantalla. Un video equivocado no.

## Ejemplo de salida

Química, tema 23, «Fórmula por cruce de valencias», 3º de secundaria.

Las tres URL de este ejemplo se buscaron de verdad y se validaron con oEmbed.
Si alguna ya murió, eso mismo prueba por qué se piden dos alternativas y por qué
quien llama valida.

```json
{
  "temaNumero": 23,
  "materia": "quimica",
  "pregunta": "¿Por qué la valencia de uno acaba al pie del otro?",
  "resumen": "Cruzar valencias no es un truco de escritura. El subíndice de cada elemento cuenta cuántos átomos hacen falta para que las cargas se cancelen y el compuesto quede neutro.",
  "busqueda": {
    "consulta": "youtube cruce de valencias explicación por qué se cruzan las valencias fórmula química",
    "consultasAlternas": [
      "cruce de valencias reglas básicas química tercero de secundaria video",
      "por qué el subíndice de un elemento es la valencia del otro explicación"
    ],
    "criterios": [
      "Explica por qué la valencia de uno acaba como subíndice del otro, no nada más el paso de cruzar las flechas.",
      "Está en español. Se prefiere de México o de América Latina; si es de España se marca y la confianza no puede ser alta.",
      "Es del nivel de tercero de secundaria: compuestos de dos elementos, sin iones poliatómicos ni nomenclatura de sales.",
      "Llega a escribir una fórmula antes del minuto dos, sin presentación del canal.",
      "Dice que los subíndices se simplifican, porque ahí se cae el error típico de este tema."
    ],
    "descarta": [
      "Cambia un subíndice ya escrito para que cuadren los átomos: ese es el error típico del tema enseñado como si fuera el método.",
      "Es un examen resuelto de bachillerato o una lista de aniones poliatómicos.",
      "Son diez minutos de tabla de valencias para memorizar y nunca escribe una fórmula."
    ]
  },
  "video": {
    "url": "https://www.youtube.com/watch?v=ZC8ElD7ATcE",
    "idDeYouTube": "ZC8ElD7ATcE",
    "titulo": "VALENCIA: POR QUÉ SE INTERCAMBIAN LAS VALENCIAS FORMULACIÓN INORGÁNICA PARA SECUNDARIA",
    "canal": "Matemáticas, Física y Química",
    "variedadDeEspanol": "España",
    "explicaElPorQue": true,
    "dondeSalio": "Salió con la consulta de arriba, limitada a youtube.com. El título venía en mayúsculas y nombra el por qué del intercambio, no el procedimiento.",
    "porQueEste": "Es el único resultado cuyo título dice por qué se intercambian las valencias y no nada más cómo se cruzan. Falla un criterio: el español es de España, no de México."
  },
  "alternativas": [
    {
      "url": "https://www.youtube.com/watch?v=q0xrlegNNjA",
      "idDeYouTube": "q0xrlegNNjA",
      "titulo": "Cruce de Valencias Reglas Básicas",
      "canal": "ERICK Chemistry Mariano",
      "variedadDeEspanol": "America Latina",
      "explicaElPorQue": false,
      "dondeSalio": "Salió en la misma búsqueda en youtube.com, arriba del elegido, con ese título.",
      "porQueEste": "Primer respaldo, y el acento queda más cerca. Es peor: por el título da las reglas del cruce sin decir por qué la valencia pasa al otro elemento."
    },
    {
      "url": "https://www.youtube.com/watch?v=5P8eJFSqoMQ",
      "idDeYouTube": "5P8eJFSqoMQ",
      "titulo": "Como Determinar la Valencia de un Compuesto",
      "canal": "Julio Clases",
      "variedadDeEspanol": "America Latina",
      "explicaElPorQue": false,
      "dondeSalio": "Salió en las dos consultas, la general y la limitada a youtube.com, con el mismo título.",
      "porQueEste": "Segundo respaldo. Va al revés del tema: saca la valencia de una fórmula ya escrita en vez de escribir la fórmula, así que entra sólo si los otros dos se caen."
    }
  ],
  "confianza": "media",
  "porQueEsaConfianza": "Las tres URL y los tres títulos salieron literales en los resultados, y el elegido nombra el por qué. Media y no alta por dos cosas: el canal es de España, no de México, y ningún resultado traía la duración, así que el recuadro sobre el video se queda vacío hasta que la saques de la API de datos de YouTube.",
  "noSePuede": null
}
```

Fíjate en lo que el ejemplo **no** trae: `duracion`. Ningún resultado traía el
tiempo, así que el campo se omitió en vez de rellenarlo con un número redondo.
Y `confianza` es `media`, con las dos pegas dichas por su nombre, no `alta`
porque la búsqueda salió bien.

## Antes de devolver, revísate

1. ¿La `pregunta` es una pregunta, no el título del tema, y pregunta por el por
   qué?
2. ¿Cabe en 70 caracteres y no lleva fórmulas?
3. ¿El `resumen` dice la idea y no se puede seguir como receta?
4. ¿La URL que escogiste está, carácter por carácter, en la lista de arriba?
5. ¿No inventaste ninguna otra URL, ni «corregiste» un id para que se viera bien?
6. ¿Cada `url` casa con su `idDeYouTube`, carácter por carácter?
7. ¿Cada `titulo` y cada `canal` están copiados como venían?
8. ¿Omitiste `duracion` donde el tiempo no venía escrito?
9. ¿`confianza` dice la verdad, y `porQueEsaConfianza` nombra las pegas?
10. ¿`noSePuede` viaja, aunque sea en `null`?
11. ¿Cero campos de estado? Aquí no van monedas, ni pistas, ni el número de la
    estación, ni si ya está hecha.
12. ¿Cero emoji, cero signos de admiración, cero festejo?
13. **La lista, campo por campo.** Tacha uno por uno: `pregunta`, `resumen`,
    `busqueda`, `video`, `alternativas`, `confianza`, `porQueEsaConfianza`,
    `noSePuede`. Adentro: `busqueda` lleva `criterios` y `descarta`. `video` va en
    `null` o lleva los cuatro: `idDeYouTube`, `variedadDeEspanol`,
    `explicaElPorQue` y `porQueEste`. Cada entrada de `alternativas` lleva esos
    mismos cuatro. Lo que se olvida no es lo difícil sino lo corto:
    `explicaElPorQue` es un booleano de una palabra y tira la llamada igual que el
    resumen. La `url`, el `titulo`, el `canal`, `dondeSalio`, la `consulta` y la
    `duracion` NO van en esta lista: los pone quien llama, del candidato.
