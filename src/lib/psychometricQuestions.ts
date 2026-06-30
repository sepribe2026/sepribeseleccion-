export interface SpatialOption {
  id: string;
  rotation: number;
  mirrored: boolean;
  isCorrect?: boolean;
}

export interface AbstractOption {
  id: string;
  svg: string;
  isCorrect?: boolean;
}

export interface GeneralOption {
  id: string;
  text: string;
  score?: number; // Para ética o Kudert
}

export interface PsychometricQuestion {
  id: string;
  type: 'verbal' | 'espacial' | 'logico' | 'numerico' | 'abstracto' | 'ethics' | 'kudert';
  questionText: string;
  baseSvg?: string; // Para espacial
  sequenceSvgs?: string[]; // Para abstracto
  spatialOptions?: SpatialOption[];
  abstractOptions?: AbstractOption[];
  options?: GeneralOption[];
  correctAnswer?: string; // Para verbal, logico, numerico
  dimension?: 'D' | 'I' | 'S' | 'C'; // Para Kudert
}

export const MASTER_QUESTIONS: PsychometricQuestion[] = [
  // ================= VERBAL (20 preguntas) =================
  {
    id: 'verb_1',
    type: 'verbal',
    questionText: 'Seleccione el sinónimo de la palabra escrita en mayúscula: INSUFICIENTE',
    options: [
      { id: 'A', text: 'Escaso' },
      { id: 'B', text: 'Específico' },
      { id: 'C', text: 'Desagradable' },
      { id: 'D', text: 'Débil' }
    ],
    correctAnswer: 'A'
  },
  {
    id: 'verb_2',
    type: 'verbal',
    questionText: 'Seleccione el sinónimo de la palabra escrita en mayúscula: SUBORDINADO',
    options: [
      { id: 'A', text: 'Directivo' },
      { id: 'B', text: 'Compañero' },
      { id: 'C', text: 'Empleado' },
      { id: 'D', text: 'Supervisor' }
    ],
    correctAnswer: 'C'
  },
  {
    id: 'verb_3',
    type: 'verbal',
    questionText: 'Seleccione el sinónimo de la palabra escrita en mayúscula: PREGONAR',
    options: [
      { id: 'A', text: 'Indagar' },
      { id: 'B', text: 'Caminar' },
      { id: 'C', text: 'Vocear' },
      { id: 'D', text: 'Desinformar' }
    ],
    correctAnswer: 'C'
  },
  {
    id: 'verb_4',
    type: 'verbal',
    questionText: 'Seleccione el sinónimo de la palabra escrita en mayúscula: EXPLAYAR',
    options: [
      { id: 'A', text: 'Ensanchar' },
      { id: 'B', text: 'Cargar' },
      { id: 'C', text: 'Contraer' },
      { id: 'D', text: 'Alegar' }
    ],
    correctAnswer: 'A'
  },
  {
    id: 'verb_5',
    type: 'verbal',
    questionText: 'Seleccione el sinónimo de la palabra escrita en mayúscula: OPTIMIZAR',
    options: [
      { id: 'A', text: 'Reducir' },
      { id: 'B', text: 'Mejorar' },
      { id: 'C', text: 'Dañar' },
      { id: 'D', text: 'Gastar' }
    ],
    correctAnswer: 'B'
  },
  {
    id: 'verb_6',
    type: 'verbal',
    questionText: 'Seleccione el sinónimo de la palabra escrita en mayúscula: ADVERSO',
    options: [
      { id: 'A', text: 'Favorable' },
      { id: 'B', text: 'Diverso' },
      { id: 'C', text: 'Contrario' },
      { id: 'D', text: 'Sencillo' }
    ],
    correctAnswer: 'C'
  },
  {
    id: 'verb_7',
    type: 'verbal',
    questionText: 'Seleccione el sinónimo de la palabra escrita en mayúscula: EQUIDAD',
    options: [
      { id: 'A', text: 'Desigualdad' },
      { id: 'B', text: 'Justicia' },
      { id: 'C', text: 'Semejanza' },
      { id: 'D', text: 'Riqueza' }
    ],
    correctAnswer: 'B'
  },
  {
    id: 'verb_8',
    type: 'verbal',
    questionText: 'Seleccione el sinónimo de la palabra escrita en mayúscula: EFÍMERO',
    options: [
      { id: 'A', text: 'Pasajero' },
      { id: 'B', text: 'Eterno' },
      { id: 'C', text: 'Importante' },
      { id: 'D', text: 'Débil' }
    ],
    correctAnswer: 'A'
  },
  {
    id: 'verb_9',
    type: 'verbal',
    questionText: 'Seleccione el sinónimo de la palabra escrita en mayúscula: PERSPICACIA',
    options: [
      { id: 'A', text: 'Torpeza' },
      { id: 'B', text: 'Agudeza' },
      { id: 'C', text: 'Lentitud' },
      { id: 'D', text: 'Fuerza' }
    ],
    correctAnswer: 'B'
  },
  {
    id: 'verb_10',
    type: 'verbal',
    questionText: 'Seleccione el sinónimo de la palabra escrita en mayúscula: VITAL',
    options: [
      { id: 'A', text: 'Secundario' },
      { id: 'B', text: 'Esencial' },
      { id: 'C', text: 'Mortal' },
      { id: 'D', text: 'Débil' }
    ],
    correctAnswer: 'B'
  },
  {
    id: 'verb_11',
    type: 'verbal',
    questionText: 'Seleccione el sinónimo de la palabra escrita en mayúscula: COHERENTE',
    options: [
      { id: 'A', text: 'Lógico' },
      { id: 'B', text: 'Confuso' },
      { id: 'C', text: 'Rápido' },
      { id: 'D', text: 'Distinto' }
    ],
    correctAnswer: 'A'
  },
  {
    id: 'verb_12',
    type: 'verbal',
    questionText: 'Seleccione el sinónimo de la palabra escrita en mayúscula: DISCRETO',
    options: [
      { id: 'A', text: 'Hablador' },
      { id: 'B', text: 'Prudente' },
      { id: 'C', text: 'Grande' },
      { id: 'D', text: 'Ruidoso' }
    ],
    correctAnswer: 'B'
  },
  {
    id: 'verb_13',
    type: 'verbal',
    questionText: 'Seleccione el sinónimo de la palabra escrita en mayúscula: GENUINO',
    options: [
      { id: 'A', text: 'Auténtico' },
      { id: 'B', text: 'Falso' },
      { id: 'C', text: 'Brillante' },
      { id: 'D', text: 'Extraño' }
    ],
    correctAnswer: 'A'
  },
  {
    id: 'verb_14',
    type: 'verbal',
    questionText: 'Seleccione el sinónimo de la palabra escrita en mayúscula: INHERENTE',
    options: [
      { id: 'A', text: 'Propio' },
      { id: 'B', text: 'Ajeno' },
      { id: 'C', text: 'Temporal' },
      { id: 'D', text: 'Extraño' }
    ],
    correctAnswer: 'A'
  },
  {
    id: 'verb_15',
    type: 'verbal',
    questionText: 'Seleccione el sinónimo de la palabra escrita en mayúscula: MITIGAR',
    options: [
      { id: 'A', text: 'Aumentar' },
      { id: 'B', text: 'Aliviar' },
      { id: 'C', text: 'Provocar' },
      { id: 'D', text: 'Estudiar' }
    ],
    correctAnswer: 'B'
  },
  {
    id: 'verb_16',
    type: 'verbal',
    questionText: 'Seleccione el sinónimo de la palabra escrita en mayúscula: PROSPERAR',
    options: [
      { id: 'A', text: 'Progresar' },
      { id: 'B', text: 'Fracasar' },
      { id: 'C', text: 'Disminuir' },
      { id: 'D', text: 'Buscar' }
    ],
    correctAnswer: 'A'
  },
  {
    id: 'verb_17',
    type: 'verbal',
    questionText: 'Seleccione el sinónimo de la palabra escrita en mayúscula: REACIO',
    options: [
      { id: 'A', text: 'Renuente' },
      { id: 'B', text: 'Dispuesto' },
      { id: 'C', text: 'Rápido' },
      { id: 'D', text: 'Triste' }
    ],
    correctAnswer: 'A'
  },
  {
    id: 'verb_18',
    type: 'verbal',
    questionText: 'Seleccione el sinónimo de la palabra escrita en mayúscula: SOBRESALIR',
    options: [
      { id: 'A', text: 'Destacar' },
      { id: 'B', text: 'Ocultarse' },
      { id: 'C', text: 'Caer' },
      { id: 'D', text: 'Seguir' }
    ],
    correctAnswer: 'A'
  },
  {
    id: 'verb_19',
    type: 'verbal',
    questionText: 'Seleccione el sinónimo de la palabra escrita en mayúscula: VIGILANTE',
    options: [
      { id: 'A', text: 'Atento' },
      { id: 'B', text: 'Dormido' },
      { id: 'C', text: 'Lento' },
      { id: 'D', text: 'Distraído' }
    ],
    correctAnswer: 'A'
  },
  {
    id: 'verb_20',
    type: 'verbal',
    questionText: 'Seleccione el sinónimo de la palabra escrita en mayúscula: EXIMIR',
    options: [
      { id: 'A', text: 'Liberar' },
      { id: 'B', text: 'Obligar' },
      { id: 'C', text: 'Atar' },
      { id: 'D', text: 'Castigar' }
    ],
    correctAnswer: 'A'
  },

  // ================= ESPACIAL (8 preguntas) =================
  {
    id: 'spat_1',
    type: 'espacial',
    questionText: 'Seleccione la figura que es exactamente igual a la original (rotada pero no reflejada):',
    baseSvg: '<path d="M 30,30 L 70,30 L 70,70 L 50,70 L 50,50 L 30,50 Z" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="70" cy="30" r="6" fill="#3b82f6"/>',
    spatialOptions: [
      { id: 'A', rotation: 90, mirrored: true },
      { id: 'B', rotation: 180, mirrored: false, isCorrect: true },
      { id: 'C', rotation: 270, mirrored: true },
      { id: 'D', rotation: 0, mirrored: true }
    ]
  },
  {
    id: 'spat_2',
    type: 'espacial',
    questionText: 'Seleccione la figura que es exactamente igual a la original (rotada pero no reflejada):',
    baseSvg: '<path d="M 20,50 L 80,50 L 80,80 L 60,80 Z" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="20" cy="50" r="6" fill="#10b981"/>',
    spatialOptions: [
      { id: 'A', rotation: 90, mirrored: false, isCorrect: true },
      { id: 'B', rotation: 90, mirrored: true },
      { id: 'C', rotation: 180, mirrored: true },
      { id: 'D', rotation: 270, mirrored: true }
    ]
  },
  {
    id: 'spat_3',
    type: 'espacial',
    questionText: 'Seleccione la figura que es exactamente igual a la original (rotada pero no reflejada):',
    baseSvg: '<path d="M 30,30 L 30,70 L 70,70 L 70,50 Z" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="70" r="5" fill="#f59e0b"/>',
    spatialOptions: [
      { id: 'A', rotation: 0, mirrored: true },
      { id: 'B', rotation: 180, mirrored: true },
      { id: 'C', rotation: 270, mirrored: false, isCorrect: true },
      { id: 'D', rotation: 90, mirrored: true }
    ]
  },
  {
    id: 'spat_4',
    type: 'espacial',
    questionText: 'Seleccione la figura que es exactamente igual a la original (rotada pero no reflejada):',
    baseSvg: '<path d="M 20,20 L 50,50 L 20,80 Z" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="50" r="6" fill="#ef4444"/>',
    spatialOptions: [
      { id: 'A', rotation: 90, mirrored: false, isCorrect: true },
      { id: 'B', rotation: 0, mirrored: true },
      { id: 'C', rotation: 180, mirrored: true },
      { id: 'D', rotation: 270, mirrored: true }
    ]
  },
  {
    id: 'spat_5',
    type: 'espacial',
    questionText: 'Seleccione la figura que es exactamente igual a la original (rotada pero no reflejada):',
    baseSvg: '<path d="M 30,20 L 70,20 L 70,60 L 50,40 L 30,60 Z" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="20" r="5" fill="#8b5cf6"/>',
    spatialOptions: [
      { id: 'A', rotation: 180, mirrored: false, isCorrect: true },
      { id: 'B', rotation: 180, mirrored: true },
      { id: 'C', rotation: 90, mirrored: true },
      { id: 'D', rotation: 270, mirrored: true }
    ]
  },
  {
    id: 'spat_6',
    type: 'espacial',
    questionText: 'Seleccione la figura que es exactamente igual a la original (rotada pero no reflejada):',
    baseSvg: '<path d="M 40,20 L 60,20 L 60,80 L 30,80 Z" fill="none" stroke="currentColor" stroke-width="4"/><rect x="35" y="45" width="10" height="10" fill="#f43f5e"/>',
    spatialOptions: [
      { id: 'A', rotation: 0, mirrored: true },
      { id: 'B', rotation: 90, mirrored: false, isCorrect: true },
      { id: 'C', rotation: 180, mirrored: true },
      { id: 'D', rotation: 270, mirrored: true }
    ]
  },
  {
    id: 'spat_7',
    type: 'espacial',
    questionText: 'Seleccione la figura que es exactamente igual a la original (rotada pero no reflejada):',
    baseSvg: '<path d="M 30,30 L 70,30 L 50,70 Z" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="70" r="6" fill="#06b6d4"/>',
    spatialOptions: [
      { id: 'A', rotation: 180, mirrored: true },
      { id: 'B', rotation: 270, mirrored: true },
      { id: 'C', rotation: 0, mirrored: true },
      { id: 'D', rotation: 90, mirrored: false, isCorrect: true }
    ]
  },
  {
    id: 'spat_8',
    type: 'espacial',
    questionText: 'Seleccione la figura que es exactamente igual a la original (rotada pero no reflejada):',
    baseSvg: '<path d="M 20,40 L 50,20 L 80,40 L 50,80 Z" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="20" r="5" fill="#e11d48"/>',
    spatialOptions: [
      { id: 'A', rotation: 180, mirrored: false, isCorrect: true },
      { id: 'B', rotation: 90, mirrored: true },
      { id: 'C', rotation: 270, mirrored: true },
      { id: 'D', rotation: 0, mirrored: true }
    ]
  },

  // ================= LÓGICO (10 preguntas) =================
  {
    id: 'logic_1',
    type: 'logico',
    questionText: '¿Qué número continúa la serie lógica? 2, 4, 8, 16, ?',
    options: [
      { id: 'A', text: '20' },
      { id: 'B', text: '24' },
      { id: 'C', text: '32' },
      { id: 'D', text: '64' }
    ],
    correctAnswer: 'C'
  },
  {
    id: 'logic_2',
    type: 'logico',
    questionText: '¿Qué número continúa la serie lógica? 1, 3, 6, 10, 15, ?',
    options: [
      { id: 'A', text: '18' },
      { id: 'B', text: '20' },
      { id: 'C', text: '21' },
      { id: 'D', text: '25' }
    ],
    correctAnswer: 'C'
  },
  {
    id: 'logic_3',
    type: 'logico',
    questionText: '¿Qué número continúa la serie lógica? 3, 6, 12, 15, 30, 33, ?',
    options: [
      { id: 'A', text: '66' },
      { id: 'B', text: '36' },
      { id: 'C', text: '45' },
      { id: 'D', text: '60' }
    ],
    correctAnswer: 'A'
  },
  {
    id: 'logic_4',
    type: 'logico',
    questionText: 'Complete la letra de la secuencia del abecedario: A, C, F, J, ? (Considere abecedario estándar sin CH ni LL)',
    options: [
      { id: 'A', text: 'M' },
      { id: 'B', text: 'N' },
      { id: 'C', text: 'Ñ' },
      { id: 'D', text: 'O' }
    ],
    correctAnswer: 'C'
  },
  {
    id: 'logic_5',
    type: 'logico',
    questionText: '¿Qué número continúa la serie lógica? 2, 3, 5, 8, 13, ?',
    options: [
      { id: 'A', text: '17' },
      { id: 'B', text: '18' },
      { id: 'C', text: '21' },
      { id: 'D', text: '25' }
    ],
    correctAnswer: 'C'
  },
  {
    id: 'logic_6',
    type: 'logico',
    questionText: '¿Qué número continúa la serie lógica? 80, 40, 20, 10, ?',
    options: [
      { id: 'A', text: '8' },
      { id: 'B', text: '5' },
      { id: 'C', text: '0' },
      { id: 'D', text: '2' }
    ],
    correctAnswer: 'B'
  },
  {
    id: 'logic_7',
    type: 'logico',
    questionText: '¿Qué número continúa la serie lógica? 2, 9, 4, 11, 6, 13, ?',
    options: [
      { id: 'A', text: '8' },
      { id: 'B', text: '15' },
      { id: 'C', text: '14' },
      { id: 'D', text: '10' }
    ],
    correctAnswer: 'A'
  },
  {
    id: 'logic_8',
    type: 'logico',
    questionText: 'Si AYER es posterior a MARTES y ANTEAYER fue DOMINGO, ¿qué día es HOY?',
    options: [
      { id: 'A', text: 'Martes' },
      { id: 'B', text: 'Miércoles' },
      { id: 'C', text: 'Jueves' },
      { id: 'D', text: 'Viernes' }
    ],
    correctAnswer: 'B'
  },
  {
    id: 'logic_9',
    type: 'logico',
    questionText: '¿Qué número continúa la serie lógica? 1, 4, 9, 16, 25, ?',
    options: [
      { id: 'A', text: '30' },
      { id: 'B', text: '35' },
      { id: 'C', text: '36' },
      { id: 'D', text: '49' }
    ],
    correctAnswer: 'C'
  },
  {
    id: 'logic_10',
    type: 'logico',
    questionText: '¿Qué número continúa la serie lógica? 100, 95, 85, 70, ?',
    options: [
      { id: 'A', text: '60' },
      { id: 'B', text: '55' },
      { id: 'C', text: '50' },
      { id: 'D', text: '45' }
    ],
    correctAnswer: 'C'
  },

  // ================= NUMÉRICO (10 preguntas) =================
  {
    id: 'num_1',
    type: 'numerico',
    questionText: 'Si un tren recorre 120 km en 2 horas, ¿cuántos km recorrerá en 5 horas a la misma velocidad constante?',
    options: [
      { id: 'A', text: '250' },
      { id: 'B', text: '300' },
      { id: 'C', text: '350' },
      { id: 'D', text: '400' }
    ],
    correctAnswer: 'B'
  },
  {
    id: 'num_2',
    type: 'numerico',
    questionText: 'El doble de la edad de Juan más 5 años es igual a 35. ¿Qué edad tiene Juan?',
    options: [
      { id: 'A', text: '10 años' },
      { id: 'B', text: '15 años' },
      { id: 'C', text: '20 años' },
      { id: 'D', text: '25 años' }
    ],
    correctAnswer: 'B'
  },
  {
    id: 'num_3',
    type: 'numerico',
    questionText: 'Un artículo cuesta $80 y tiene un descuento del 15%. ¿Cuánto se paga finalmente por él?',
    options: [
      { id: 'A', text: '$65' },
      { id: 'B', text: '$68' },
      { id: 'C', text: '$70' },
      { id: 'D', text: '$72' }
    ],
    correctAnswer: 'B'
  },
  {
    id: 'num_4',
    type: 'numerico',
    questionText: 'Si 3 obreros tardan 6 días en levantar una pared, ¿cuántos días tardarán 6 obreros en hacer el mismo trabajo?',
    options: [
      { id: 'A', text: '2 días' },
      { id: 'B', text: '3 días' },
      { id: 'C', text: '4 días' },
      { id: 'D', text: '5 días' }
    ],
    correctAnswer: 'B'
  },
  {
    id: 'num_5',
    type: 'numerico',
    questionText: 'En una caja hay 3 bolas rojas, 2 azules y 5 verdes. ¿Cuál es la probabilidad de sacar una bola azul al azar?',
    options: [
      { id: 'A', text: '10%' },
      { id: 'B', text: '20%' },
      { id: 'C', text: '30%' },
      { id: 'D', text: '50%' }
    ],
    correctAnswer: 'B'
  },
  {
    id: 'num_6',
    type: 'numerico',
    questionText: 'Si una camisa cuesta $25 y un pantalón $45, ¿cuánto recibirás de vuelto al pagar con un billete de $100?',
    options: [
      { id: 'A', text: '$30' },
      { id: 'B', text: '$35' },
      { id: 'C', text: '$40' },
      { id: 'D', text: '$45' }
    ],
    correctAnswer: 'A'
  },
  {
    id: 'num_7',
    type: 'numerico',
    questionText: 'Una máquina embotelladora llena 240 botellas en 15 minutos. ¿Cuántas botellas llena en 1 minuto?',
    options: [
      { id: 'A', text: '12 botellas' },
      { id: 'B', text: '16 botellas' },
      { id: 'C', text: '18 botellas' },
      { id: 'D', text: '20 botellas' }
    ],
    correctAnswer: 'B'
  },
  {
    id: 'num_8',
    type: 'numerico',
    questionText: 'Si el perímetro de un cuadrado es 36 cm, ¿cuál es el área del cuadrado?',
    options: [
      { id: 'A', text: '36 cm²' },
      { id: 'B', text: '81 cm²' },
      { id: 'C', text: '64 cm²' },
      { id: 'D', text: '144 cm²' }
    ],
    correctAnswer: 'B'
  },
  {
    id: 'num_9',
    type: 'numerico',
    questionText: 'Una persona ahorra $150 mensuales. Si decide incrementar su ahorro en un 20%, ¿cuánto ahorrará al mes?',
    options: [
      { id: 'A', text: '$170' },
      { id: 'B', text: '$180' },
      { id: 'C', text: '$190' },
      { id: 'D', text: '$200' }
    ],
    correctAnswer: 'B'
  },
  {
    id: 'num_10',
    type: 'numerico',
    questionText: 'Un automóvil consume 8 litros de combustible por cada 100 km. ¿Cuántos litros consumirá para viajar 450 km?',
    options: [
      { id: 'A', text: '32 litros' },
      { id: 'B', text: '36 litros' },
      { id: 'C', text: '40 litros' },
      { id: 'D', text: '45 litros' }
    ],
    correctAnswer: 'B'
  },

  // ================= ABSTRACTO (8 preguntas en SVG) =================
  {
    id: 'abst_1',
    type: 'abstracto',
    questionText: '¿Cuál es la figura que completa la secuencia lógica?',
    sequenceSvgs: [
      '<polygon points="50,15 90,85 10,85" fill="none" stroke="currentColor" stroke-width="4"/>', // Triangle
      '<rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" stroke-width="4"/>', // Square
      '<polygon points="50,15 85,45 70,85 30,85 15,45" fill="none" stroke="currentColor" stroke-width="4"/>' // Pentagon
    ],
    abstractOptions: [
      { id: 'A', svg: '<polygon points="50,15 85,35 85,75 50,95 15,75 15,35" fill="none" stroke="currentColor" stroke-width="4"/>', isCorrect: true }, // Hexagon
      { id: 'B', svg: '<polygon points="50,15 90,85 10,85" fill="none" stroke="currentColor" stroke-width="4"/>' },
      { id: 'C', svg: '<circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="4"/>' },
      { id: 'D', svg: '<polygon points="50,10 90,40 75,90 25,90 10,40" fill="none" stroke="currentColor" stroke-width="4"/>' }
    ]
  },
  {
    id: 'abst_2',
    type: 'abstracto',
    questionText: '¿Cuál es la figura que completa la secuencia lógica?',
    sequenceSvgs: [
      '<circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" stroke-width="4"/>', // Small circle
      '<circle cx="50" cy="50" r="22" fill="none" stroke="currentColor" stroke-width="4"/>', // Medium circle
      '<circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="4"/>'  // Large circle
    ],
    abstractOptions: [
      { id: 'A', svg: '<rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" stroke-width="4"/>' },
      { id: 'B', svg: '<circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="4"/>', isCorrect: true }, // Extra Large circle
      { id: 'C', svg: '<circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" stroke-width="4"/>' },
      { id: 'D', svg: '<polygon points="50,15 90,85 10,85" fill="none" stroke="currentColor" stroke-width="4"/>' }
    ]
  },
  {
    id: 'abst_3',
    type: 'abstracto',
    questionText: '¿Cuál es la figura que completa la secuencia lógica?',
    sequenceSvgs: [
      '<line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" stroke-width="4"/>', // Vertical line
      '<line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" stroke-width="4"/><line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" stroke-width="4"/>', // Cross
      '<line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" stroke-width="4"/><line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" stroke-width="4"/><line x1="20" y1="20" x2="80" y2="80" stroke="currentColor" stroke-width="4"/>' // Cross + 1 diag
    ],
    abstractOptions: [
      { id: 'A', svg: '<line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" stroke-width="4"/><line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" stroke-width="4"/><line x1="20" y1="20" x2="80" y2="80" stroke="currentColor" stroke-width="4"/><line x1="80" y1="20" x2="20" y2="80" stroke="currentColor" stroke-width="4"/>', isCorrect: true }, // Cross + 2 diags (Star)
      { id: 'B', svg: '<circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="4"/>' },
      { id: 'C', svg: '<rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" stroke-width="4"/>' },
      { id: 'D', svg: '<line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" stroke-width="4"/>' }
    ]
  },
  {
    id: 'abst_4',
    type: 'abstracto',
    questionText: '¿Cuál es la figura que completa la secuencia lógica (círculo rotando a favor de las manecillas del reloj)?',
    sequenceSvgs: [
      '<rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="20" r="8" fill="currentColor"/>', // Circle top
      '<rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="80" cy="50" r="8" fill="currentColor"/>', // Circle right
      '<rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="80" r="8" fill="currentColor"/>'  // Circle bottom
    ],
    abstractOptions: [
      { id: 'A', svg: '<rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="20" cy="50" r="8" fill="currentColor"/>', isCorrect: true }, // Circle left
      { id: 'B', svg: '<rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="20" r="8" fill="currentColor"/>' },
      { id: 'C', svg: '<rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="50" r="8" fill="currentColor"/>' },
      { id: 'D', svg: '<rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="80" cy="80" r="8" fill="currentColor"/>' }
    ]
  },
  {
    id: 'abst_5',
    type: 'abstracto',
    questionText: '¿Cuál es la figura que completa la secuencia lógica?',
    sequenceSvgs: [
      '<line x1="20" y1="80" x2="80" y2="80" stroke="currentColor" stroke-width="6"/>', // 1 line
      '<line x1="20" y1="80" x2="80" y2="80" stroke="currentColor" stroke-width="6"/><line x1="20" y1="60" x2="80" y2="60" stroke="currentColor" stroke-width="6"/>', // 2 lines
      '<line x1="20" y1="80" x2="80" y2="80" stroke="currentColor" stroke-width="6"/><line x1="20" y1="60" x2="80" y2="60" stroke="currentColor" stroke-width="6"/><line x1="20" y1="40" x2="80" y2="40" stroke="currentColor" stroke-width="6"/>' // 3 lines
    ],
    abstractOptions: [
      { id: 'A', svg: '<line x1="20" y1="80" x2="80" y2="80" stroke="currentColor" stroke-width="6"/><line x1="20" y1="60" x2="80" y2="60" stroke="currentColor" stroke-width="6"/><line x1="20" y1="40" x2="80" y2="40" stroke="currentColor" stroke-width="6"/><line x1="20" y1="20" x2="80" y2="20" stroke="currentColor" stroke-width="6"/>', isCorrect: true }, // 4 lines
      { id: 'B', svg: '<circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="4"/>' },
      { id: 'C', svg: '<rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" stroke-width="4"/>' },
      { id: 'D', svg: '<line x1="20" y1="80" x2="80" y2="80" stroke="currentColor" stroke-width="6"/>' }
    ]
  },
  {
    id: 'abst_6',
    type: 'abstracto',
    questionText: '¿Cuál es la figura que completa la secuencia lógica?',
    sequenceSvgs: [
      '<rect x="20" y="20" width="30" height="30" fill="none" stroke="currentColor" stroke-width="4"/>', // 1 rect
      '<rect x="20" y="20" width="30" height="30" fill="none" stroke="currentColor" stroke-width="4"/><rect x="50" y="20" width="30" height="30" fill="none" stroke="currentColor" stroke-width="4"/>', // 2 rects horizontally
      '<rect x="20" y="20" width="30" height="30" fill="none" stroke="currentColor" stroke-width="4"/><rect x="50" y="20" width="30" height="30" fill="none" stroke="currentColor" stroke-width="4"/><rect x="20" y="50" width="30" height="30" fill="none" stroke="currentColor" stroke-width="4"/>' // 3 rects forming L
    ],
    abstractOptions: [
      { id: 'A', svg: '<rect x="20" y="20" width="30" height="30" fill="none" stroke="currentColor" stroke-width="4"/><rect x="50" y="20" width="30" height="30" fill="none" stroke="currentColor" stroke-width="4"/><rect x="20" y="50" width="30" height="30" fill="none" stroke="currentColor" stroke-width="4"/><rect x="50" y="50" width="30" height="30" fill="none" stroke="currentColor" stroke-width="4"/>', isCorrect: true }, // 4 rects forming square grid
      { id: 'B', svg: '<circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="4"/>' },
      { id: 'C', svg: '<polygon points="50,15 90,85 10,85" fill="none" stroke="currentColor" stroke-width="4"/>' },
      { id: 'D', svg: '<rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" stroke-width="4"/>' }
    ]
  },
  {
    id: 'abst_7',
    type: 'abstracto',
    questionText: '¿Cuál es la figura que completa la secuencia lógica?',
    sequenceSvgs: [
      '<line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" stroke-width="4"/>', // Horizontal line
      '<line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" stroke-width="4"/><line x1="50" y1="50" x2="90" y2="10" stroke="currentColor" stroke-width="4"/>', // Line + right arm
      '<line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" stroke-width="4"/><line x1="50" y1="50" x2="90" y2="10" stroke="currentColor" stroke-width="4"/><line x1="50" y1="50" x2="10" y2="10" stroke="currentColor" stroke-width="4"/>' // Line + 2 arms (Y shape)
    ],
    abstractOptions: [
      { id: 'A', svg: '<line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" stroke-width="4"/><line x1="50" y1="50" x2="90" y2="10" stroke="currentColor" stroke-width="4"/><line x1="50" y1="50" x2="10" y2="10" stroke="currentColor" stroke-width="4"/><line x1="50" y1="50" x2="50" y2="90" stroke="currentColor" stroke-width="4"/>', isCorrect: true }, // Star / tree
      { id: 'B', svg: '<circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="4"/>' },
      { id: 'C', svg: '<rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" stroke-width="4"/>' },
      { id: 'D', svg: '<polygon points="50,15 90,85 10,85" fill="none" stroke="currentColor" stroke-width="4"/>' }
    ]
  },
  {
    id: 'abst_8',
    type: 'abstracto',
    questionText: '¿Cuál es la figura que completa la secuencia lógica?',
    sequenceSvgs: [
      '<polygon points="50,20 80,80 20,80" fill="none" stroke="currentColor" stroke-width="4"/>', // Triangle up
      '<polygon points="50,80 80,20 20,20" fill="none" stroke="currentColor" stroke-width="4"/>', // Triangle down
      '<polygon points="50,20 80,80 20,80" fill="none" stroke="currentColor" stroke-width="4"/>'  // Triangle up
    ],
    abstractOptions: [
      { id: 'A', svg: '<polygon points="50,80 80,20 20,20" fill="none" stroke="currentColor" stroke-width="4"/>', isCorrect: true }, // Triangle down
      { id: 'B', svg: '<polygon points="50,20 80,80 20,80" fill="none" stroke="currentColor" stroke-width="4"/>' },
      { id: 'C', svg: '<rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" stroke-width="4"/>' },
      { id: 'D', svg: '<circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="4"/>' }
    ]
  },

  // ================= ETICA (10 preguntas) =================
  {
    id: 'eth_1',
    type: 'ethics',
    questionText: 'Descubres que un compañero de trabajo está utilizando recursos clave de la empresa para un proyecto de beneficio puramente personal. ¿Qué curso de acción tomarías?',
    options: [
      { id: 'A', text: 'Ignorar la situación para no dañar la relación con mi compañero ni generarle problemas.', score: 0 },
      { id: 'B', text: 'Reportar de inmediato la observación mediante el canal oficial de cumplimiento o con el supervisor directo.', score: 100 },
      { id: 'C', text: 'Hablar de manera privada con el compañero para aconsejarle que detenga dicha actividad.', score: 50 },
      { id: 'D', text: 'Esperar a ver si alguien más se percata del incidente antes de actuar.', score: 20 }
    ]
  },
  {
    id: 'eth_2',
    type: 'ethics',
    questionText: 'Un cliente muy importante te ofrece un obsequio costoso en efectivo a cambio de priorizar y agilizar significativamente su solicitud interna, lo cual está prohibido por las normas. ¿Qué haces?',
    options: [
      { id: 'A', text: 'Aceptar el incentivo indicando que el trámite se procesará con los tiempos usuales.', score: 0 },
      { id: 'B', text: 'Rechazar de inmediato, explicar amablemente las políticas internas y reportar el incidente al supervisor.', score: 100 },
      { id: 'C', text: 'Aceptar el regalo solo si es una práctica común entre otros miembros del equipo.', score: 10 },
      { id: 'D', text: 'Rechazar el incentivo pero no reportar el incidente para evitar tensiones adicionales.', score: 50 }
    ]
  },
  {
    id: 'eth_3',
    type: 'ethics',
    questionText: 'Observas a tu superior directo alterar de manera sutil un informe financiero/operativo mensual para alcanzar las metas del departamento. ¿Qué haces?',
    options: [
      { id: 'A', text: 'Asumir que tu jefe tiene razones operativas válidas y no cuestionar su decisión.', score: 0 },
      { id: 'B', text: 'Reportar el hallazgo de forma confidencial a través de la línea ética corporativa o auditoría.', score: 100 },
      { id: 'C', text: 'Preguntar directamente a tu jefe la razón de los cambios antes de reportarlo.', score: 40 },
      { id: 'D', text: 'Comentarlo informalmente con tus compañeros para ver qué opinan al respecto.', score: 10 }
    ]
  },
  {
    id: 'eth_4',
    type: 'ethics',
    questionText: 'Un compañero de trabajo te pide que marques su registro de asistencia/hora de entrada ya que llegará con un retraso considerable debido a motivos personales. ¿Qué haces?',
    options: [
      { id: 'A', text: 'Ayudarlo marcando la asistencia para apoyar el compañerismo laboral.', score: 0 },
      { id: 'B', text: 'Negarme cortésmente y sugerirle que reporte el retraso formalmente a Recursos Humanos.', score: 100 },
      { id: 'C', text: 'Marcar su ingreso solo si promete reponer las horas de retraso más tarde.', score: 20 },
      { id: 'D', text: 'Reportar de inmediato a tu compañero con el supervisor antes de que él llegue.', score: 70 }
    ]
  },
  {
    id: 'eth_5',
    type: 'ethics',
    questionText: 'Durante una licitación de proveedores, te percatas de que uno de los participantes es un familiar cercano de un compañero del comité evaluador de compras. ¿Qué haces?',
    options: [
      { id: 'A', text: 'Mantener la información privada ya que confías plenamente en la integridad de tu compañero.', score: 0 },
      { id: 'B', text: 'Notificar de inmediato el potencial conflicto de interés al comité de cumplimiento/compras.', score: 100 },
      { id: 'C', text: 'Sugerirle a tu compañero de forma privada que se abstenga discretamente en las votaciones.', score: 60 },
      { id: 'D', text: 'Esperar a ver los resultados; si no gana su familiar, no reportar nada.', score: 30 }
    ]
  },
  {
    id: 'eth_6',
    type: 'ethics',
    questionText: 'Por error, recibes en tu bandeja de correo un documento altamente confidencial sobre la reestructuración del departamento del cual no deberías tener conocimiento. ¿Qué haces?',
    options: [
      { id: 'A', text: 'Leerlo completo para estar preparado y luego borrarlo.', score: 10 },
      { id: 'B', text: 'Notificar al emisor sobre el error de envío, borrar el correo de forma permanente y no divulgar su contenido.', score: 100 },
      { id: 'C', text: 'Compartirlo con un compañero de confianza para discutir las implicaciones.', score: 0 },
      { id: 'D', text: 'Guardarlo en una carpeta personal por seguridad en caso de futuros cambios.', score: 0 }
    ]
  },
  {
    id: 'eth_7',
    type: 'ethics',
    questionText: 'Te das cuenta de que el sistema de facturación tiene una falla que permite omitir ciertos cobros a clientes específicos. ¿Qué haces?',
    options: [
      { id: 'A', text: 'Reportar inmediatamente la vulnerabilidad a TI y a Finanzas para que se corrija.', score: 100 },
      { id: 'B', text: 'Aprovechar la falla para beneficiar a mis clientes favoritos y mejorar mi relación comercial.', score: 0 },
      { id: 'C', text: 'No decir nada, asumiendo que los encargados de TI lo notarán pronto.', score: 10 },
      { id: 'D', text: 'Discutir el error con otros compañeros para comprobar si también lo han usado.', score: 0 }
    ]
  },
  {
    id: 'eth_8',
    type: 'ethics',
    questionText: 'Un proveedor ofrece invitarte a unas costosas vacaciones todo pagado con el pretexto de estrechar relaciones comerciales y conocer su planta principal. ¿Qué haces?',
    options: [
      { id: 'A', text: 'Aceptar el viaje ya que ayuda a entender mejor los productos del proveedor.', score: 0 },
      { id: 'B', text: 'Rechazar la invitación y reportarla al departamento de recursos humanos/cumplimiento.', score: 100 },
      { id: 'C', text: 'Aceptar solo si el viaje se realiza durante mis días de vacaciones personales.', score: 10 },
      { id: 'D', text: 'Rechazar discretamente sin reportar para no arruinar la relación de negocios.', score: 50 }
    ]
  },
  {
    id: 'eth_9',
    type: 'ethics',
    questionText: 'Un compañero de trabajo realiza comentarios ofensivos y discriminatorios de forma recurrente hacia otro miembro del equipo cuando éste no está presente. ¿Qué haces?',
    options: [
      { id: 'A', text: 'Reírse para encajar con el grupo y no ser excluido.', score: 0 },
      { id: 'B', text: 'Intervenir, expresar desacuerdo con los comentarios ofensivos y reportar la conducta a RRHH si persiste.', score: 100 },
      { id: 'C', text: 'Ignorarlo ya que no son problemas que te involucren de forma directa.', score: 20 },
      { id: 'D', text: 'Advertirle en privado a la víctima sobre lo que dicen de ella.', score: 40 }
    ]
  },
  {
    id: 'eth_10',
    type: 'ethics',
    questionText: 'Detectas que la empresa está desechando ciertos residuos de oficina de forma contraria a las regulaciones ambientales para reducir costos. ¿Qué haces?',
    options: [
      { id: 'A', text: 'Reportar el incumplimiento al comité interno de medio ambiente/ética para que se adopte el proceso correcto.', score: 100 },
      { id: 'B', text: 'No hacer nada ya que los costos son una prioridad para la rentabilidad de la empresa.', score: 0 },
      { id: 'C', text: 'Mencionarlo en una reunión grupal de manera informal sin hacer denuncias.', score: 40 },
      { id: 'D', text: 'Filtrar la información a las autoridades externas sin reportarlo de forma interna primero.', score: 60 }
    ]
  },

  // ================= KUDERT / DISC (16 preguntas) =================
  // Dimensiones: D (Decisión), I (Influencia), S (Serenidad), C (Cumplimiento)
  // Opciones estándar: 1 a 5 (Totalmente en Desacuerdo a Totalmente de Acuerdo)
  {
    id: 'kud_1',
    type: 'kudert',
    dimension: 'D',
    questionText: 'Me considero una persona competitiva y orientada principalmente a alcanzar metas ambiciosas.',
    options: [] // Las opciones se renderizan en el frontend
  },
  {
    id: 'kud_2',
    type: 'kudert',
    dimension: 'I',
    questionText: 'Disfruto interactuar con las personas, convencerlas de mis ideas y mantener reuniones animadas.',
    options: []
  },
  {
    id: 'kud_3',
    type: 'kudert',
    dimension: 'S',
    questionText: 'Prefiero entornos de trabajo tranquilos y estables antes que situaciones de cambio constante e imprevisto.',
    options: []
  },
  {
    id: 'kud_4',
    type: 'kudert',
    dimension: 'C',
    questionText: 'Presto extrema atención a los detalles y me aseguro de que mis tareas cumplan con las reglas establecidas.',
    options: []
  },
  {
    id: 'kud_5',
    type: 'kudert',
    dimension: 'D',
    questionText: 'Tiendo a tomar decisiones rápidas y firmes, incluso en momentos de alta presión o incertidumbre.',
    options: []
  },
  {
    id: 'kud_6',
    type: 'kudert',
    dimension: 'I',
    questionText: 'Me considero una persona entusiasta, expresiva y con gran capacidad para motivar a mis compañeros.',
    options: []
  },
  {
    id: 'kud_7',
    type: 'kudert',
    dimension: 'S',
    questionText: 'Me considero un buen oyente y busco la cooperación y armonía constante dentro de mi grupo de trabajo.',
    options: []
  },
  {
    id: 'kud_8',
    type: 'kudert',
    dimension: 'C',
    questionText: 'Me gusta analizar a fondo los datos antes de emitir conclusiones o tomar decisiones importantes.',
    options: []
  },
  {
    id: 'kud_9',
    type: 'kudert',
    dimension: 'D',
    questionText: 'Acepto con agrado los retos difíciles y asumo el rol de líder de forma natural ante cualquier situación.',
    options: []
  },
  {
    id: 'kud_10',
    type: 'kudert',
    dimension: 'I',
    questionText: 'Tengo facilidad para entablar relaciones de confianza rápidamente con personas que acabo de conocer.',
    options: []
  },
  {
    id: 'kud_11',
    type: 'kudert',
    dimension: 'S',
    questionText: 'Me caracterizo por ser paciente, leal y tolerante ante las fallas o tiempos de mis compañeros.',
    options: []
  },
  {
    id: 'kud_12',
    type: 'kudert',
    dimension: 'C',
    questionText: 'Me frustra la falta de precisión, el desorden o el incumplimiento de las normas de calidad del trabajo.',
    options: []
  },
  {
    id: 'kud_13',
    type: 'kudert',
    dimension: 'D',
    questionText: 'Prefiero ir directo al punto y debatir de manera asertiva antes que andar con rodeos en conversaciones laborales.',
    options: []
  },
  {
    id: 'kud_14',
    type: 'kudert',
    dimension: 'I',
    questionText: 'Suelo guiarme por mi intuición e inspirar a los demás a través del optimismo antes que con argumentos técnicos.',
    options: []
  },
  {
    id: 'kud_15',
    type: 'kudert',
    dimension: 'S',
    questionText: 'Me siento cómodo realizando tareas sistemáticas y recurrentes que otros podrían considerar monótonas.',
    options: []
  },
  {
    id: 'kud_16',
    type: 'kudert',
    dimension: 'C',
    questionText: 'Considero que el método y la planificación estricta son las claves fundamentales para prevenir fallos en proyectos.',
    options: []
  }
];
