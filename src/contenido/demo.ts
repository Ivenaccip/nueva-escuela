import type { Perfil, Tema } from './tipos';

/**
 * El ejemplo del diseño: división de fracciones. Es contenido de relleno para
 * poder ver la interfaz completa; se reemplaza entero cuando lleguen los
 * ejercicios de verdad, sin tocar las pantallas.
 */

export const perfil: Perfil = {
  racha: 12,
  monedas: 340,
  materias: ['Matemáticas', 'Física', 'Química', 'Bio'],
  materiaActiva: 'Matemáticas',
};

export const tema: Tema = {
  materia: 'Matemáticas',
  indice: 14,
  total: 32,
  familia: 'fracciones',
  titulo: 'División de fracciones',

  estaciones: [
    { numero: 1, clave: 'ver', nombre: 'Ver el video', estado: 'hecha' },
    { numero: 2, clave: 'contacto', nombre: 'Primer contacto', estado: 'hecha' },
    { numero: 3, clave: 'completar', nombre: 'Completar', estado: 'hecha' },
    { numero: 4, clave: 'escalera', nombre: 'Escalera', estado: 'actual' },
    { numero: 5, clave: 'error', nombre: 'Cazar el error', estado: 'cerrada' },
    { numero: 6, clave: 'explicar', nombre: 'Explicarlo', estado: 'cerrada' },
  ],

  ver: {
    pregunta: '¿Por qué se voltea la segunda?',
    duracion: '4:12',
    resumen:
      'Dividir entre una fracción es preguntar cuántas veces cabe. Eso es todo lo que hay detrás del truco.',
  },

  contacto: {
    indice: 2,
    total: 4,
    enunciado: [
      { tipo: 'texto', valor: '¿Cuál de estas es lo mismo que' },
      { tipo: 'fraccion', arriba: 3, abajo: 5 },
      { tipo: 'texto', valor: '÷' },
      { tipo: 'fraccion', arriba: 1, abajo: 4 },
      { tipo: 'texto', valor: '?' },
    ],
    opciones: [
      {
        letra: 'A',
        partes: [
          { tipo: 'fraccion', arriba: 3, abajo: 5 },
          { tipo: 'texto', valor: '×' },
          { tipo: 'fraccion', arriba: 4, abajo: 1 },
        ],
      },
      {
        letra: 'B',
        partes: [
          { tipo: 'fraccion', arriba: 3, abajo: 5 },
          { tipo: 'texto', valor: '×' },
          { tipo: 'fraccion', arriba: 1, abajo: 4 },
        ],
      },
      {
        letra: 'C',
        partes: [
          { tipo: 'fraccion', arriba: 5, abajo: 3 },
          { tipo: 'texto', valor: '×' },
          { tipo: 'fraccion', arriba: 1, abajo: 4 },
        ],
      },
      {
        letra: 'D',
        partes: [
          { tipo: 'fraccion', arriba: 3, abajo: 5 },
          { tipo: 'texto', valor: '÷' },
          { tipo: 'fraccion', arriba: 4, abajo: 1 },
        ],
      },
    ],
  },

  completar: {
    pistas: 5,
    pistaEn: '0:18',
    expresion: [
      { tipo: 'fraccion', arriba: 3, abajo: 5 },
      { tipo: 'texto', valor: '÷' },
      { tipo: 'fraccion', arriba: 1, abajo: 4 },
      { tipo: 'texto', valor: '=' },
      { tipo: 'fraccion', arriba: 3, abajo: 5 },
      { tipo: 'texto', valor: '×' },
      { tipo: 'hueco', valor: '4/', ancho: 106, alto: 58 },
    ],
  },

  escalera: {
    escalon: 4,
    escalones: 5,
    pistas: 5,
    situacion: 'El maestro borró el divisor sin querer al limpiar el pizarrón.',
    expresion: [
      { tipo: 'fraccion', arriba: 3, abajo: 5 },
      { tipo: 'texto', valor: '÷' },
      { tipo: 'hueco', ancho: 78, alto: 58 },
      { tipo: 'texto', valor: '=' },
      { tipo: 'fraccion', arriba: 12, abajo: 5 },
    ],
    pregunta: '¿Qué fracción iba en el hueco?',
    respuestaInicial: '1/4',
  },

  error: {
    pistas: 4,
    pasoMalo: 4,
    enunciado: [
      { tipo: 'texto', valor: 'Alguien resolvió' },
      { tipo: 'fraccion', arriba: 2, abajo: 3 },
      { tipo: 'texto', valor: '÷' },
      { tipo: 'fraccion', arriba: 4, abajo: 5 },
      { tipo: 'texto', valor: '. Hay exactamente un paso mal. Tócalo.' },
    ],
    pasos: [
      {
        numero: 1,
        partes: [
          { tipo: 'texto', valor: 'Volteo la segunda:' },
          { tipo: 'fraccion', arriba: 5, abajo: 4 },
        ],
      },
      {
        numero: 2,
        partes: [
          { tipo: 'texto', valor: 'Ahora multiplico:' },
          { tipo: 'fraccion', arriba: 2, abajo: 3 },
          { tipo: 'texto', valor: '×' },
          { tipo: 'fraccion', arriba: 5, abajo: 4 },
        ],
      },
      { numero: 3, partes: [{ tipo: 'texto', valor: 'Arriba: 2 × 5 = 10' }] },
      { numero: 4, partes: [{ tipo: 'texto', valor: 'Abajo: 3 + 4 = 7' }] },
      {
        numero: 5,
        partes: [
          { tipo: 'texto', valor: 'Queda:' },
          { tipo: 'fraccion', arriba: 10, abajo: 7 },
        ],
      },
    ],
    porQue: 'Sí, ahí. ¿Y qué hizo mal?',
    motivos: ['Sumó en vez de multiplicar', 'Volteó la fracción equivocada'],
  },

  explicar: {
    titulo: 'Explícamelo como si yo no supiera.',
    aclaracion:
      'Con tus palabras. Aquí no hay nada que copiar, y no hay pistas: esto es justo lo que quiero ver.',
    nota: 'Si no estás de acuerdo con lo que te conteste, puedes discutírselo.',
    borrador:
      'Dividir entre una fracción es preguntar cuántas veces cabe. Como 1/4 es chiquito, cabe muchas veces, por eso el resultado sale más grande que con lo que empezaste. Voltearla es un atajo para',
  },

  cierre: {
    monedas: 40,
    frase:
      'Ya puedo dividir una fracción entre otra fracción, y explicar por qué el resultado sale más grande.',
    guardian:
      'Este tema se guarda. Algún domingo lo voy a sacar otra vez, un poco más difícil, cuando ya no te lo esperes.',
  },
};
