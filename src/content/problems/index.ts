export * from './beginnerProblems';
export * from './developingProblems';

import { beginnerProblems } from './beginnerProblems';
import { developingProblems } from './developingProblems';

export const allProblems = [
  ...beginnerProblems,
  ...developingProblems,
] as const;
