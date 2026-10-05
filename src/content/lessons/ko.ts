import type { LessonDefinition } from '../../learning/runtime';

const capturePoint = { x: 2, y: 1 } as const;
const recapturePoint = { x: 2, y: 2 } as const;

export const koLesson: LessonDefinition = {
  id: 'foundation-ko',
  title: 'Why immediate repetition stops',
  concept: 'ko',
  prerequisiteConcepts: ['life-and-eyes'],
  initialBoard: {
    size: 5,
    toPlay: 'black',
    black: [
      { x: 1, y: 2 },
      { x: 3, y: 2 },
      { x: 2, y: 3 },
    ],
    white: [
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 3, y: 1 },
      { x: 2, y: 2 },
    ],
  },
  steps: [
    {
      id: 'capture-ko',
      kind: 'play-move',
      title: 'Capture the white stone.',
      instruction:
        'Black can capture the white stone in the center by taking its last liberty.',
      acceptedPoints: [capturePoint],
      enterEffects: [
        {
          type: 'highlight',
          points: [capturePoint],
          kind: 'warning',
          pulse: true,
        },
      ],
      successText:
        'Captured. But notice the new shape: White could seemingly capture straight back.',
    },
    {
      id: 'try-recapture',
      kind: 'try-illegal-move',
      title: 'Try to capture straight back.',
      instruction:
        'Tap the point where the captured white stone used to be. Watch what the rule does.',
      point: recapturePoint,
      expectedReason: 'ko',
      enterEffects: [
        {
          type: 'highlight',
          points: [recapturePoint],
          kind: 'warning',
          pulse: true,
        },
      ],
      successText:
        'Blocked by ko. An immediate recapture would recreate the board position from one move ago.',
    },
    {
      id: 'why-ko',
      kind: 'choose-answer',
      title: 'Ko prevents an endless loop.',
      instruction:
        'Why is White not allowed to recapture immediately?',
      choices: [
        {
          id: 'repeat',
          label: 'It would immediately recreate the previous board position',
        },
        {
          id: 'white',
          label: 'White is never allowed to recapture',
        },
        {
          id: 'center',
          label: 'Captures near the center are restricted',
        },
      ],
      correctChoiceId: 'repeat',
      successText:
        'Exactly. White must play somewhere else first. Later, the ko may be fought again.',
    },
    {
      id: 'ko-threat',
      kind: 'continue',
      title: 'Play elsewhere first.',
      instruction:
        'In real games, a player often makes an important move elsewhere—a ko threat—before trying to return to the ko.',
    },
  ],
};
