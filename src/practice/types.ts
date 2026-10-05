import type { Point, Stone } from '../go/engine';

export type ProblemDifficulty = 1 | 2 | 3 | 4 | 5;

export interface ProblemSetup {
  readonly size: number;
  readonly toPlay: Stone;
  readonly black?: readonly Point[];
  readonly white?: readonly Point[];
}

export interface ProblemHint {
  readonly text: string;
  readonly showPoints?: readonly Point[];
}

export interface ProblemBranch {
  readonly move: Point;
  readonly verdict: 'continue' | 'solved';
  readonly feedback: string;
  readonly opponentMove?: Point;
  readonly next?: ProblemNode;
  readonly refutation?: readonly Point[];
}

export interface ProblemNode {
  readonly prompt?: string;
  readonly branches: readonly ProblemBranch[];
}

export interface ProblemDefinition {
  readonly id: string;
  readonly title: string;
  readonly instruction: string;
  readonly concept: string;
  readonly tags: readonly string[];
  readonly difficulty: ProblemDifficulty;
  readonly setup: ProblemSetup;
  readonly root: ProblemNode;
  readonly hints?: readonly ProblemHint[];
  readonly wrongMoveFeedback?: Readonly<Record<string, string>>;
}

export interface ProblemHistoryEntry {
  readonly problemId: string;
  readonly attempts: number;
  readonly successes: number;
  readonly failures: number;
  readonly firstTrySuccesses: number;
  readonly totalHintsUsed: number;
  readonly lastResult: 'success' | 'failure' | null;
  readonly lastAttemptAt: number | null;
}

export type ProblemHistory = Readonly<Record<string, ProblemHistoryEntry>>;

export interface PracticeQueueOptions {
  readonly tags?: readonly string[];
  readonly maxProblems?: number;
  readonly includeDifficulties?: readonly ProblemDifficulty[];
}
