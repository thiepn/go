import {
  useEffect,
  useMemo,
  useReducer,
} from 'react';

import {
  createLessonRuntime,
  reduceLesson,
  type LessonAction,
  type LessonRuntimeState,
} from './runtime';
import type { LessonDefinition } from './types';

export interface LessonRuntimeController {
  readonly state: LessonRuntimeState;
  readonly step: LessonDefinition['steps'][number] | undefined;
  readonly progress: number;
  readonly dispatch: (action: LessonAction) => void;
}

export function useLessonRuntime(
  lesson: LessonDefinition,
): LessonRuntimeController {
  const initialState = useMemo(
    () => createLessonRuntime(lesson),
    [lesson],
  );

  const [state, dispatch] = useReducer(
    (current: LessonRuntimeState, action: LessonAction) =>
      reduceLesson(lesson, current, action),
    initialState,
  );

  const step = lesson.steps[state.stepIndex];

  useEffect(() => {
    if (!step?.choreography || state.completed) {
      return undefined;
    }

    const timers = step.choreography.map((cue) =>
      window.setTimeout(() => {
        dispatch({
          type: 'apply-choreography',
          effects: cue.effects,
        });
      }, cue.atMs),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [state.stepIndex, state.completed, step]);

  return {
    state,
    step,
    progress:
      lesson.steps.length === 0
        ? 1
        : state.completed
          ? 1
          : state.stepIndex / lesson.steps.length,
    dispatch,
  };
}
