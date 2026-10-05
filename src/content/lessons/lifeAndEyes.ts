import type { LessonDefinition } from '../../learning/runtime';

const eye = { x: 1, y: 1 } as const;
const eyeA = { x: 1, y: 1 } as const;
const eyeB = { x: 3, y: 1 } as const;

export const lifeAndEyesLesson: LessonDefinition = {
  id: 'foundation-life-eyes',
  title: 'How groups stay alive',
  concept: 'life-and-eyes',
  prerequisiteConcepts: ['territory'],
  initialBoard: {
    size: 5,
    black: [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ],
  },
  steps: [
    {
      id: 'find-eye',
      kind: 'identify-territory',
      title: 'This empty point is protected.',
      instruction:
        'Tap the empty point completely surrounded by this black group.',
      expectedPoints: [eye],
      enterEffects: [
        {
          type: 'highlight',
          points: [eye],
          kind: 'focus',
          pulse: true,
        },
      ],
      successText:
        'That enclosed point is called an eye when it is part of a group’s living shape.',
    },
    {
      id: 'one-eye',
      kind: 'continue',
      title: 'One eye is usually not enough.',
      instruction:
        'An opponent can often surround the outside of a one-eye group and eventually capture it. A secure group needs two separate eyes.',
      enterEffects: [
        {
          type: 'show-group',
          at: { x: 1, y: 0 },
          kind: 'focus',
        },
      ],
    },
    {
      id: 'two-eyes',
      kind: 'select-points',
      title: 'Find the two eyes.',
      instruction:
        'This larger black group has two separate protected empty points. Tap both.',
      board: {
        size: 5,
        black: [
          { x: 1, y: 0 },
          { x: 3, y: 0 },
          { x: 0, y: 1 },
          { x: 2, y: 1 },
          { x: 4, y: 1 },
          { x: 1, y: 2 },
          { x: 3, y: 2 },
          { x: 2, y: 2 },
        ],
      },
      expectedPoints: [eyeA, eyeB],
      successText: 'Two separate eyes. This is the basic shape of a living group.',
    },
    {
      id: 'why-live',
      kind: 'choose-answer',
      title: 'Why do two eyes matter?',
      instruction:
        'Why can an opponent not simply fill both eyes one after another?',
      choices: [
        {
          id: 'suicide',
          label: 'Playing inside an eye would have no liberty unless the group could be captured immediately',
        },
        {
          id: 'color',
          label: 'Black stones are stronger than white stones',
        },
        {
          id: 'rule',
          label: 'The rules forbid playing inside any territory',
        },
      ],
      correctChoiceId: 'suicide',
      successText:
        'Correct. Two separate eyes make a secure group impossible to capture by filling its last liberties.',
    },
  ],
};
