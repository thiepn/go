import { validateLesson } from '../runtime';
import {
  flattenCourseLessons,
  type CourseDefinition,
} from './types';

export interface CourseValidationIssue {
  readonly path: string;
  readonly message: string;
}

export function validateCourse(
  course: CourseDefinition,
): CourseValidationIssue[] {
  const issues: CourseValidationIssue[] = [];
  const lessons = flattenCourseLessons(course);
  const lessonIds = new Set<string>();
  const learnedConcepts = new Set<string>();

  for (const entry of lessons) {
    const { lesson, globalIndex } = entry;

    if (lessonIds.has(lesson.id)) {
      issues.push({
        path: `lessons[${globalIndex}].id`,
        message: `Duplicate lesson ID "${lesson.id}".`,
      });
    }
    lessonIds.add(lesson.id);

    for (const prerequisite of lesson.prerequisiteConcepts ?? []) {
      if (!learnedConcepts.has(prerequisite)) {
        issues.push({
          path: `lessons[${globalIndex}].prerequisiteConcepts`,
          message: `Prerequisite "${prerequisite}" has not been taught earlier in the course.`,
        });
      }
    }

    for (const issue of validateLesson(lesson)) {
      issues.push({
        path: `lessons[${globalIndex}].${issue.path}`,
        message: issue.message,
      });
    }

    learnedConcepts.add(lesson.concept);
  }

  if (lessons.length === 0) {
    issues.push({
      path: 'modules',
      message: 'Course must contain at least one lesson.',
    });
  }

  return issues;
}
