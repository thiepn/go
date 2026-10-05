import type { LessonDefinition } from '../../learning/runtime';

export const groupsAndConnectionLesson: LessonDefinition = {
  id: 'foundation-groups-connection',
  title: 'Stones work together',
  concept: 'groups-and-connection',
  prerequisiteConcepts: ['capture'],
  initialBoard: {
    size: 5,
    black: [
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ],
  },
  steps: [
    {
      id: 'select-group',
      kind: 'select-group',
      title: 'Touch one connected group.',
      instruction:
        'These black stones touch along a grid line. Tap either one to select the whole connected group.',
      expectedGroup: [
        { x: 1, y: 2 },
        { x: 2, y: 2 },
      ],
      enterEffects: [
        {
          type: 'show-group',
          at: { x: 1, y: 2 },
          kind: 'focus',
        },
      ],
      successText:
        'Connected stones behave as one group and share their liberties.',
    },
    {
      id: 'shared-liberties',
      kind: 'mark-liberties',
      title: 'Count the group’s liberties.',
      instruction:
        'Tap every empty intersection touching either stone in this connected group.',
      expectedPoints: [
        { x: 0, y: 2 },
        { x: 1, y: 1 },
        { x: 1, y: 3 },
        { x: 2, y: 1 },
        { x: 2, y: 3 },
        { x: 3, y: 2 },
      ],
      hints: [
        {
          text: 'Follow every grid line leaving the two-stone group.',
          effects: [
            {
              type: 'show-liberties',
              of: { x: 1, y: 2 },
            },
          ],
        },
      ],
      successText: 'Good. The connected group shares six liberties.',
    },
    {
      id: 'bridge-gap',
      kind: 'play-move',
      title: 'Connect two groups.',
      instruction:
        'Now the black stones are separated. Play in the gap so all three black stones become one connected group.',
      board: {
        size: 5,
        toPlay: 'black',
        black: [
          { x: 1, y: 2 },
          { x: 3, y: 2 },
        ],
      },
      acceptedPoints: [{ x: 2, y: 2 }],
      enterEffects: [
        {
          type: 'highlight',
          points: [{ x: 2, y: 2 }],
          kind: 'focus',
          pulse: true,
        },
      ],
      successText: 'Connected. The three stones now share one group.',
    },
    {
      id: 'verify-group',
      kind: 'select-group',
      title: 'See the new group.',
      instruction: 'Tap any black stone and select the connected group you just made.',
      expectedGroup: [
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
      ],
      successText:
        'Exactly. Direct connection can turn separate stones into one stronger group.',
    },
  ],
};
