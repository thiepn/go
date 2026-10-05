import type {
  ProblemDefinition,
} from '../../practice';

export const developingProblems: readonly ProblemDefinition[] = [
  {
    id: 'reading-forcing-01',
    title: 'Start with the forcing move',
    instruction:
      'Black to play. White has two liberties. Choose a move that forces an immediate reply.',
    concept: 'reading',
    tags: ['reading', 'atari'],
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
      branches: [
        {
          move: { x: 3, y: 2 },
          verdict: 'solved',
          feedback:
            'Correct. Atari is forcing: White must answer the threatened capture.',
        },
        {
          move: { x: 2, y: 3 },
          verdict: 'solved',
          feedback:
            'Correct. This atari also forces White to respond.',
        },
      ],
    },
    hints: [
      {
        text: 'Look for a move that leaves White with exactly one liberty.',
        showPoints: [
          { x: 3, y: 2 },
          { x: 2, y: 3 },
        ],
      },
    ],
  },
  {
    id: 'ladder-read-01',
    title: 'Continue the ladder',
    instruction:
      'Black to play. Start the ladder, then continue the next atari after White escapes.',
    concept: 'ladder',
    tags: ['ladder', 'reading', 'atari'],
    difficulty: 3,
    setup: {
      size: 7,
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
          verdict: 'continue',
          feedback:
            'Good. White escapes downward; continue the forcing zigzag.',
          opponentMove: { x: 2, y: 3 },
          next: {
            branches: [
              {
                move: { x: 3, y: 3 },
                verdict: 'solved',
                feedback:
                  'Correct. You continued the ladder instead of chasing randomly.',
              },
            ],
          },
        },
      ],
    },
    hints: [
      {
        text: 'The first move is atari on White’s right.',
        showPoints: [{ x: 3, y: 2 }],
      },
    ],
  },
  {
    id: 'net-shape-01',
    title: 'Use a net, not another chase',
    instruction:
      'Black to play. Surround the escape routes from a distance.',
    concept: 'net',
    tags: ['net', 'capture', 'reading'],
    difficulty: 3,
    setup: {
      size: 7,
      toPlay: 'black',
      black: [
        { x: 2, y: 3 },
        { x: 3, y: 2 },
      ],
      white: [{ x: 3, y: 3 }],
    },
    root: {
      branches: [
        {
          move: { x: 4, y: 4 },
          verdict: 'solved',
          feedback:
            'Correct. The diagonal net point covers future escape routes without needing immediate contact.',
        },
      ],
    },
    hints: [
      {
        text: 'A net often sits one step away from the stone it is trapping.',
        showPoints: [{ x: 4, y: 4 }],
      },
    ],
  },
  {
    id: 'snapback-vital-01',
    title: 'Snap back after the bait is taken',
    instruction:
      'White to play. Black just captured one white stone in the corner and left the capturing group with one liberty. Recapture now.',
    concept: 'snapback',
    tags: ['snapback', 'tesuji', 'reading'],
    difficulty: 3,
    setup: {
      size: 5,
      toPlay: 'white',
      black: [
        { x: 0, y: 2 },
        { x: 0, y: 3 },
        { x: 1, y: 4 },
      ],
      white: [
        { x: 0, y: 1 },
        { x: 1, y: 2 },
        { x: 1, y: 3 },
      ],
    },
    root: {
      branches: [
        {
          move: { x: 0, y: 4 },
          verdict: 'solved',
          feedback:
            'Snapback. White retakes the corner and captures the two-stone black group that the bait capture left in atari.',
        },
      ],
    },
    hints: [
      {
        text: 'The black group on the left edge has only one liberty: the empty corner.',
        showPoints: [{ x: 0, y: 4 }],
      },
    ],
  },
  {
    id: 'semeai-last-liberty-01',
    title: 'Win the capturing race',
    instruction:
      'Black to play. White’s connected group has one final liberty. Take it before playing elsewhere.',
    concept: 'semeai',
    tags: ['capturing-race', 'liberties', 'capture'],
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
          feedback:
            'Correct. In a capturing race, the liberty count only matters if you act on it at the right time.',
        },
      ],
    },
    hints: [
      {
        text: 'Treat the two white stones as one group and count its remaining liberties.',
        showPoints: [{ x: 3, y: 3 }],
      },
    ],
  },
  {
    id: 'false-eye-diagonal-01',
    title: 'Destroy the false eye',
    instruction:
      'White to play. Take the second diagonal that prevents Black from treating the center as a secure eye.',
    concept: 'false-eye',
    tags: ['life-death', 'false-eye', 'eyes'],
    difficulty: 3,
    setup: {
      size: 5,
      toPlay: 'white',
      black: [
        { x: 2, y: 1 },
        { x: 1, y: 2 },
        { x: 3, y: 2 },
        { x: 2, y: 3 },
      ],
      white: [{ x: 3, y: 3 }],
    },
    root: {
      branches: [
        {
          move: { x: 1, y: 1 },
          verdict: 'solved',
          feedback:
            'Correct. Controlling enough diagonals can make the surrounded center point a false eye.',
        },
      ],
    },
    hints: [
      {
        text: 'The center is surrounded orthogonally. Look at the missing hostile diagonal.',
        showPoints: [{ x: 1, y: 1 }],
      },
    ],
  },
  {
    id: 'life-vital-point-01',
    title: 'Play the vital point',
    instruction:
      'White to play. Occupy the center of the three-point eye space before Black can split it into living eyes.',
    concept: 'vital-point',
    tags: ['life-death', 'vital-point', 'reading'],
    difficulty: 3,
    setup: {
      size: 5,
      toPlay: 'white',
      black: [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 4, y: 1 },
        { x: 0, y: 3 },
        { x: 1, y: 3 },
        { x: 2, y: 3 },
        { x: 3, y: 3 },
        { x: 4, y: 3 },
        { x: 0, y: 2 },
        { x: 4, y: 2 },
      ],
    },
    root: {
      branches: [
        {
          move: { x: 2, y: 2 },
          verdict: 'solved',
          feedback:
            'Correct. The center is the shape-changing vital point in this compact eye space.',
        },
      ],
    },
    hints: [
      {
        text: 'Look for the point that splits the three-point eye space.',
        showPoints: [{ x: 2, y: 2 }],
      },
    ],
  },
  {
    id: 'seki-leave-alone-01',
    title: 'Do not fill mutual life',
    instruction:
      'Black to play. Both chains share the two right-edge liberties. Play elsewhere instead of losing the capturing race by filling one first.',
    concept: 'seki',
    tags: ['life-death', 'seki', 'judgment'],
    difficulty: 3,
    setup: {
      size: 4,
      toPlay: 'black',
      black: [
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 2, y: 3 },
      ],
      white: [
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 3, y: 2 },
      ],
    },
    root: {
      branches: [
        {
          move: { x: 0, y: 0 },
          verdict: 'solved',
          feedback:
            'Correct. Leave the two shared liberties untouched. Playing first inside the seki lets White take the other liberty and capture.',
        },
      ],
    },
    wrongMoveFeedback: {
      '3,1':
        'That fills one of the two shared liberties. White can take the other and capture Black.',
      '3,3':
        'That fills one of the two shared liberties. White can take the other and capture Black.',
    },
    hints: [
      {
        text: 'The right-edge points are the seki liberties. Choose a legal move elsewhere.',
        showPoints: [{ x: 0, y: 0 }],
      },
    ],
  },
  {
    id: 'cut-gap-01',
    title: 'Take the cutting point',
    instruction:
      'White to play. Occupy the one-point gap before Black connects.',
    concept: 'cutting',
    tags: ['cut', 'connection', 'reading'],
    difficulty: 2,
    setup: {
      size: 5,
      toPlay: 'white',
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
          feedback:
            'Correct. The cut turns one potential connected group into two separate problems.',
        },
      ],
    },
    hints: [
      {
        text: 'Play where Black would connect.',
        showPoints: [{ x: 2, y: 2 }],
      },
    ],
  },
  {
    id: 'shape-extend-01',
    title: 'Avoid the empty triangle',
    instruction:
      'Black to play. Extend outward instead of adding another stone to the crowded three-point corner of the shape.',
    concept: 'shape',
    tags: ['shape', 'efficiency'],
    difficulty: 2,
    setup: {
      size: 7,
      toPlay: 'black',
      black: [
        { x: 2, y: 2 },
        { x: 3, y: 2 },
      ],
    },
    root: {
      branches: [
        {
          move: { x: 4, y: 3 },
          verdict: 'solved',
          feedback:
            'Good. The diagonal extension adds reach and liberties instead of simply packing another stone into the same small area.',
        },
        {
          move: { x: 4, y: 2 },
          verdict: 'solved',
          feedback:
            'Also good. Extending the line uses the existing stones efficiently without making an empty triangle.',
        },
      ],
    },
    hints: [
      {
        text: 'Choose a move that extends the group into new space.',
        showPoints: [
          { x: 4, y: 2 },
          { x: 4, y: 3 },
        ],
      },
    ],
  },
  {
    id: 'weak-group-stabilize-01',
    title: 'Help the weak group first',
    instruction:
      'Black to play. The isolated stone is under pressure. Extend it into more space before starting another fight.',
    concept: 'weak-groups',
    tags: ['weak-groups', 'defense', 'shape'],
    difficulty: 2,
    setup: {
      size: 7,
      toPlay: 'black',
      black: [
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 5, y: 3 },
      ],
      white: [
        { x: 4, y: 3 },
        { x: 5, y: 2 },
      ],
    },
    root: {
      branches: [
        {
          move: { x: 6, y: 3 },
          verdict: 'solved',
          feedback:
            'Correct. Extending toward open space gives the weak stone more liberties and room to settle.',
        },
        {
          move: { x: 5, y: 4 },
          verdict: 'solved',
          feedback:
            'Correct. This extension also gives the weak stone more space and avoids abandoning it.',
        },
      ],
    },
    hints: [
      {
        text: 'Work with the isolated stone near White, not the already safer group on the left.',
        showPoints: [
          { x: 6, y: 3 },
          { x: 5, y: 4 },
        ],
      },
    ],
  },
  {
    id: 'attack-cap-01',
    title: 'Attack from above',
    instruction:
      'Black to play. Cap the small white group so it runs toward Black’s stronger lower stones.',
    concept: 'attack-defense',
    tags: ['attack', 'defense', 'weak-groups'],
    difficulty: 3,
    setup: {
      size: 7,
      toPlay: 'black',
      black: [
        { x: 2, y: 5 },
        { x: 3, y: 5 },
      ],
      white: [
        { x: 3, y: 3 },
        { x: 4, y: 3 },
      ],
    },
    root: {
      branches: [
        {
          move: { x: 3, y: 2 },
          verdict: 'solved',
          feedback:
            'Correct. The cap applies pressure while steering White toward Black’s existing strength.',
        },
      ],
    },
    hints: [
      {
        text: 'Attack from the open side above White rather than pushing from your own strong side.',
        showPoints: [{ x: 3, y: 2 }],
      },
    ],
  },
  {
    id: 'influence-develop-01',
    title: 'Use the wall',
    instruction:
      'Black to play. Develop in front of the strong wall instead of adding a redundant stone behind it.',
    concept: 'influence',
    tags: ['influence', 'strategy'],
    difficulty: 3,
    setup: {
      size: 9,
      toPlay: 'black',
      black: [
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 2, y: 4 },
        { x: 2, y: 5 },
        { x: 2, y: 6 },
      ],
    },
    root: {
      branches: [
        {
          move: { x: 5, y: 4 },
          verdict: 'solved',
          feedback:
            'Correct. This move uses the wall’s outward influence to claim useful open-board development.',
        },
        {
          move: { x: 5, y: 5 },
          verdict: 'solved',
          feedback:
            'Correct. The strong wall lets Black play farther away with support.',
        },
      ],
    },
    hints: [
      {
        text: 'Look to the open side the wall faces.',
        showPoints: [
          { x: 5, y: 4 },
          { x: 5, y: 5 },
        ],
      },
    ],
  },
  {
    id: 'invasion-depth-01',
    title: 'Invade deeply enough to live',
    instruction:
      'Black to play. Enter White’s loose framework at the deeper point.',
    concept: 'invasion',
    tags: ['invasion', 'territory', 'life-death'],
    difficulty: 3,
    setup: {
      size: 9,
      toPlay: 'black',
      white: [
        { x: 6, y: 1 },
        { x: 8, y: 3 },
        { x: 6, y: 5 },
        { x: 8, y: 6 },
      ],
    },
    root: {
      branches: [
        {
          move: { x: 7, y: 3 },
          verdict: 'solved',
          feedback:
            'Correct. This is invasion depth: the new group enters the framework and must be prepared to live or escape.',
        },
      ],
    },
    hints: [
      {
        text: 'Choose the point inside the framework, not the point outside its boundary.',
        showPoints: [{ x: 7, y: 3 }],
      },
    ],
  },
  {
    id: 'reduction-depth-01',
    title: 'Reduce without becoming trapped',
    instruction:
      'Black to play. Shrink White’s framework from the outside.',
    concept: 'reduction',
    tags: ['reduction', 'influence', 'strategy'],
    difficulty: 3,
    setup: {
      size: 9,
      toPlay: 'black',
      white: [
        { x: 6, y: 1 },
        { x: 8, y: 3 },
        { x: 6, y: 5 },
        { x: 8, y: 6 },
      ],
    },
    root: {
      branches: [
        {
          move: { x: 5, y: 3 },
          verdict: 'solved',
          feedback:
            'Correct. The shallower move limits White while keeping Black connected to the rest of the board.',
        },
      ],
    },
    hints: [
      {
        text: 'Stay just outside the framework rather than diving into its center.',
        showPoints: [{ x: 5, y: 3 }],
      },
    ],
  },
  {
    id: 'sente-boundary-01',
    title: 'Keep the initiative',
    instruction:
      'Black to play. Extend against White’s edge boundary with the forcing move.',
    concept: 'sente-gote',
    tags: ['sente', 'endgame'],
    difficulty: 3,
    setup: {
      size: 7,
      toPlay: 'black',
      black: [
        { x: 1, y: 5 },
        { x: 2, y: 5 },
        { x: 3, y: 5 },
      ],
      white: [
        { x: 1, y: 6 },
        { x: 2, y: 6 },
        { x: 3, y: 6 },
      ],
    },
    root: {
      branches: [
        {
          move: { x: 4, y: 5 },
          verdict: 'solved',
          feedback:
            'Correct. This boundary extension is the kind of move to test for sente before settling for a quiet gote move.',
        },
      ],
    },
    hints: [
      {
        text: 'Continue the black boundary one step to the right.',
        showPoints: [{ x: 4, y: 5 }],
      },
    ],
  },
  {
    id: 'endgame-boundary-01',
    title: 'Take the two-way endgame move',
    instruction:
      'Black to play. Choose the point that expands Black while reducing White along the lower edge.',
    concept: 'endgame',
    tags: ['endgame', 'sente', 'territory'],
    difficulty: 3,
    setup: {
      size: 7,
      toPlay: 'black',
      black: [
        { x: 0, y: 4 },
        { x: 1, y: 4 },
        { x: 2, y: 4 },
      ],
      white: [
        { x: 0, y: 6 },
        { x: 1, y: 6 },
        { x: 2, y: 6 },
      ],
    },
    root: {
      branches: [
        {
          move: { x: 3, y: 5 },
          verdict: 'solved',
          feedback:
            'Correct. Strong endgame moves often enlarge your boundary and reduce the opponent’s at the same time.',
        },
      ],
    },
    hints: [
      {
        text: 'Look at the gap between the two lower boundaries.',
        showPoints: [{ x: 3, y: 5 }],
      },
    ],
  },
  {
    id: 'opening-corner-01',
    title: 'Develop a corner first',
    instruction:
      'Black to play on an empty 9×9 board. Choose any balanced near-corner opening point.',
    concept: 'opening',
    tags: ['opening', 'strategy'],
    difficulty: 2,
    setup: {
      size: 9,
      toPlay: 'black',
    },
    root: {
      branches: [
        {
          move: { x: 2, y: 2 },
          verdict: 'solved',
          feedback:
            'Good. Corner development uses the board edges efficiently.',
        },
        {
          move: { x: 6, y: 2 },
          verdict: 'solved',
          feedback:
            'Good. Corner development uses the board edges efficiently.',
        },
        {
          move: { x: 2, y: 6 },
          verdict: 'solved',
          feedback:
            'Good. Corner development uses the board edges efficiently.',
        },
        {
          move: { x: 6, y: 6 },
          verdict: 'solved',
          feedback:
            'Good. Corner development uses the board edges efficiently.',
        },
      ],
    },
    hints: [
      {
        text: 'Corners need fewer stones to sketch territory than the center.',
        showPoints: [
          { x: 2, y: 2 },
          { x: 6, y: 2 },
          { x: 2, y: 6 },
          { x: 6, y: 6 },
        ],
      },
    ],
  },
  {
    id: 'joseki-purpose-01',
    title: 'Choose a locally useful reply',
    instruction:
      'Black to play after White approaches the corner. Choose a simple local reply that develops shape instead of trying to capture immediately.',
    concept: 'joseki',
    tags: ['joseki', 'shape', 'opening'],
    difficulty: 3,
    setup: {
      size: 9,
      toPlay: 'black',
      black: [{ x: 2, y: 2 }],
      white: [{ x: 4, y: 2 }],
    },
    root: {
      branches: [
        {
          move: { x: 3, y: 3 },
          verdict: 'solved',
          feedback:
            'Good. The point is not to memorize this as a universal answer; it is to recognize a locally reasonable shape move and then judge the whole board.',
        },
      ],
    },
    hints: [
      {
        text: 'Look for a move that supports the corner stone and develops outward shape.',
        showPoints: [{ x: 3, y: 3 }],
      },
    ],
  },
];
