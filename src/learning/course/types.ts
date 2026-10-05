import type { LessonDefinition } from '../runtime';

export interface CourseModule {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly lessons: readonly LessonDefinition[];
}

export interface CourseCompletion {
  readonly eyebrow?: string;
  readonly title: string;
  readonly description: string;
  readonly actionLabel?: string;
}

export interface CourseDefinition {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly modules: readonly CourseModule[];
  readonly completion?: CourseCompletion;
}

export interface CourseLessonEntry {
  readonly lesson: LessonDefinition;
  readonly module: CourseModule;
  readonly globalIndex: number;
}

export function flattenCourseLessons(
  course: CourseDefinition,
): CourseLessonEntry[] {
  let globalIndex = 0;

  return course.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({
      lesson,
      module,
      globalIndex: globalIndex++,
    })),
  );
}
