import type { LessonDefinition } from '../../learning/runtime';

const target = { x: 2, y: 2 } as const;
const lastLiberty = { x: 2, y: 3 } as const;

export const atariAndCaptureLesson: LessonDefinition = {
  id: 'foundation-atari-capture',
  title: 'Atari and capture',
  concept: 'capture',
  prerequisiteConcepts: ['turns-and-liberties'],
  initialBoard: {
    size: 5,
    toPlay: 'black',
    black: [
      { x: 1, y: 2 },
      { x: 3, y: 2 },
      { x: 2, y: 1 },
    ],
    white: [target],
  },
  steps: [
    {
      id: 'one-liberty',
      kind: 'continue',
      title: 'Only one breath remains.',
      instruction:
        'White has been surrounded on three sides. It has exactly one liberty left.',
      enterEffects: [
        {
          type: 'show-atari',
          groupAt: target,
        },
      ],
    },
    {
      id: 'name-atari',
      kind: 'choose-answer',
      title: 'This danger has a name.',
      instruction:
        'A stone or group with exactly one liberty is in…',
      choices: [
        { id: 'atari', label: 'Atari' },
        { id: 'territory', label: 'Territory' },
        { id: 'ko', label: 'Ko' },
      ],
      correctChoiceId: 'atari',
      enterEffects: [
        {
          type: 'show-atari',
          groupAt: target,
        },
      ],
      successText:
        'Correct. Atari means the group can be captured on the next move.',
    },
    {
      id: 'capture',
      kind: 'play-move',
      title: 'Take the final liberty.',
      instruction:
        'Play on White’s last liberty. Watch what happens when a group has no liberties left.',
      acceptedPoints: [lastLiberty],
      enterEffects: [
        {
          type: 'highlight',
          points: [lastLiberty],
          kind: 'warning',
          pulse: true,
        },
      ],
      hints: [
        {
          text: 'The only remaining liberty is directly below the white stone.',
          effects: [
            {
              type: 'ghost',
              ghost: {
                point: lastLiberty,
                color: 'black',
              },
            },
          ],
        },
      ],
      successText: 'Captured. A group with no liberties is removed from the board.',
    },
    {
      id: 'capture-reason',
      kind: 'choose-answer',
      title: 'Why did White disappear?',
      instruction:
        'Choose the reason the white stone was removed.',
      choices: [
        { id: 'surrounded', label: 'It had no liberties left' },
        { id: 'three-black', label: 'Three black stones touched it' },
        { id: 'center', label: 'It was near the center' },
      ],
      correctChoiceId: 'surrounded',
      wrongChoiceFeedback: {
        'three-black':
          'The number of nearby stones is not the rule. What matters is whether any liberties remain.',
        center: 'Board location does not cause capture. Liberties do.',
      },
      successText:
        'Exactly. Capture is about liberties, not a fixed number of surrounding stones.',
    },
  ],
};
