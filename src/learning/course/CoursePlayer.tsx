import {
  useMemo,
  useState,
} from 'react';

import { LessonPlayer } from '../player';
import {
  flattenCourseLessons,
  type CourseDefinition,
} from './types';
import { validateCourse } from './validation';
import './course-player.css';

export interface CoursePlayerProps {
  readonly course: CourseDefinition;
  readonly onExit?: () => void;
}

interface SavedCourseProgress {
  readonly nextLessonIndex: number;
}

function storageKey(course: CourseDefinition): string {
  return `thiepn-go:course:${course.id}:v1`;
}

function loadProgress(
  course: CourseDefinition,
  lessonCount: number,
): number {
  if (typeof window === 'undefined') return 0;

  try {
    const raw = window.localStorage.getItem(storageKey(course));
    if (!raw) return 0;

    const parsed = JSON.parse(raw) as Partial<SavedCourseProgress>;
    const value = parsed.nextLessonIndex;

    if (typeof value !== 'number' || !Number.isInteger(value)) {
      return 0;
    }

    return Math.min(Math.max(value, 0), lessonCount);
  } catch {
    return 0;
  }
}

function saveProgress(
  course: CourseDefinition,
  nextLessonIndex: number,
): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      storageKey(course),
      JSON.stringify({ nextLessonIndex } satisfies SavedCourseProgress),
    );
  } catch {
    // Learning must remain usable even if storage is unavailable.
  }
}

export function CoursePlayer({
  course,
  onExit,
}: CoursePlayerProps) {
  const lessons = useMemo(
    () => flattenCourseLessons(course),
    [course],
  );

  const validationIssues = useMemo(
    () => validateCourse(course),
    [course],
  );

  const [lessonIndex, setLessonIndex] = useState(() =>
    loadProgress(course, lessons.length),
  );

  if (validationIssues.length > 0) {
    throw new Error(
      `Invalid course "${course.id}": ${validationIssues
        .map((issue) => `${issue.path}: ${issue.message}`)
        .join('; ')}`,
    );
  }

  if (lessonIndex >= lessons.length) {
    return (
      <main className="course-complete-shell">
        <section className="course-complete" aria-labelledby="course-complete-title">
          <div className="course-complete__board" aria-hidden="true">
            <span className="course-complete__stone course-complete__stone--black" />
            <span className="course-complete__stone course-complete__stone--white" />
          </div>
          <p className="eyebrow">Foundation complete</p>
          <h1 id="course-complete-title">You can start playing Go.</h1>
          <p>
            You know the rules needed for a real game: liberties, capture,
            groups, territory, life, ko, passing, dead stones, and scoring.
            Your next step is a heavily guided 9×9 game.
          </p>
          <div className="course-complete__actions">
            {onExit && (
              <button className="secondary-action" type="button" onClick={onExit}>
                Back home
              </button>
            )}
            <button
              className="control-chip"
              type="button"
              onClick={() => {
                saveProgress(course, 0);
                setLessonIndex(0);
              }}
            >
              Review from the beginning
            </button>
          </div>
        </section>
      </main>
    );
  }

  const current = lessons[lessonIndex];
  return (
    <>
      <div className="course-context" aria-hidden="true">
        <span>{current.module.title}</span>
      </div>
      <LessonPlayer
        key={current.lesson.id}
        lesson={current.lesson}
        coursePosition={{
          current: lessonIndex + 1,
          total: lessons.length,
        }}
        onExit={onExit}
        onComplete={() => {
          const next = lessonIndex + 1;
          saveProgress(course, next);
          setLessonIndex(next);
        }}
      />
    </>
  );
}
