import type { LessonDefinition } from '../../learning/runtime';

export const turnsAndLibertiesLesson: LessonDefinition = {
  id: 'foundation-turns-liberties',
  title: 'Turns and breathing room',
  concept: 'turns-and-liberties',
  prerequisiteConcepts: ['board-intersections'],
  initialBoard: {
    size: 5,
    toPlay: 'black',
  },
  steps: [
    {
      id: 'alternate',
      kind: 'continue',
      title: 'Black, then White.',
      instruction:
        'Players take turns placing one stone. Black goes first. Then White. Stones do not move after they are placed.',
    },
    {
      id: 'black-center',
      kind: 'play-move',
      title: 'Black goes first.',
      instruction: 'Place Black on the marked center intersection.',
      acceptedPoints: [{ x: 2, y: 2 }],
      enterEffects: [
        {
          type: 'highlight',
          points: [{ x: 2, y: 2 }],
          kind: 'focus',
          pulse: true,
        },
      ],
      successText: 'Black has played. Now it is White’s turn.',
    },
    {
      id: 'white-corner',
      kind: 'play-move',
      title: 'Now White.',
      instruction:
        'Place White in the upper-left corner. A corner stone touches fewer intersections than a center stone.',
      acceptedPoints: [{ x: 0, y: 0 }],
      enterEffects: [
        {
          type: 'highlight',
          points: [{ x: 0, y: 0 }],
          kind: 'focus',
          pulse: true,
        },
      ],
      successText: 'Good. Black and White alternate one move at a time.',
    },
    {
      id: 'corner-liberties',
      kind: 'mark-liberties',
      title: 'How does a corner stone breathe?',
      instruction:
        'Tap every liberty of the white corner stone. Remember: only directly connected empty intersections count.',
      expectedPoints: [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ],
      hints: [
        {
          text: 'A corner has only two directions inside the board.',
          effects: [
            {
              type: 'show-liberties',
              of: { x: 0, y: 0 },
            },
          ],
        },
      ],
      successText: 'Exactly. A corner stone starts with two liberties.',
    },
    {
      id: 'compare',
      kind: 'choose-answer',
      title: 'Position changes breathing room.',
      instruction:
        'A lone stone in the center begins with four liberties. How many does a lone corner stone begin with?',
      choices: [
        { id: 'four', label: '4 liberties' },
        { id: 'three', label: '3 liberties' },
        { id: 'two', label: '2 liberties' },
      ],
      correctChoiceId: 'two',
      successText:
        'Right. Center stones can breathe in four directions; corner stones only in two.',
    },
  ],
};
