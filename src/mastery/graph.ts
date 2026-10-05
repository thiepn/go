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
  {
    id: 'ladder',
    title: 'Ladders',
    description: 'Read the repeated atari pattern that drives a group across the board.',
    prerequisites: ['reading', 'atari'],
    practiceTags: ['ladder', 'reading'],
  },
  {
    id: 'net',
    title: 'Nets',
    description: 'Capture escaping stones by surrounding their future routes instead of chasing directly.',
    prerequisites: ['reading', 'capture'],
    practiceTags: ['net', 'capture', 'reading'],
  },
  {
    id: 'snapback',
    title: 'Snapback',
    description: 'Recognize a sacrifice-and-recapture tactic where a tempting capture loses a larger group.',
    prerequisites: ['reading', 'capture'],
    practiceTags: ['snapback', 'tesuji', 'reading'],
  },
  {
    id: 'semeai',
    title: 'Capturing races',
    description: 'Compare liberties and read which neighboring group is captured first.',
    prerequisites: ['liberties', 'reading'],
    practiceTags: ['capturing-race', 'liberties', 'reading'],
  },
  {
    id: 'false-eye',
    title: 'False eyes',
    description: 'Distinguish true eye space from points that can still be cut or captured.',
    prerequisites: ['life', 'connection'],
    practiceTags: ['life-death', 'eyes', 'false-eye'],
  },
  {
    id: 'vital-point',
    title: 'Life & death vital points',
    description: 'Find the move that decides whether an enclosed group can make enough eyes.',
    prerequisites: ['life', 'reading'],
    practiceTags: ['life-death', 'vital-point', 'reading'],
  },
  {
    id: 'seki',
    title: 'Seki',
    description: 'Recognize mutual life where neither player can capture first without losing.',
    prerequisites: ['life', 'semeai'],
    practiceTags: ['life-death', 'seki'],
  },
  {
    id: 'cutting',
    title: 'Cuts',
    description: 'Find and protect connection points that split groups apart.',
    prerequisites: ['connection', 'reading'],
    practiceTags: ['cut', 'connection', 'reading'],
  },
  {
    id: 'shape',
    title: 'Shape',
    description: 'Build efficient groups that use stones well and avoid unnecessary weakness.',
    prerequisites: ['connection', 'liberties'],
    practiceTags: ['shape'],
  },
  {
    id: 'weak-groups',
    title: 'Weak groups',
    description: 'Judge which groups lack eyes, liberties, base, or connection and therefore need attention.',
    prerequisites: ['shape', 'life'],
    practiceTags: ['weak-groups', 'defense', 'shape'],
  },
  {
    id: 'attack-defense',
    title: 'Attack & defense',
    description: 'Pressure weak groups for profit while keeping your own groups safe.',
    prerequisites: ['weak-groups', 'reading'],
    practiceTags: ['attack', 'defense', 'reading'],
  },
  {
    id: 'influence',
    title: 'Influence',
    description: 'Use strong outward-facing stones to affect nearby fights and development.',
    prerequisites: ['territory', 'attack-defense'],
    practiceTags: ['influence', 'strategy'],
  },
  {
    id: 'invasion',
    title: 'Invasions',
    description: 'Enter large opposing frameworks deeply enough to create independent life or escape.',
    prerequisites: ['life', 'territory', 'reading'],
    practiceTags: ['invasion', 'territory', 'life-death'],
  },
  {
    id: 'reduction',
    title: 'Reductions',
    description: 'Shrink opposing potential from the outside without taking on unnecessary life-and-death risk.',
    prerequisites: ['influence', 'territory'],
    practiceTags: ['reduction', 'influence', 'strategy'],
  },
  {
    id: 'sente-gote',
    title: 'Sente & gote',
    description: 'Distinguish moves that keep the initiative from moves that hand the turn away.',
    prerequisites: ['reading', 'territory'],
    practiceTags: ['sente', 'endgame'],
  },
  {
    id: 'endgame',
    title: 'Endgame',
    description: 'Compare boundary moves by size and urgency once large fights are settled.',
    prerequisites: ['territory', 'sente-gote'],
    practiceTags: ['endgame', 'sente'],
  },
  {
    id: 'opening',
    title: 'Opening principles',
    description: 'Develop efficiently by balancing corners, sides, direction, strength, and unfinished groups.',
    prerequisites: ['territory', 'influence', 'weak-groups'],
    practiceTags: ['opening', 'strategy'],
  },
  {
    id: 'joseki',
    title: 'Introductory joseki',
    description: 'Understand joseki as locally reasonable exchanges whose value depends on the whole board.',
    prerequisites: ['opening', 'shape', 'cutting'],
    practiceTags: ['joseki', 'shape', 'opening'],
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
  ladder: ['ladder'],
  net: ['net'],
  snapback: ['snapback'],
  'capturing-race': ['semeai'],
  semeai: ['semeai'],
  'false-eye': ['false-eye'],
  'life-death-vital-point': ['vital-point'],
  'vital-point': ['vital-point'],
  seki: ['seki'],
  cutting: ['cutting'],
  shape: ['shape'],
  'weak-groups': ['weak-groups'],
  'attack-defense': ['attack-defense'],
  influence: ['influence'],
  invasion: ['invasion'],
  reduction: ['reduction'],
  'sente-gote': ['sente-gote'],
  endgame: ['endgame'],
  opening: ['opening'],
  joseki: ['joseki'],
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
