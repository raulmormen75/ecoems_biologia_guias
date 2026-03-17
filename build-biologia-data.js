const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUTPUT_FILE = path.join(ROOT, 'biologia-data.js');

const SECTION_DEFS = [
  {
    id: 'seres_vivos',
    name: 'Seres vivos',
    shortName: 'Seres vivos',
    description: 'Características generales y reconocimiento de funciones básicas de los seres vivos.',
    tip: 'Ubica la característica biológica exacta que describe el enunciado antes de elegir.'
  },
  {
    id: 'evolucion',
    name: 'Evolución',
    shortName: 'Evolución',
    description: 'Selección natural y cambios en las poblaciones según el enfoque ECOEMS.',
    tip: 'Distingue entre mecanismo, resultado e ideas que no corresponden a Darwin.'
  },
  {
    id: 'biodiversidad_sustentabilidad',
    name: 'Biodiversidad y sustentabilidad',
    shortName: 'Biodiversidad',
    description: 'Pérdida de biodiversidad, amenazas directas y decisiones de desarrollo sustentable.',
    tip: 'Relaciona la acción descrita con su impacto real sobre especies, recursos y conservación.'
  },
  {
    id: 'ciencia_y_conocimiento',
    name: 'Ciencia y conocimiento',
    shortName: 'Ciencia',
    description: 'Conocimiento empírico, conocimiento científico y su relación con la vida cotidiana.',
    tip: 'Observa si el reactivo habla de experiencia cotidiana, método científico o tecnología aplicada.'
  },
  {
    id: 'fotosintesis_y_nutricion',
    name: 'Fotosíntesis y nutrición',
    shortName: 'Fotosíntesis',
    description: 'Autótrofos, heterótrofos, fotosíntesis y producción de alimento en los seres vivos.',
    tip: 'Separa con cuidado quién produce su alimento, quién lo obtiene de otros y qué produce la fotosíntesis.'
  },
  {
    id: 'alimentos_y_biomoleculas',
    name: 'Alimentos y biomoléculas',
    shortName: 'Biomoléculas',
    description: 'Almidón, glúcidos y reconocimiento de sustancias orgánicas en contextos comunes.',
    tip: 'Identifica qué compuesto o alimento corresponde al grupo biológico que pregunta el reactivo.'
  },
  {
    id: 'salud_y_prevencion',
    name: 'Salud y prevención',
    shortName: 'Prevención',
    description: 'Prevención respiratoria y clasificación escolar de parásitos internos y externos.',
    tip: 'Primero decide qué criterio usa la pregunta: prevención, ubicación del organismo o tipo de riesgo.'
  },
  {
    id: 'reproduccion',
    name: 'Reproducción',
    shortName: 'Reproducción',
    description: 'Reproducción sexual y asexual, además de desarrollo sexual humano.',
    tip: 'Compara la función biológica principal del proceso o estructura antes de responder.'
  },
  {
    id: 'anticonceptivos',
    name: 'Anticonceptivos',
    shortName: 'Anticonceptivos',
    description: 'Comparación general de eficacia y reconocimiento de métodos anticonceptivos.',
    tip: 'Diferencia entre métodos naturales, de barrera, hormonales y quirúrgicos.'
  },
  {
    id: 'genetica_y_biotecnologia',
    name: 'Genética y biotecnología',
    shortName: 'Genética',
    description: 'Transgénicos, manipulación genética, Mendel y estructura básica de los ácidos nucleicos.',
    tip: 'Detecta si el reactivo pide un concepto de biotecnología, dominancia mendeliana o estructura del ADN.'
  }
];

const SECTION_INDEX = Object.fromEntries(SECTION_DEFS.map((section) => [section.id, section]));

const EXERCISE_SECTION = {
  g1: {
    17: 'seres_vivos',
    18: 'evolucion',
    19: 'biodiversidad_sustentabilidad',
    20: 'biodiversidad_sustentabilidad',
    21: 'genetica_y_biotecnologia',
    22: 'fotosintesis_y_nutricion',
    23: 'fotosintesis_y_nutricion',
    24: 'alimentos_y_biomoleculas',
    25: 'salud_y_prevencion',
    26: 'reproduccion',
    27: 'anticonceptivos',
    28: 'genetica_y_biotecnologia'
  },
  g2: {
    17: 'seres_vivos',
    18: 'evolucion',
    19: 'ciencia_y_conocimiento',
    20: 'ciencia_y_conocimiento',
    21: 'fotosintesis_y_nutricion',
    22: 'fotosintesis_y_nutricion',
    23: 'alimentos_y_biomoleculas',
    24: 'salud_y_prevencion',
    25: 'reproduccion',
    26: 'anticonceptivos',
    27: 'genetica_y_biotecnologia',
    28: 'genetica_y_biotecnologia'
  }
};

const GUIDE_FILES = [
  { id: 'g1', name: 'Guía 1', filePattern: /guía\s*1/i },
  { id: 'g2', name: 'Guía 2', filePattern: /guía\s*2/i }
];

function findGuideFile(pattern) {
  const entry = fs.readdirSync(ROOT).find((name) => pattern.test(name) && name.toLowerCase().endsWith('.txt'));
  if (!entry) {
    throw new Error(`No se encontró el archivo de texto para el patrón ${pattern}`);
  }
  return path.join(ROOT, entry);
}

function toMexicoTimestamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(date);
  const values = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}`;
}

function trimBlankLines(lines) {
  let start = 0;
  let end = lines.length;
  while (start < end && !String(lines[start] || '').trim()) start += 1;
  while (end > start && !String(lines[end - 1] || '').trim()) end -= 1;
  return lines.slice(start, end);
}

function cleanInline(text) {
  return String(text || '')
    .replace(/\r/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '[[b]]$1[[/b]]')
    .replace(/__([^_]+)__/g, '[[u]]$1[[/u]]')
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '[[em]]$1[[/em]]')
    .trim();
}

function joinLines(lines) {
  const cleaned = trimBlankLines(lines).map((line) => String(line || '').trimEnd());
  return cleanInline(cleaned.join('\n').replace(/\n{3,}/g, '\n\n'));
}

function normalizeForKey(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function extractSection(lines, startLabel, endLabels) {
  const startIndex = lines.findIndex((line) => line.trim() === startLabel);
  if (startIndex === -1) return [];
  let endIndex = lines.length;
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    if (endLabels.includes(lines[i].trim())) {
      endIndex = i;
      break;
    }
  }
  return lines.slice(startIndex + 1, endIndex);
}

function splitBlocks(rawText) {
  const lines = rawText.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let current = [];

  for (const line of lines) {
    if (line.trim() === '---') {
      if (current.some((entry) => entry.trim())) {
        blocks.push(current);
      }
      current = [];
      continue;
    }
    current.push(line);
  }

  if (current.some((entry) => entry.trim())) {
    blocks.push(current);
  }

  return blocks.filter((block) => block.some((line) => line.includes('Reactivo:')));
}

function parseOptions(lines) {
  const options = [];
  let current = null;

  for (const rawLine of trimBlankLines(lines)) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = line.match(/^([A-E])\)\s*(.*)$/);
    if (match) {
      if (current) options.push(current);
      current = { letter: match[1], text: cleanInline(match[2]) };
      continue;
    }
    if (current) {
      current.text = cleanInline(`${current.text} ${line}`.trim());
    }
  }

  if (current) options.push(current);
  return options;
}

function parseDiscards(lines, optionMap, correctLetter) {
  const items = [];
  let current = null;

  for (const rawLine of trimBlankLines(lines)) {
    const line = rawLine.trim();
    if (!line) {
      if (current && current.lines[current.lines.length - 1] !== '') {
        current.lines.push('');
      }
      continue;
    }

    const match = line.match(/^([A-E])\)\s*(.*)$/);
    if (match) {
      if (current) items.push(current);
      const optionText = optionMap.get(match[1]) || cleanInline(match[2]);
      current = {
        letter: match[1],
        option: optionText,
        tone: match[1] === correctLetter ? 'correcta' : 'descarte',
        lines: []
      };
      continue;
    }

    if (current) current.lines.push(line);
  }

  if (current) items.push(current);

  return items.map((item) => ({
    letter: item.letter,
    option: item.option,
    tone: item.tone,
    reason: joinLines(item.lines)
  }));
}

function exerciseSupports(exerciseKey, statement) {
  if (exerciseKey === 'g2-24') {
    const lines = statement.split('\n').map((line) => line.trim()).filter(Boolean);
    const listLines = lines.filter((line) => /^[IVX]+\./.test(line));
    const promptLines = lines.filter((line) => !/^[IVX]+\./.test(line));
    return {
      statement: joinLines(promptLines),
      supports: [
        {
          tipo: 'fragmento',
          etiqueta: 'Elementos a clasificar',
          titulo: 'Listado del reactivo',
          contenido: listLines.map((line) => `• ${line}`).join('\n')
        }
      ]
    };
  }

  if (exerciseKey === 'g2-27') {
    return {
      statement,
      supports: [
        {
          tipo: 'contexto',
          etiqueta: 'Datos del reactivo',
          titulo: 'Notación genética',
          contenido: '• R = rojo\n• r = blanco\n• Genotipo: Rr'
        }
      ]
    };
  }

  return { statement, supports: [] };
}

function parseExercise(blockLines, guideId, guideName) {
  const themeLine = blockLines.find((line) => line.startsWith('Temática del ejercicio:'));
  const numberLine = blockLines.find((line) => line.startsWith('Reactivo:'));
  const theme = themeLine ? cleanInline(themeLine.split(':').slice(1).join(':')) : '';
  const number = numberLine ? Number(numberLine.split(':').slice(1).join(':').trim()) : NaN;

  if (!Number.isFinite(number)) {
    throw new Error(`No se pudo leer el número de reactivo en ${guideName}`);
  }

  const rawStatement = joinLines(extractSection(blockLines, 'Planteamiento del problema:', ['Opciones:']))
    .replace(/^\d+\s*[.-]\s*/, '')
    .replace(/^-+\s*/, '')
    .trim();
  const options = parseOptions(extractSection(blockLines, 'Opciones:', ['Qué pide resolver el ejercicio:']));
  const optionMap = new Map(options.map((option) => [option.letter, option.text]));
  const quePide = joinLines(extractSection(blockLines, 'Qué pide resolver el ejercicio:', ['Desarrollo y descarte de opciones:']));
  const correctBlock = trimBlankLines(extractSection(blockLines, 'Opción correcta:', ['Argumento:']));
  const correctLine = cleanInline(correctBlock.join(' ').replace(/\s+/g, ' ').trim());
  const correctLetterMatch = correctLine.match(/^([A-E])\)/);
  const correctLetter = correctLetterMatch ? correctLetterMatch[1] : '';
  const descarte = parseDiscards(
    extractSection(blockLines, 'Desarrollo y descarte de opciones:', ['Opción correcta:']),
    optionMap,
    correctLetter
  );
  const desarrollo = joinLines(extractSection(blockLines, 'Argumento:', ['Pista:']));
  const hintContent = joinLines(extractSection(blockLines, 'Pista:', []));
  const sectionId = EXERCISE_SECTION[guideId][number];
  const section = SECTION_INDEX[sectionId];
  const exerciseKey = `${guideId}-${number}`;
  const supportData = exerciseSupports(exerciseKey, rawStatement);
  const statement = supportData.statement || rawStatement;

  const orden = [];
  if (quePide) orden.push('quePide');
  if (descarte.length) orden.push('descarte');
  if (correctLine) orden.push('respuestaFinal');
  if (desarrollo) orden.push('desarrollo');

  return {
    id: `${guideId}-bio-${number}`,
    guia: guideName,
    area: 'Biología',
    tema: sectionId,
    numero: number,
    tipo: theme,
    planteamiento: statement,
    enunciado: statement,
    contextoId: null,
    apoyos: supportData.supports,
    opciones: options,
    respuestaCorrecta: correctLetter,
    reactivo: {
      guia: guideName,
      numero: number,
      etiqueta: `${guideName} · Reactivo ${number}`
    },
    pista: {
      emoji: '💡',
      titulo: 'Pista',
      contenido: hintContent
    },
    explicacion: {
      orden,
      orientacion: section.tip,
      quePide,
      descarte,
      desarrollo,
      respuestaFinal: correctLine || `${correctLetter}) ${optionMap.get(correctLetter) || ''}`.trim()
    },
    visualId: sectionId
  };
}

function buildGuideData(guide) {
  const sourceFile = findGuideFile(guide.filePattern);
  const rawText = fs.readFileSync(sourceFile, 'utf8');
  const blocks = splitBlocks(rawText);
  const seen = new Set();
  const exercises = [];

  for (const block of blocks) {
    const exercise = parseExercise(block, guide.id, guide.name);
    const dedupeKey = [
      guide.id,
      exercise.numero,
      normalizeForKey(exercise.planteamiento)
    ].join('|');

    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    exercises.push(exercise);
  }

  const sectionMap = new Map(SECTION_DEFS.map((section) => [section.id, []]));
  for (const exercise of exercises) {
    sectionMap.get(exercise.tema).push(exercise);
  }

  return {
    id: guide.id,
    name: guide.name,
    areas: [
      {
        id: 'bio',
        name: 'Biología',
        description: 'Reactivos resueltos de Biología ECOEMS 2026 en una secuencia de estudio fiel a las guías.',
        sections: SECTION_DEFS.map((section) => ({
          id: section.id,
          name: section.name,
          shortName: section.shortName,
          description: section.description,
          heroSvg: section.id,
          contextos: [],
          exercises: sectionMap.get(section.id)
        }))
      }
    ]
  };
}

function buildAppData() {
  const guides = GUIDE_FILES.map(buildGuideData);
  const totalExercises = guides
    .flatMap((guide) => guide.areas)
    .flatMap((area) => area.sections)
    .flatMap((section) => section.exercises)
    .length;

  if (totalExercises !== 24) {
    throw new Error(`Se esperaban 24 reactivos únicos y se obtuvieron ${totalExercises}.`);
  }

  return {
    meta: {
      title: 'Instituto Fernando Ramírez · Biología',
      totalExercises,
      generatedAt: toMexicoTimestamp()
    },
    guides
  };
}

function writeOutput() {
  const data = buildAppData();
  const content = `window.IFR_APP_DATA = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
  return data;
}

if (require.main === module) {
  const data = writeOutput();
  console.log(`Archivo generado: ${path.basename(OUTPUT_FILE)}`);
  console.log(`Reactivos únicos: ${data.meta.totalExercises}`);
}

module.exports = {
  buildAppData,
  writeOutput
};
