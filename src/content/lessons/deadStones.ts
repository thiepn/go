import type { LessonDefinition } from '../../learning/runtime';

export const deadStonesLesson: LessonDefinition = {
  id: 'foundation-dead-stones',
  title: 'Dead stones at the end',
  concept: 'dead-stones',
  prerequisiteConcepts: ['passing-and-ending'],
  initialBoard: {
    size: 5,
    black: [
      { x: 1, y: 1 },
      { x: 2, y: 0 },
      { x: 3, y: 1 },
      { x: 1, y: 2 },
      { x: 3, y: 2 },
      { x: 2, y: 3 },
    ],
    white: [{ x: 2, y: 2 }],
  },
  steps: [
    {
      id: 'find-dead-group',
      kind: 'select-group',
      title: 'Which group cannot survive?',
      instruction:
        'The white stone is trapped inside Black’s surrounding position and can be captured. Tap it.',
      expectedGroup: [{ x: 2, y: 2 }],
      enterEffects: [
        {
          type: 'show-atari',
          groupAt: { x: 2, y: 2 },
        },
      ],
      successText:
        'Right. This white stone is effectively dead because Black can capture it.',
    },
    {
      id: 'agreement',
      kind: 'continue',
      title: 'Dead stones are removed before counting.',
      instruction:
        'After both players pass, they agree which stones are dead and remove them before the final score is counted.',
    },
    {
      id: 'disagreement',
      kind: 'choose-answer',
      title: 'What if the players disagree?',
      instruction:
        'If one player believes a group is alive and the other believes it is dead, what is the safest beginner approach?',
      choices: [
        {
          id: 'resume',
          label: 'Resume play and prove whether the group can survive',
        },
        {
          id: 'guess',
          label: 'Let the computer guess automatically',
        },
        {
          id: 'coin',
          label: 'Flip a coin',
        },
      ],
      correctChoiceId: 'resume',
      successText:
        'Exactly. Playing the position out is clearer than hiding uncertainty behind automatic judgment.',
    },
  ],
};
