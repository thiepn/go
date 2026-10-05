import type { LessonDefinition } from '../../learning/runtime';

export const interactionLabLesson: LessonDefinition = {
  id: 'internal-interaction-lab',
  title: 'Interaction lab',
  concept: 'internal-runtime-coverage',
  initialBoard: {
    size: 5,
    black: [
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
    white: [{ x: 3, y: 3 }],
  },
  steps: [
    {
      id: 'select-points',
      kind: 'select-points',
      title: 'Select points',
      instruction: 'Select two points.',
      expectedPoints: [
        { x: 0, y: 0 },
        { x: 4, y: 4 },
      ],
    },
    {
      id: 'select-stones',
      kind: 'select-stones',
      title: 'Select stones',
      instruction: 'Select both black stones.',
      expectedPoints: [
        { x: 1, y: 1 },
        { x: 1, y: 2 },
      ],
    },
    {
      id: 'select-group',
      kind: 'select-group',
      title: 'Select group',
      instruction: 'Select the connected black group.',
      expectedGroup: [
        { x: 1, y: 1 },
        { x: 1, y: 2 },
      ],
    },
    {
      id: 'territory',
      kind: 'identify-territory',
      title: 'Identify territory',
      instruction: 'Mark the target region.',
      expectedPoints: [
        { x: 2, y: 2 },
        { x: 2, y: 3 },
      ],
    },
    {
      id: 'predict',
      kind: 'predict-move',
      title: 'Predict move',
      instruction: 'Predict the marked move.',
      acceptedPoints: [{ x: 3, y: 2 }],
    },
    {
      id: 'sequence',
      kind: 'predict-sequence',
      title: 'Read sequence',
      instruction: 'Enter the sequence in order.',
      expectedSequence: [
        { x: 0, y: 4 },
        { x: 1, y: 4 },
        { x: 2, y: 4 },
      ],
    },
  ],
};
