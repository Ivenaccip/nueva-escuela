# Paso 0 · el canon del tema

**Cuándo se llama:** una vez por tema, antes que cualquier estación.
**Sistema:** `contenido/prompts/00-sistema.md`
**Esquema:** `contenido/esquema/00-canon.schema.json`
**Entra:** un tema del temario (`contenido/temarios/<materia>.json`).
**Sale:** el canon, que se le pasa entero a las seis estaciones.

Sin este paso, cada estación inventa sus propios cinco pasos y la estación 5
acaba corrompiendo un paso que la estación 3 nunca enseñó.

---

## Mensaje del usuario

Vas a fijar el canon de un tema. El canon es el acuerdo: los cinco pasos, el
ejemplo y las palabras que las seis estaciones de este tema van a compartir.
Después de ti, seis llamadas distintas escriben los ejercicios sin poder
hablarse entre ellas. Lo único que tienen en común es lo que tú escribas aquí.

## El tema

- Materia: {{materia}}
- Número: {{tema.numero}}
- Título: {{tema.titulo}}
- Familia: {{tema.familia}}
- Grado: {{tema.grado}}
- Al terminar, el estudiante dice: {{tema.quedaSabiendo}}
- Depende de los temas: {{tema.dependeDe}}
- Error típico: {{tema.errorTipico}}
- Los cinco pasos, en borrador: {{tema.losCincoPasos}}
- Notación que pide el tema: {{tema.notacion}}

`losCincoPasos` viene como una frase, no como cinco pasos. Tu trabajo es
abrirla en cinco pasos de verdad. `errorTipico` viene como una descripción; tu
trabajo es clavarlo en uno de esos cinco pasos.

## Cómo se escriben los renglones

Todo lo que se ve en pantalla como matemáticas se escribe con cuatro átomos, y
no hay más:

| Átomo | Se ve así | Para qué |
|---|---|---|
| `{"tipo":"texto","valor":"÷"}` | ÷ | palabras, signos, flechas (`→`), comparaciones |
| `{"tipo":"fraccion","arriba":3,"abajo":5}` | tres quintos apilados | cualquier fracción, y las razones con palabras adentro |
| `{"tipo":"simbolo","valor":"H","sub":"2"}` | H con 2 al pie | subíndice, superíndice, carga, unidad, variable con letra |
| `{"tipo":"hueco"}` | recuadro punteado | lo que el estudiante llena |

Cada átomo se escribe **completo**, con su `tipo` y su `valor`. No hay forma
abreviada: `{"texto":"360 ="}` no es un átomo, es un objeto sin `tipo` que la
pantalla dibuja como un recuadro vacío (`src/componentes/Expresion.tsx:104`).
Siempre `{"tipo":"texto","valor":"360 ="}`.

Ejemplos de las cuatro materias, para que veas el alcance:

- **Mate**, 360 = 2³ × 3² × 5 →
  ```json
  [{"tipo":"texto","valor":"360 ="},
   {"tipo":"simbolo","valor":"2","sup":"3"},
   {"tipo":"texto","valor":"×"},
   {"tipo":"simbolo","valor":"3","sup":"2"},
   {"tipo":"texto","valor":"× 5"}]
  ```
- **Química**, H₂SO₄ → un átomo por símbolo que lleve subíndice; lo que no
  lleva subíndice va pegado en `texto`:
  ```json
  [{"tipo":"simbolo","valor":"H","sub":"2"},
   {"tipo":"texto","valor":"S"},
   {"tipo":"simbolo","valor":"O","sub":"4"}]
  ```
- **Química**, 2H₂ + O₂ → 2H₂O:
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
- **Química**, el ion calcio Ca²⁺ → `[{"tipo":"simbolo","valor":"Ca","sup":"2+"}]`
- **Física**, 10 m/s² → la unidad se parte para que el 2 quede sobre la s:
  `[{"tipo":"texto","valor":"10 m/"},{"tipo":"simbolo","valor":"s","sup":"2"}]`
- **Física**, la velocidad final v_f = 18 m/s →
  `[{"tipo":"simbolo","valor":"v","sub":"f"},{"tipo":"texto","valor":"= 18 m/s"}]`
- **Física**, la aceleración como una resta sobre el tiempo: dentro de una
  fracción no caben átomos, así que lo de arriba se escribe con palabras →
  ```json
  [{"tipo":"texto","valor":"a ="},
   {"tipo":"fraccion","arriba":"velocidad final − inicial","abajo":"tiempo"}]
  ```
- **Bio**, casi todo es texto:
  `[{"tipo":"texto","valor":"¿Se reproduce? Sí. ¿Tiene células? No."}]`

`fraccion.arriba` y `fraccion.abajo` aguantan 40 caracteres cada uno: «velocidad
final − inicial» y «masa de la disolución» caben con holgura. Un párrafo no.

La regla de oro: **`fraccion.arriba` y `fraccion.abajo` son una sola cadena**.
No caben átomos dentro de una fracción. Si lo de arriba necesita un subíndice o
un superíndice, escríbelo con palabras («masa del soluto») o saca la expresión
de la fracción.

El signo menos es `−` (U+2212), no un guion. El de multiplicar es `×`. La
flecha de una reacción es `→` y va en `texto`.

## Qué tienes que producir

### 1. `procedimiento`

Cinco pasos. Ni cuatro ni seis: la app dibuja cinco y el resto del contenido
cuelga de esa numeración.

Cada paso lleva tres cosas:

- `queSeHace`: la acción, en segunda persona, una frase.
- `renglon`: cómo queda escrito **ese paso sobre el ejemplo canónico**, con
  átomos. Si el paso es una decisión y no una cuenta (por ejemplo «decides si
  el problema pide repartir o pide cuántas veces cabe»), un solo átomo de
  `texto` con la frase corta.
- `porQue`: por qué se hace. No repitas `queSeHace` con otras palabras. Si no
  encuentras un por qué, el paso probablemente son dos pasos mezclados o un
  paso de adorno.

Los cinco pasos, juntos, tienen que llevar del planteamiento al resultado del
ejemplo. Si se saltan un pedazo, faltó un paso.

### 2. `ejemplo`

Un solo ejemplo, el mismo que recorren los cinco pasos. Números chicos,
resultado limpio. Es el ejemplo que el estudiante va a ver tres veces (en la
3, en la 4 y en la 5), así que tiene que aguantar mirarse.

Que los números salgan del programa de su grado: nada de 4/17 en 6º de
primaria.

### 3. `error`

Toma `errorTipico` del temario y **ubícalo**:

- `pasoQueCorrompe`: en cuál de tus cinco pasos se cae. Tiene que ser un paso
  que tu procedimiento ya enseñó. Si el error vive en un paso que no está en
  tu lista, tu lista está mal: arréglala.
- `renglonMalo`: ese mismo paso, escrito como lo escribe quien se equivoca,
  sobre el mismo ejemplo. Esto es lo que la estación 5 va a mostrar, así que
  tiene que verse verosímil: un error que nadie cometería no se caza.

  **`renglonMalo` se escribe con la misma cuenta que el renglón bueno de ese
  paso, y con un número parecido de átomos.** Si el error es omitir una
  operación, escribe la operación con el número que el estudiante supone —un 0,
  el mismo número repetido, el dato que sí vio— en vez de borrarla. Un renglón al
  que le falta la cuenta se ve raro entre los otros cuatro, y entonces la
  estación 5 se contesta sin entender: se toca el renglón que no se parece a los
  demás. Tapa los números de los cinco renglones: si el malo sigue
  distinguiéndose, rehazlo.

- `creenciaDeAtras`: qué cree el estudiante que lo lleva ahí. Lo necesita la
  estación 5 para escribir los motivos equivocados.
- `comoSeCacha`: la señal que delata el error sin rehacer la cuenta.

### 3b. `erroresSecundarios`

`errorTipico` del temario muchas veces describe **dos** confusiones, no una. 58
de los 165 temas están así: «busca denominador común antes de multiplicar;
también espera que el resultado sea mayor que los dos factores» son dos cosas
distintas, y la segunda no vive en un paso, vive en lo que el estudiante espera
del resultado.

`error` es uno solo, así que:

- En `error` cobras **la confusión que se cae en un paso**, con su
  `pasoQueCorrompe`.
- Las demás van en `erroresSecundarios`, cada una con `enUnaFrase` y
  `creenciaDeAtras`. No llevan `pasoQueCorrompe` porque varias no viven en un
  paso.
- **Ninguna se tira.** La estación 2 convierte cada entrada en un distractor y
  la 6 en un contraargumento. Si la dejas fuera, el tema acaba enseñando el
  procedimiento y dejando intacta la creencia que hace que el estudiante no crea
  su propio resultado.
- Si `errorTipico` describe una sola confusión, `erroresSecundarios` es `[]`.

### 4. `vocabulario`

De tres a ocho palabras. Las que el tema necesita y nada más. Cada una con qué
es, en una frase. `noEsLoMismoQue` sólo cuando de verdad se confunde con algo.

Las seis estaciones van a usar exactamente estas palabras. Si dejas fuera una
palabra que los ejercicios necesitan, cada estación va a inventar la suya.

### 5. `cotas`

Los límites: qué números puede usar el tema, qué unidades, y qué símbolos ya
escritos con átomos. Esto evita que la estación 4 se vaya a números de cuatro
cifras cuando la 3 usó números de una.

### 6. `notacion` y `formaDeRespuesta`

Aquí decides a qué prompt se manda el tema. Lee `{{tema.notacion}}` y elige:

- `notacion: "lineal"` — todo cabe en renglones. Es el caso normal.
- `notacion: "tabla"` — el tema necesita una tabla de dos o tres columnas
  (comparar metales y no metales, grupo contra carga, qué pasa el filtro y qué
  se queda).
- `notacion: "figura"` — el tema necesita un dibujo: gráfica, plano cartesiano,
  recta numérica, diagrama de Lewis, esquema de fuerzas con flechas, probeta,
  escala de pH, círculos concéntricos.

Y `formaDeRespuesta`, que es qué teclea el estudiante en las estaciones 3 y 4:

- `numero` — un entero. Se puede teclear.
- `fraccion` — algo como `12/5`. Se puede teclear.
- `palabra` — una palabra o un nombre. **No se puede teclear** con el teclado
  de hoy.
- `trazo` — un dibujo, un punto en un plano, una flecha. **No se puede
  teclear**.

### 7. `noSePuede`

`null` si el tema se puede recorrer completo.

Llénalo cuando:

- `formaDeRespuesta` es `palabra` o `trazo`, o
- el resultado del ejemplo necesita un punto decimal o un signo negativo (el
  teclado no los tiene), o
- alguno de los cinco pasos no se puede escribir con los cuatro átomos.

Antes de llenarlo, intenta una vez reformular: si el resultado es `0.8`, tal
vez el tema puede pedir `8/10`; si la respuesta es «se hunde», tal vez puede
pedir el número que se compara. Si la reformulación cambia lo que el tema
enseña, entonces sí llena `noSePuede` y di qué hace falta.

## Un ejemplo completo

Matemáticas, tema 9, «División de fracciones», 1º de secundaria. Su
`errorTipico` en el temario trae dos confusiones —multiplicar arriba y sumar
abajo, y voltear la primera en vez de la segunda—, así que una va en `error` y la
otra en `erroresSecundarios`.

Este canon es el de referencia del repo: vive en
`contenido/esquema/canon-ejemplo.json`, valida contra `00-canon.schema.json` y el
llamador lo pega abajo. **No lo copies**: el tema que te toca es otro. Cópiale la
forma.

```json
{{ejemploCanon}}
```

Cuatro cosas de ese ejemplo:

1. Todos los átomos van con `tipo` y `valor`. Ni uno abreviado.
2. `renglonMalo` tiene la misma forma que el renglón bueno del paso 4: las dos
   operaciones escritas, un número parecido de caracteres. Lo único que cambia es
   que abajo suma en vez de multiplicar. Tapa los números y no se distingue de
   los otros cuatro pasos.
3. `comoSeCacha` no rehace la cuenta: señala que en el mismo renglón hay dos
   operaciones distintas.
4. `erroresSecundarios` tiene una entrada, la confusión que no cabía en `error`.

## Antes de devolver, revísate

1. ¿Son exactamente cinco pasos, numerados del 1 al 5?
2. ¿Los cinco pasos, seguidos, llegan del planteamiento al resultado?
3. ¿`pasoQueCorrompe` apunta a un paso que sí existe en tu lista?
4. ¿`renglonMalo` está escrito sobre el mismo ejemplo que los pasos buenos?
5. ¿`renglonMalo` tiene la misma cuenta y un número de átomos parecido al del
   renglón bueno de ese paso? Si tapas los números, ¿se distingue de los otros
   cuatro? Si sí, rehazlo.
6. ¿`errorTipico` describía dos confusiones? ¿La segunda quedó en
   `erroresSecundarios` en vez de tirarse?
7. ¿Cada átomo lleva su `tipo` y su `valor` completos, sin abreviar?
8. ¿Ninguna `fraccion` tiene átomos adentro?
9. ¿Ningún `simbolo` va sin `sub` ni `sup` (eso es `texto`)?
10. ¿Ningún renglón del canon lleva `hueco`? El canon no tiene huecos: los
    huecos los pone cada estación, y el esquema los rechaza aquí.
11. ¿Cero emoji, cero signos de admiración, cero «es fácil»?
