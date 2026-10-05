import type { LessonDefinition } from '../../learning/runtime';

const blackPoint = { x: 1, y: 1 } as const;
const whitePoint = { x: 3, y: 3 } as const;

export const scoringLesson: LessonDefinition = {
  id: 'foundation-scoring',
  title: 'Count the result',
  concept: 'scoring',
  prerequisiteConcepts: ['dead-stones'],
  initialBoard: {
    size: 5,
    black: [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ],
    white: [
      { x: 3, y: 2 },
      { x: 2, y: 3 },
      { x: 4, y: 3 },
      { x: 3, y: 4 },
    ],
  },
  steps: [
    {
      id: 'area-rule',
      kind: 'continue',
      title: 'We start with area scoring.',
      instruction:
        'For this course, count your stones on the board plus the empty intersections surrounded only by you. This makes beginner scoring concrete and easy to play out.',
    },
    {
      id: 'black-area',
      kind: 'identify-territory',
      title: 'Count Black’s surrounded space.',
      instruction:
        'Tap Black’s enclosed empty intersection.',
      expectedPoints: [blackPoint],
      successText:
        'Black has 4 stones here plus 1 surrounded empty point: 5 points of area.',
    },
    {
      id: 'white-area',
      kind: 'identify-territory',
      title: 'Count White’s surrounded space.',
      instruction:
        'Tap White’s enclosed empty intersection.',
      expectedPoints: [whitePoint],
      successText:
        'White also has 4 stones plus 1 surrounded empty point: 5 points before komi.',
    },
    {
      id: 'raw-score',
      kind: 'choose-answer',
      title: 'What is the raw score?',
      instruction:
        'Ignoring komi for one moment, what is the score in this tiny example?',
      choices: [
        { id: 'tie', label: 'Black 5 — White 5' },
        { id: 'black', label: 'Black 9 — White 1' },
        { id: 'white', label: 'Black 1 — White 9' },
      ],
      correctChoiceId: 'tie',
      successText: 'Correct. The board itself is tied 5–5.',
    },
    {
      id: 'komi',
      kind: 'continue',
      title: 'White usually receives komi.',
      instruction:
        'Black moves first, which is an advantage. Standard games usually give White extra points called komi. The app will show the exact komi and final total automatically during real games.',
    },
    {
      id: 'winning',
      kind: 'choose-answer',
      title: 'The larger final score wins.',
      instruction:
        'After dead stones are resolved and the board is counted, what determines the winner?',
      choices: [
        { id: 'score', label: 'Whoever has the higher final score' },
        { id: 'captures', label: 'Whoever captured the first stone' },
        { id: 'stones', label: 'Whoever placed more moves' },
      ],
      correctChoiceId: 'score',
      successText:
        'Exactly. You now know how normal play reaches a result.',
    },
  ],
};
