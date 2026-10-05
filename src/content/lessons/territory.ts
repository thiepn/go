import type { LessonDefinition } from '../../learning/runtime';

const blackTerritory = { x: 1, y: 1 } as const;
const whiteTerritory = { x: 3, y: 3 } as const;

export const territoryLesson: LessonDefinition = {
  id: 'foundation-territory',
  title: 'Surround space',
  concept: 'territory',
  prerequisiteConcepts: ['safety-and-suicide'],
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
      id: 'goal',
      kind: 'continue',
      title: 'Capturing is not the main score.',
      instruction:
        'Go is mostly about controlling space. Empty intersections completely surrounded by your stones can become your territory.',
      enterEffects: [
        {
          type: 'highlight',
          points: [blackTerritory, whiteTerritory],
          kind: 'focus',
        },
      ],
    },
    {
      id: 'black-territory',
      kind: 'identify-territory',
      title: 'Find Black’s enclosed point.',
      instruction:
        'Tap the empty intersection completely surrounded by black stones.',
      expectedPoints: [blackTerritory],
      hints: [
        {
          text: 'Look inside the small black enclosure near the upper-left.',
          effects: [
            {
              type: 'highlight',
              points: [blackTerritory],
              kind: 'selected',
              pulse: true,
            },
          ],
        },
      ],
      successText: 'Yes. That enclosed empty point belongs to Black.',
    },
    {
      id: 'white-territory',
      kind: 'identify-territory',
      title: 'Now find White’s.',
      instruction:
        'Tap the empty intersection completely surrounded by white stones.',
      expectedPoints: [whiteTerritory],
      hints: [
        {
          text: 'Look inside the white enclosure near the lower-right.',
          effects: [
            {
              type: 'highlight',
              points: [whiteTerritory],
              kind: 'selected',
              pulse: true,
            },
          ],
        },
      ],
      successText: 'Correct. White controls that enclosed point.',
    },
    {
      id: 'open-space',
      kind: 'choose-answer',
      title: 'Open space is not territory yet.',
      instruction:
        'Why do the large open areas around these shapes not belong to either player yet?',
      choices: [
        {
          id: 'not-enclosed',
          label: 'They are not completely enclosed by one player',
        },
        {
          id: 'too-large',
          label: 'Territory can only be one point large',
        },
        {
          id: 'edge',
          label: 'Space near the edge never counts',
        },
      ],
      correctChoiceId: 'not-enclosed',
      successText:
        'Exactly. Territory must be secured; open space can still be contested.',
    },
  ],
};
