import type { ConceptDefinition } from './types';

export const CONCEPTS: readonly ConceptDefinition[] = [
  {
    id: 'board',
    title: 'Board & intersections',
    description: 'Read the board and place stones on intersections.',
    prerequisites: [],
    practiceTags: [],
  },
  {
    id: 'turns',
    title: 'Turns',
    description: 'Understand alternating play and fixed stones.',
    prerequisites: ['board'],
    practiceTags: [],
  },
  {
    id: 'liberties',
    title: 'Liberties',
    description: 'See and count the breathing space of stones and groups.',
    prerequisites: ['board'],
    practiceTags: ['liberties'],
  },
  {
    id: 'groups',
    title: 'Groups',
    description: 'Recognize connected stones and shared liberties.',
    prerequisites: ['liberties'],
    practiceTags: ['groups'],
  },
  {
    id: 'atari',
    title: 'Atari',
    description: 'Recognize groups with exactly one liberty.',
    prerequisites: ['liberties', 'groups'],
    practiceTags: ['atari'],
  },
  {
    id: 'capture',
    title: 'Capture',
    description: 'Remove opposing groups by taking their final liberty.',
    prerequisites: ['atari'],
    practiceTags: ['capture'],
  },
  {
    id: 'connection',
    title: 'Connection',
    description: 'Join stones into stronger shared groups.',
    prerequisites: ['groups'],
    practiceTags: ['connection'],
  },
  {
    id: 'safety',
    title: 'Safety',
    description: 'Escape danger and avoid self-destructive moves.',
    prerequisites: ['liberties', 'connection'],
    practiceTags: ['defense', 'atari'],
  },
  {
    id: 'territory',
    title: 'Territory',
    description: 'Recognize and secure surrounded empty space.',
    prerequisites: ['board', 'connection'],
    practiceTags: ['territory'],
  },
  {
    id: 'life',
    title: 'Life & eyes',
    description: 'Recognize basic eye shapes and secure living groups.',
    prerequisites: ['liberties', 'territory', 'safety'],
    practiceTags: [],
  },
  {
    id: 'ko',
    title: 'Ko',
    description: 'Understand immediate repetition and ko recapture.',
    prerequisites: ['capture'],
    practiceTags: [],
  },
  {
    id: 'passing',
    title: 'Passing & ending',
    description: 'Recognize when useful play is finished.',
    prerequisites: ['territory'],
    practiceTags: [],
  },
  {
    id: 'scoring',
    title: 'Scoring',
    description: 'Resolve the end and count area with komi.',
    prerequisites: ['territory', 'passing'],
    practiceTags: [],
  },
  {
    id: 'reading',
    title: 'Reading',
    description: 'Think through likely move sequences before playing.',
    prerequisites: ['liberties', 'atari', 'capture'],
    practiceTags: ['reading'],
  },
] as const;

const CONCEPT_MAP = new Map(
  CONCEPTS.map((concept) => [concept.id, concept]),
);

const SOURCE_ALIASES: Readonly<Record<string, readonly string[]>> = {
  'board-intersections': ['board'],
  'turns-and-liberties': ['turns', 'liberties'],
  capture: ['capture'],
  'groups-and-connection': ['groups', 'connection'],
  'safety-and-suicide': ['safety'],
  territory: ['territory'],
  'life-and-eyes': ['life'],
  ko: ['ko'],
  'passing-and-ending': ['passing'],
  'dead-stones': ['life', 'scoring'],
  scoring: ['scoring'],
  'first-game-readiness': ['capture', 'life', 'passing', 'scoring'],
  'escape-atari': ['safety'],
  connection: ['connection'],
  atari: ['atari'],
  'group-capture': ['groups', 'capture'],
  reading: ['reading'],
};

export function getConcept(
  conceptId: string,
): ConceptDefinition | undefined {
  return CONCEPT_MAP.get(conceptId);
}

export function resolveConceptIds(
  sourceConcept: string,
): readonly string[] {
  if (CONCEPT_MAP.has(sourceConcept)) {
    return [sourceConcept];
  }

  return SOURCE_ALIASES[sourceConcept] ?? [];
}

export function descendantCount(
  conceptId: string,
): number {
  const visited = new Set<string>();
  const queue = [conceptId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    for (const concept of CONCEPTS) {
      if (
        concept.prerequisites.includes(current) &&
        !visited.has(concept.id)
      ) {
        visited.add(concept.id);
        queue.push(concept.id);
      }
    }
  }

  return visited.size;
}
