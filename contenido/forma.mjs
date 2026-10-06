// ¿El canon dice «numero» pero el ejemplo resuelto no tiene ni una cifra?
//
// El canon se declara a sí mismo `numero` o `fraccion`, y de eso depende todo: esas
// formas son las únicas que corren en las estaciones 3 y 4, porque el teclado sólo
// tiene dígitos y la diagonal. El sondeo de Biología mostró que la declaración no
// basta: «Fotosíntesis», «Por qué entra el aire al pulmón» y «ADN, gen y cromosoma»
// salieron `lineal/numero` con un resultado que es una frase («La presión dentro
// baja…»). Pagar las cinco estaciones de un tema así es pagar escalones que piden
// una respuesta que nadie puede teclear.
//
// La prueba es burda a propósito: busca un dígito en el resultado. Si no hay
// ninguno, el tema no es numérico, diga lo que diga el canon. Un tema que sí tiene
// cifra puede seguir mal (el 2 de Biología tiene cifras y un paso que no cuadra con
// ellas); eso no lo caza esta prueba, lo caza la revisión del contenido.

export function resultadoSinCifra(canon) {
  const forma = canon?.formaDeRespuesta;
  if (forma !== 'numero' && forma !== 'fraccion') return false;
  return !/\d/.test(JSON.stringify(canon.ejemplo?.resultado ?? ''));
}
