import type { LessonDefinition } from '../../learning/runtime';

export const readinessLesson: LessonDefinition = {
  id: 'foundation-ready-for-9x9',
  title: 'Ready for your first game',
  concept: 'first-game-readiness',
  prerequisiteConcepts: ['scoring'],
  initialBoard: {
    size: 9,
    toPlay: 'black',
    black: [
      { x: 3, y: 4 },
      { x: 5, y: 4 },
      { x: 4, y: 3 },
    ],
    white: [{ x: 4, y: 4 }],
  },
  steps: [
    {
      id: 'larger-board',
      kind: 'continue',
      title: 'The board is bigger. The rules are the same.',
      instruction:
        'This is a 9×9 board—the size we will use for your first real game. Intersections, liberties, groups, capture, territory, and life all work exactly as before.',
    },
    {
      id: 'capture-check',
      kind: 'predict-move',
      title: 'Find the capture.',
      instruction:
        'White has one liberty. Tap the move Black should play to capture it.',
      acceptedPoints: [{ x: 4, y: 5 }],
      enterEffects: [
        {
          type: 'show-atari',
          groupAt: { x: 4, y: 4 },
        },
      ],
      hints: [
        {
          text: 'Find White’s single remaining liberty.',
          effects: [
            {
              type: 'show-liberties',
              of: { x: 4, y: 4 },
              pulse: true,
            },
          ],
        },
      ],
      successText: 'Correct. The larger board did not change the capture rule.',
    },
    {
      id: 'purpose-check',
      kind: 'choose-answer',
      title: 'What are you trying to do?',
      instruction:
        'Which description is closest to the goal of a normal Go game?',
      choices: [
        {
          id: 'area',
          label: 'Build and secure more controlled area than your opponent',
        },
        {
          id: 'capture-all',
          label: 'Capture every enemy stone',
        },
        {
          id: 'center',
          label: 'Reach the center first',
        },
      ],
      correctChoiceId: 'area',
      successText:
        'Right. Captures matter, but controlling enough area is what wins the game.',
    },
    {
      id: 'life-check',
      kind: 'choose-answer',
      title: 'What makes a group secure?',
      instruction:
        'Which shape is the basic sign that a group cannot be captured?',
      choices: [
        { id: 'two-eyes', label: 'Two separate secure eyes' },
        { id: 'one-stone', label: 'At least one stone in the center' },
        { id: 'long', label: 'A line of exactly five stones' },
      ],
      correctChoiceId: 'two-eyes',
      successText: 'Correct. Two secure eyes are the foundation of life.',
    },
    {
      id: 'ending-check',
      kind: 'choose-answer',
      title: 'How does normal play finish?',
      instruction:
        'What tells the app it is time to resolve dead stones and count the board?',
      choices: [
        { id: 'pass', label: 'Both players pass consecutively' },
        { id: 'capture', label: 'Someone makes a capture' },
        { id: 'timer', label: 'A fixed number of moves is reached' },
      ],
      correctChoiceId: 'pass',
      successText:
        'Exactly. You know enough rules to begin a guided 9×9 game.',
    },
    {
      id: 'ready',
      kind: 'continue',
      title: 'You can start playing Go.',
      instruction:
        'Your first 9×9 game will still guide you heavily. You do not need strategy yet—the next phase teaches you how to make sensible choices while you play.',
      successText: 'Foundation complete. You are ready for your first guided 9×9 game.',
    },
  ],
};
