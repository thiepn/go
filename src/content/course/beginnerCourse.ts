import {
  atariAndCaptureLesson,
  deadStonesLesson,
  firstStoneLesson,
  groupsAndConnectionLesson,
  koLesson,
  lifeAndEyesLesson,
  passingAndEndingLesson,
  readinessLesson,
  safetyAndSuicideLesson,
  scoringLesson,
  territoryLesson,
  turnsAndLibertiesLesson,
} from '../lessons';
import type { CourseDefinition } from '../../learning';

export const beginnerCourse: CourseDefinition = {
  id: 'go-foundations',
  title: 'Learn Go from zero',
  description:
    'A complete interactive path from your first stone to readiness for a guided 9×9 game.',
  completion: {
    eyebrow: 'Foundation complete',
    title: 'You can start playing Go.',
    description:
      'You know the rules needed for a real game: liberties, capture, groups, territory, life, ko, passing, dead stones, and scoring. Your next step is a heavily guided 9×9 game.',
    actionLabel: 'Play your first 9×9 game',
  },
  modules: [
    {
      id: 'board-basics',
      title: '1 · Board basics',
      description:
        'Learn where stones go, how turns work, and why liberties matter.',
      lessons: [
        firstStoneLesson,
        turnsAndLibertiesLesson,
      ],
    },
    {
      id: 'capture-and-safety',
      title: '2 · Capture & safety',
      description:
        'Understand atari, capture, connected groups, escape, and illegal self-capture.',
      lessons: [
        atariAndCaptureLesson,
        groupsAndConnectionLesson,
        safetyAndSuicideLesson,
      ],
    },
    {
      id: 'space-and-life',
      title: '3 · Territory & life',
      description:
        'Learn what the game is trying to achieve, how groups live, and why ko exists.',
      lessons: [
        territoryLesson,
        lifeAndEyesLesson,
        koLesson,
      ],
    },
    {
      id: 'finish-the-game',
      title: '4 · Finish a game',
      description:
        'Learn passing, dead stones, scoring, and prove you are ready for 9×9.',
      lessons: [
        passingAndEndingLesson,
        deadStonesLesson,
        scoringLesson,
        readinessLesson,
      ],
    },
  ],
};
