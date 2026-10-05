import type { LessonDefinition } from '../../learning/runtime';

const center = { x: 2, y: 2 } as const;

export const firstStoneLesson: LessonDefinition = {
  id: 'foundation-first-stone',
  title: 'Your first stone',
  concept: 'board-intersections',
  initialBoard: {
    size: 5,
    toPlay: 'black',
  },
  steps: [
    {
      id: 'meet-the-board',
      kind: 'continue',
      title: 'Lines cross here.',
      instruction:
        'Go is played on intersections—the points where a horizontal and vertical line meet. You do not place stones inside the squares.',
      enterEffects: [
        {
          type: 'highlight',
          points: [center],
          kind: 'focus',
          pulse: true,
        },
      ],
      choreography: [
        {
          atMs: 650,
          effects: [
            {
              type: 'ghost',
              ghost: {
                point: center,
                color: 'black',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'place-first-stone',
      kind: 'play-move',
      title: 'Place your first stone.',
      instruction:
        'Tap the softly marked intersection. Once a Go stone is placed, it stays there unless it is captured later.',
      acceptedPoints: [center],
      enterEffects: [
        {
          type: 'highlight',
          points: [center],
          kind: 'focus',
          pulse: true,
        },
      ],
      wrongPointFeedback: {
        '0,0': 'That is an intersection too, but use the marked center point for this first move.',
      },
      hints: [
        {
          text: 'Look for the softly pulsing point in the center.',
          effects: [
            {
              type: 'highlight',
              points: [center],
              kind: 'focus',
              pulse: true,
            },
          ],
        },
        {
          text: 'Place Black exactly on the center crossing.',
          effects: [
            {
              type: 'ghost',
              ghost: {
                point: center,
                color: 'black',
              },
            },
          ],
        },
      ],
      successText: 'Exactly. Stones sit on intersections.',
    },
    {
      id: 'notice-neighbors',
      kind: 'continue',
      title: 'A stone needs space.',
      instruction:
        'The empty intersections directly beside a stone matter. Diagonal points do not count. We will find the four that touch your stone.',
      enterEffects: [
        {
          type: 'show-group',
          at: center,
          kind: 'focus',
        },
      ],
    },
    {
      id: 'mark-liberties',
      kind: 'mark-liberties',
      title: 'Find its breathing space.',
      instruction:
        'Tap every empty intersection directly above, below, left, or right of the black stone.',
      expectedPoints: [
        { x: 2, y: 1 },
        { x: 1, y: 2 },
        { x: 3, y: 2 },
        { x: 2, y: 3 },
      ],
      wrongPointFeedback: {
        '1,1': 'That point is diagonal. Only points connected by a grid line touch the stone.',
        '3,1': 'That point is diagonal. Follow the grid lines directly out from the stone.',
        '1,3': 'That point is diagonal. Diagonal space does not count here.',
        '3,3': 'That point is diagonal. Look directly above, below, left, and right.',
      },
      hints: [
        {
          text: 'Follow the four grid lines coming directly out of the stone.',
          effects: [
            {
              type: 'show-liberties',
              of: center,
            },
          ],
        },
      ],
      successText: 'You found all four.',
    },
    {
      id: 'name-liberties',
      kind: 'choose-answer',
      title: 'Give that space a name.',
      instruction:
        'Those directly adjacent empty intersections are called the stone’s…',
      choices: [
        { id: 'liberties', label: 'Liberties' },
        { id: 'territory', label: 'Territory' },
        { id: 'turns', label: 'Turns' },
      ],
      correctChoiceId: 'liberties',
      wrongChoiceFeedback: {
        territory:
          'Territory is something different that we will learn later. These are the empty points touching a stone.',
        turns:
          'A turn is when a player acts. We are naming the empty points beside the stone.',
      },
      enterEffects: [
        {
          type: 'show-liberties',
          of: center,
        },
      ],
      successText:
        'Right. These are liberties—the breathing space that keeps a stone on the board.',
    },
  ],
};
