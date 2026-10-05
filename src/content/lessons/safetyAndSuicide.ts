import type { LessonDefinition } from '../../learning/runtime';

export const safetyAndSuicideLesson: LessonDefinition = {
  id: 'foundation-safety-suicide',
  title: 'Keep your stones safe',
  concept: 'safety-and-suicide',
  prerequisiteConcepts: ['groups-and-connection'],
  initialBoard: {
    size: 5,
    toPlay: 'black',
    black: [{ x: 2, y: 2 }],
    white: [
      { x: 1, y: 2 },
      { x: 2, y: 1 },
      { x: 3, y: 2 },
    ],
  },
  steps: [
    {
      id: 'escape-atari',
      kind: 'play-move',
      title: 'Escape from atari.',
      instruction:
        'Black has one liberty. Extend into that liberty so the black group gains breathing room.',
      acceptedPoints: [{ x: 2, y: 3 }],
      enterEffects: [
        {
          type: 'show-atari',
          groupAt: { x: 2, y: 2 },
        },
      ],
      hints: [
        {
          text: 'Follow Black’s only remaining liberty downward.',
          effects: [
            {
              type: 'ghost',
              ghost: {
                point: { x: 2, y: 3 },
                color: 'black',
              },
            },
          ],
        },
      ],
      successText:
        'Safe for now. Extending increased the group’s liberties.',
    },
    {
      id: 'suicide-demo',
      kind: 'try-illegal-move',
      title: 'Can Black play here?',
      instruction:
        'Try placing Black in the surrounded center point. The app will show you whether the move is allowed.',
      board: {
        size: 3,
        toPlay: 'black',
        white: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: 2, y: 1 },
          { x: 1, y: 2 },
        ],
      },
      point: { x: 1, y: 1 },
      expectedReason: 'suicide',
      enterEffects: [
        {
          type: 'highlight',
          points: [{ x: 1, y: 1 }],
          kind: 'warning',
          pulse: true,
        },
      ],
      successText:
        'Not allowed. You normally cannot play a stone that would leave your own group with no liberties.',
    },
    {
      id: 'capture-exception',
      kind: 'choose-answer',
      title: 'There is one important exception.',
      instruction:
        'When can a move into an apparently surrounded point still be legal?',
      choices: [
        {
          id: 'capture',
          label: 'When the move captures opposing stones and creates liberties',
        },
        { id: 'never', label: 'Never' },
        { id: 'corner', label: 'Only in a corner' },
      ],
      correctChoiceId: 'capture',
      successText:
        'Correct. Captures are resolved first. If the move captures and leaves your group with a liberty, it is legal.',
    },
  ],
};
