import type { GuidedGameScenario } from '../../guided';

export const firstGuidedGame: GuidedGameScenario = {
  id: 'first-guided-9x9',
  title: 'Your first 9×9 game',
  subtitle: 'A real game with the teacher still beside you.',
  boardSize: 9,
  komi: 6.5,
  assistanceLevel: 'guided',
  openingMessage:
    'You are Black. We will build one secure corner, notice a tactical opportunity, make a capture, then finish and count the board.',
  completionMessage:
    'Game complete. You built territory, captured a stone, passed when useful play was finished, and reached a real score.',
  turns: [
    {
      id: 'corner-wall-1',
      type: 'play',
      title: 'Start near a corner.',
      prompt:
        'Corners are easier to surround because two board edges already help form boundaries. Play the marked upper-side point.',
      acceptedMoves: [{ x: 2, y: 0 }],
      recommendedMoves: [{ x: 2, y: 0 }],
      help: {
        whatMatters:
          'You are beginning a boundary around the upper-left corner.',
        why:
          'In a corner, the board edge acts like part of the wall. You need fewer stones to surround useful space.',
        showPoints: [{ x: 2, y: 0 }],
        sequence: [
          { x: 2, y: 0 },
          { x: 2, y: 1 },
          { x: 2, y: 2 },
          { x: 1, y: 2 },
          { x: 0, y: 2 },
        ],
      },
      successText: 'Good start. You are building from the edge inward.',
      opponent: {
        type: 'play',
        point: { x: 6, y: 8 },
        explanation:
          'White begins the same idea in the opposite corner.',
      },
    },
    {
      id: 'corner-wall-2',
      type: 'play',
      title: 'Extend the wall.',
      prompt:
        'Continue downward. This makes your corner boundary harder to enter.',
      acceptedMoves: [{ x: 2, y: 1 }],
      recommendedMoves: [{ x: 2, y: 1 }],
      help: {
        whatMatters:
          'Keep the new stone connected to the first one.',
        why:
          'Connected stones share liberties and form a more reliable boundary than isolated stones.',
        showPoints: [{ x: 2, y: 1 }],
      },
      successText: 'Connected. Your boundary is taking shape.',
      opponent: {
        type: 'play',
        point: { x: 6, y: 7 },
      },
    },
    {
      id: 'corner-wall-3',
      type: 'play',
      title: 'Reach the turning point.',
      prompt:
        'Add one more connected stone before turning left along the side.',
      acceptedMoves: [{ x: 2, y: 2 }],
      recommendedMoves: [{ x: 2, y: 2 }],
      help: {
        whatMatters:
          'You are making an L-shaped enclosure.',
        why:
          'An enclosure needs a boundary that separates your inside space from the open center.',
        showPoints: [{ x: 2, y: 2 }],
      },
      successText: 'Now turn the boundary toward the left edge.',
      opponent: {
        type: 'play',
        point: { x: 6, y: 6 },
      },
    },
    {
      id: 'corner-wall-4',
      type: 'play',
      title: 'Close from the side.',
      prompt:
        'Play left of your last stone. One more move after this will seal the small corner area.',
      acceptedMoves: [{ x: 1, y: 2 }],
      recommendedMoves: [{ x: 1, y: 2 }],
      help: {
        whatMatters:
          'Your stones are separating the corner from the rest of the board.',
        why:
          'Territory is empty space surrounded only by your stones and the board edge.',
        showPoints: [{ x: 1, y: 2 }],
      },
      successText: 'Almost enclosed.',
      opponent: {
        type: 'play',
        point: { x: 7, y: 6 },
      },
    },
    {
      id: 'corner-wall-5',
      type: 'play',
      title: 'Seal the corner.',
      prompt:
        'Connect the wall to the left edge. The four empty intersections behind it will now be Black territory.',
      acceptedMoves: [{ x: 0, y: 2 }],
      recommendedMoves: [{ x: 0, y: 2 }],
      help: {
        whatMatters:
          'This move closes the only opening into the upper-left corner.',
        why:
          'Once the boundary is closed, the empty points behind it touch only Black stones or the board edge.',
        showPoints: [
          { x: 0, y: 2 },
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
        ],
      },
      successText: 'Enclosed. You have built your first clear territory.',
      opponent: {
        type: 'play',
        point: { x: 8, y: 6 },
        explanation:
          'White has completed a matching corner on the lower-right.',
      },
    },
    {
      id: 'tactical-net-1',
      type: 'play',
      title: 'Now watch the center.',
      prompt:
        'Start surrounding the central area from the left. This will set up a capture lesson inside the same real game.',
      acceptedMoves: [{ x: 3, y: 4 }],
      recommendedMoves: [{ x: 3, y: 4 }],
      help: {
        whatMatters:
          'You are creating pressure around the center without disconnecting your own stones.',
        why:
          'Captures happen by removing liberties. We will deliberately create that situation now.',
        showPoints: [{ x: 3, y: 4 }],
      },
      successText: 'Good. Watch where White replies.',
      opponent: {
        type: 'play',
        point: { x: 4, y: 4 },
        explanation:
          'White has entered the center. This stone still has several liberties.',
      },
    },
    {
      id: 'tactical-net-2',
      type: 'play',
      title: 'Reduce White’s liberties.',
      prompt:
        'Play above the white stone. Do not think about capture yet—just count what remains.',
      acceptedMoves: [{ x: 4, y: 3 }],
      recommendedMoves: [{ x: 4, y: 3 }],
      help: {
        whatMatters:
          'Each surrounding move removes one liberty from White.',
        why:
          'A group is only captured when all of its liberties are gone.',
        showPoints: [
          { x: 4, y: 3 },
          { x: 5, y: 4 },
          { x: 4, y: 5 },
        ],
      },
      successText: 'White has fewer ways to breathe.',
      opponent: {
        type: 'play',
        point: { x: 5, y: 6 },
      },
    },
    {
      id: 'tactical-net-3',
      type: 'play',
      title: 'One liberty will remain.',
      prompt:
        'Play to the right of the central white stone.',
      acceptedMoves: [{ x: 5, y: 4 }],
      recommendedMoves: [{ x: 5, y: 4 }],
      help: {
        whatMatters:
          'After this move, White will have only one liberty.',
        why:
          'That means the white stone will be in atari.',
        showPoints: [
          { x: 5, y: 4 },
          { x: 4, y: 5 },
        ],
        sequence: [
          { x: 5, y: 4 },
          { x: 4, y: 5 },
        ],
      },
      successText: 'Now White is in atari: one liberty remains.',
      opponent: {
        type: 'play',
        point: { x: 6, y: 5 },
      },
    },
    {
      id: 'capture',
      type: 'play',
      title: 'Take the final liberty.',
      prompt:
        'The central white stone has one liberty left. Capture it.',
      acceptedMoves: [{ x: 4, y: 5 }],
      recommendedMoves: [{ x: 4, y: 5 }],
      help: {
        whatMatters:
          'White has exactly one empty point directly beside it.',
        why:
          'Filling the final liberty removes the white stone from the board.',
        showPoints: [{ x: 4, y: 5 }],
        sequence: [{ x: 4, y: 5 }],
      },
      successText: 'Captured. You used the same liberty rule from the lessons inside a real game.',
      opponent: {
        type: 'play',
        point: { x: 5, y: 5 },
        explanation:
          'White strengthens the lower-right area. There is no immediate danger to your corner.',
      },
    },
    {
      id: 'finish',
      type: 'pass',
      title: 'Useful play is finished for this teaching game.',
      prompt:
        'The important areas in this short guided game are settled. Pass to say you are ready to count.',
      help: {
        whatMatters:
          'Passing is correct when you believe no useful move remains.',
        why:
          'One pass gives the opponent another turn. Two consecutive passes end normal play and move to scoring.',
      },
      successText: 'You passed. White will decide whether to continue.',
      opponent: {
        type: 'pass',
        explanation:
          'White passes too. Two consecutive passes finish the game.',
      },
    },
  ],
};
