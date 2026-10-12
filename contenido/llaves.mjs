// De dónde sale la llave de Anthropic.
//
// Vale `ANDAMIO_ANTHROPIC_API_KEY` y, si no está, `ANTHROPIC_API_KEY`. La primera
// existe porque la segunda es también la variable con la que Claude Code se
// autentica a sí mismo: ponerla en el entorno de una sesión en la nube puede hacer
// que la propia sesión la use —y se cobre de ese presupuesto— o que la plataforma
// no la pase al shell. Un nombre propio evita las dos cosas. Fuera de la nube, con
// un `.env` en el repo, cualquiera de las dos sirve.

export const VARIABLES_DE_ANTHROPIC = ['ANDAMIO_ANTHROPIC_API_KEY', 'ANTHROPIC_API_KEY'];

/** La llave, o `undefined` si no está en ninguna de las dos. Nunca se imprime. */
export const llaveDeAnthropic = () =>
  VARIABLES_DE_ANTHROPIC.map((nombre) => process.env[nombre]).find(Boolean);
