import type { ProblemDefinition } from '../../practice';

export const beginnerProblems: readonly ProblemDefinition[] = [
  {
    id: 'capture-center-01',
    title: 'Take the last liberty',
    instruction: 'Black to play. Capture the white stone.',
    concept: 'capture',
    tags: ['capture', 'liberties'],
    difficulty: 1,
    setup: {
      size: 5,
      toPlay: 'black',
      black: [
        { x: 1, y: 2 },
        { x: 2, y: 1 },
        { x: 3, y: 2 },
      ],
      white: [{ x: 2, y: 2 }],
    },
    root: {
      branches: [
        {
          move: { x: 2, y: 3 },
          verdict: 'solved',
          feedback: 'Correct. You filled White’s final liberty.',
        },
      ],
    },
    wrongMoveFeedback: {
      '1,1': 'That point is diagonal to White. Diagonal points are not liberties.',
      '3,3': 'That point is diagonal to White. Follow the grid lines directly from the stone.',
    },
    hints: [
      {
        text: 'Count the white stone’s remaining liberties.',
      },
      {
        text: 'There is only one empty point directly beside White.',
        showPoints: [{ x: 2, y: 3 }],
      },
    ],
  },
  {
    id: 'capture-corner-01',
    title: 'Corner capture',
    instruction: 'Black to play. The edge changes how many liberties White has.',
    concept: 'capture',
    tags: ['capture', 'corner', 'liberties'],
    difficulty: 1,
    setup: {
      size: 5,
      toPlay: 'black',
      black: [{ x: 1, y: 0 }],
      white: [{ x: 0, y: 0 }],
    },
    root: {
      branches: [
        {
          move: { x: 0, y: 1 },
          verdict: 'solved',
          feedback: 'Correct. A corner stone can run out of liberties quickly.',
        },
      ],
    },
    hints: [
      {
        text: 'The board edge removes two possible directions.',
        showPoints: [{ x: 0, y: 1 }],
      },
    ],
  },
  {
    id: 'escape-atari-01',
    title: 'Save the stone',
    instruction: 'Black is in atari. Find the move that gives the group more liberties.',
    concept: 'escape-atari',
    tags: ['atari', 'defense', 'liberties'],
    difficulty: 1,
    setup: {
      size: 5,
      toPlay: 'black',
      black: [{ x: 2, y: 2 }],
      white: [
        { x: 1, y: 2 },
        { x: 2, y: 1 },
        { x: 3, y: 2 },
      ],
    },
    root: {
      branches: [
        {
          move: { x: 2, y: 3 },
          verdict: 'solved',
          feedback: 'Safe for now. Extending created several new liberties.',
        },
      ],
    },
    wrongMoveFeedback: {
      '1,1': 'Playing elsewhere leaves Black in atari. Save the threatened group first.',
      '3,3': 'That does not extend the endangered black stone. Find its last liberty.',
    },
    hints: [
      {
        text: 'Find Black’s single remaining liberty.',
        showPoints: [{ x: 2, y: 3 }],
      },
    ],
  },
  {
    id: 'connect-gap-01',
    title: 'Join the stones',
    instruction: 'Black to play. Make the two stones one connected group.',
    concept: 'connection',
    tags: ['connection', 'groups'],
    difficulty: 1,
    setup: {
      size: 5,
      toPlay: 'black',
      black: [
        { x: 1, y: 2 },
        { x: 3, y: 2 },
      ],
    },
    root: {
      branches: [
        {
          move: { x: 2, y: 2 },
          verdict: 'solved',
          feedback: 'Connected. All three stones now form one group.',
        },
      ],
    },
    hints: [
      {
        text: 'Fill the one-point gap between the stones.',
        showPoints: [{ x: 2, y: 2 }],
      },
    ],
  },
  {
    id: 'atari-choice-01',
    title: 'Put White in atari',
    instruction: 'Black to play. White has two liberties. Remove either one.',
    concept: 'atari',
    tags: ['atari', 'liberties', 'multiple-solutions'],
    difficulty: 1,
    setup: {
      size: 5,
      toPlay: 'black',
      black: [
        { x: 1, y: 2 },
        { x: 2, y: 1 },
      ],
      white: [{ x: 2, y: 2 }],
    },
    root: {
      branches: [
        {
          move: { x: 3, y: 2 },
          verdict: 'solved',
          feedback: 'Correct. White now has only one liberty.',
        },
        {
          move: { x: 2, y: 3 },
          verdict: 'solved',
          feedback: 'Also correct. White now has only one liberty.',
        },
      ],
    },
    hints: [
      {
        text: 'White has exactly two liberties. Either one can be filled.',
        showPoints: [
          { x: 3, y: 2 },
          { x: 2, y: 3 },
        ],
      },
    ],
  },
  {
    id: 'capture-group-01',
    title: 'Capture the whole group',
    instruction: 'Black to play. Two connected white stones share one final liberty.',
    concept: 'group-capture',
    tags: ['capture', 'groups', 'liberties'],
    difficulty: 2,
    setup: {
      size: 5,
      toPlay: 'black',
      black: [
        { x: 1, y: 2 },
        { x: 2, y: 1 },
        { x: 3, y: 2 },
        { x: 1, y: 3 },
        { x: 2, y: 4 },
      ],
      white: [
        { x: 2, y: 2 },
        { x: 2, y: 3 },
      ],
    },
    root: {
      branches: [
        {
          move: { x: 3, y: 3 },
          verdict: 'solved',
          feedback: 'Correct. Connected stones are captured together when their shared liberties reach zero.',
        },
      ],
    },
    hints: [
      {
        text: 'Treat the two white stones as one group.',
      },
      {
        text: 'The group has one liberty on its right side.',
        showPoints: [{ x: 3, y: 3 }],
      },
    ],
  },
  {
    id: 'read-capture-01',
    title: 'Read one reply ahead',
    instruction: 'Black to play. Put White in atari, then punish White if it ignores the threat.',
    concept: 'reading',
    tags: ['reading', 'atari', 'capture', 'variations'],
    difficulty: 2,
    setup: {
      size: 5,
      toPlay: 'black',
      black: [
        { x: 1, y: 2 },
        { x: 2, y: 1 },
      ],
      white: [{ x: 2, y: 2 }],
    },
    root: {
      prompt: 'First, reduce White to one liberty.',
      branches: [
        {
          move: { x: 3, y: 2 },
          verdict: 'continue',
          feedback: 'Atari. White ignores the danger and plays elsewhere.',
          opponentMove: { x: 4, y: 4 },
          next: {
            prompt: 'Finish the capture.',
            branches: [
              {
                move: { x: 2, y: 3 },
                verdict: 'solved',
                feedback: 'Correct. You remembered the threatened stone and took its final liberty.',
              },
            ],
          },
        },
        {
          move: { x: 2, y: 3 },
          verdict: 'continue',
          feedback: 'Atari from the other side. White ignores the danger.',
          opponentMove: { x: 4, y: 4 },
          next: {
            prompt: 'Finish the capture.',
            branches: [
              {
                move: { x: 3, y: 2 },
                verdict: 'solved',
                feedback: 'Correct. Alternate first moves can lead to the same tactical result.',
              },
            ],
          },
        },
      ],
    },
    hints: [
      {
        text: 'White begins with two liberties.',
        showPoints: [
          { x: 3, y: 2 },
          { x: 2, y: 3 },
        ],
      },
    ],
  },
  {
    id: 'close-territory-01',
    title: 'Close the boundary',
    instruction: 'Black to play. Seal the upper-left area so it is surrounded by Black and the board edge.',
    concept: 'territory',
    tags: ['territory', 'boundary'],
    difficulty: 2,
    setup: {
      size: 5,
      toPlay: 'black',
      black: [
        { x: 2, y: 0 },
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 1, y: 2 },
      ],
    },
    root: {
      branches: [
        {
          move: { x: 0, y: 2 },
          verdict: 'solved',
          feedback: 'Closed. The empty points behind the wall are now surrounded by Black and the board edge.',
        },
      ],
    },
    wrongMoveFeedback: {
      '1,1': 'That point is inside the area you are trying to surround. Close the boundary instead of filling your own space.',
    },
    hints: [
      {
        text: 'Find the opening where the wall has not yet reached the left edge.',
        showPoints: [{ x: 0, y: 2 }],
      },
    ],
  },
];
