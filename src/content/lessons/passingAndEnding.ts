import type { LessonDefinition } from '../../learning/runtime';

export const passingAndEndingLesson: LessonDefinition = {
  id: 'foundation-passing-ending',
  title: 'Know when the game is over',
  concept: 'passing-and-ending',
  prerequisiteConcepts: ['ko'],
  initialBoard: {
    size: 5,
    toPlay: 'black',
    black: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ],
    white: [
      { x: 4, y: 4 },
      { x: 3, y: 4 },
      { x: 4, y: 3 },
    ],
  },
  steps: [
    {
      id: 'when-pass',
      kind: 'continue',
      title: 'You do not have to place a stone.',
      instruction:
        'When you believe there is no useful move left, you may pass instead of placing a stone.',
    },
    {
      id: 'black-pass',
      kind: 'pass',
      title: 'Black passes.',
      instruction:
        'Press Pass. White still gets a turn because one pass does not end the game.',
      successText: 'Black passed. White may still play—or pass too.',
    },
    {
      id: 'white-pass',
      kind: 'pass',
      title: 'White passes too.',
      instruction:
        'Press Pass again. Two consecutive passes tell both players the game is finished.',
      successText: 'Both players passed consecutively. The game is now finished.',
    },
    {
      id: 'ending-check',
      kind: 'choose-answer',
      title: 'What ends normal play?',
      instruction:
        'In the beginner rules used by this course, when does the game proceed to scoring?',
      choices: [
        {
          id: 'passes',
          label: 'After both players pass consecutively',
        },
        {
          id: 'full',
          label: 'Only when every intersection contains a stone',
        },
        {
          id: 'capture',
          label: 'Immediately after the first capture',
        },
      ],
      correctChoiceId: 'passes',
      successText:
        'Correct. Passing is how players say they believe useful play is finished.',
    },
  ],
};
