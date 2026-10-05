import type {
  CourseDefinition,
} from '../../learning';
import {
  attackDefenseLesson,
  capturingRaceLesson,
  cuttingLesson,
  endgameLesson,
  falseEyeLesson,
  influenceLesson,
  invasionLesson,
  josekiLesson,
  ladderLesson,
  netLesson,
  openingLesson,
  readingDepthLesson,
  reductionLesson,
  sekiLesson,
  senteGoteLesson,
  shapeLesson,
  snapbackLesson,
  vitalPointLesson,
  weakGroupsLesson,
} from '../lessons';

export const developingCourse: CourseDefinition = {
  id: 'developing-go',
  title: 'Develop your Go',
  description:
    'A board-first progression from tactical reading through life and death, shape, fighting, whole-board judgment, endgame, opening principles, and introductory joseki.',
  completion: {
    eyebrow: 'Developing course complete',
    title: 'You have the tools to study real games seriously.',
    description:
      'You have practiced the core tactical and strategic vocabulary used in developing play. Keep cycling through Coach, Practice, Play, Review, and Study so these ideas become reliable under game pressure.',
    actionLabel: 'Return to Coach',
  },
  modules: [
    {
      id: 'reading-and-capture',
      title: '1 · Read & capture',
      description:
        'Stop guessing. Read forcing replies, ladders, nets, snapback, and capturing races.',
      lessons: [
        readingDepthLesson,
        ladderLesson,
        netLesson,
        snapbackLesson,
        capturingRaceLesson,
      ],
    },
    {
      id: 'life-and-death',
      title: '2 · Life & death',
      description:
        'Go beyond “two eyes”: false eyes, vital points, and mutual life.',
      lessons: [
        falseEyeLesson,
        vitalPointLesson,
        sekiLesson,
      ],
    },
    {
      id: 'shape-and-fighting',
      title: '3 · Shape & fighting',
      description:
        'See cuts, build efficient shape, identify weak groups, and attack or defend with purpose.',
      lessons: [
        cuttingLesson,
        shapeLesson,
        weakGroupsLesson,
        attackDefenseLesson,
      ],
    },
    {
      id: 'whole-board-judgment',
      title: '4 · Whole-board judgment',
      description:
        'Learn influence, invasion versus reduction, initiative, and endgame priorities.',
      lessons: [
        influenceLesson,
        invasionLesson,
        reductionLesson,
        senteGoteLesson,
        endgameLesson,
      ],
    },
    {
      id: 'opening-direction',
      title: '5 · Opening & direction',
      description:
        'Use opening principles and introductory joseki without replacing judgment with memorization.',
      lessons: [
        openingLesson,
        josekiLesson,
      ],
    },
  ],
};
