import type {
  KataGoGameScan,
} from '../analysis/types';
import type {
  MasterySnapshot,
} from '../mastery/types';
import type {
  SavedGameRecord,
} from '../play/types';
import type {
  ReviewFindingKind,
  ReviewSeverity,
} from '../review/types';

export type CoachConfidence =
  | 'low'
  | 'medium'
  | 'high';

export type CoachTurningPointSource =
  | 'deterministic'
  | 'engine'
  | 'combined';

export interface CoachTurningPoint {
  readonly id: string;
  readonly gameId: string;
  readonly playedAt: number;
  readonly moveNumber: number;
  readonly source: CoachTurningPointSource;
  readonly title: string;
  readonly explanation: string;
  readonly conceptId: string | null;
  readonly findingKind?: ReviewFindingKind;
  readonly severity?: ReviewSeverity;
  readonly scoreLoss: number | null;
  readonly importance: number;
}

export interface CoachFocus {
  readonly conceptId: string;
  readonly title: string;
  readonly confidence: CoachConfidence;
  readonly reason: string;
  readonly practiceTags: readonly string[];
  readonly currentMastery: number;
  readonly dueForReview: boolean;
  readonly recurringGameCount: number;
  readonly findingCount: number;
}

export interface CoachBaseline {
  readonly mastery: number;
  readonly signalPer20Moves: number | null;
  readonly findingCount: number;
  readonly learnerMoves: number;
}

export interface CoachPracticeSummary {
  readonly completedAt: number;
  readonly totalProblems: number;
  readonly cleanSolves: number;
  readonly repeatedProblems: number;
}

export interface CoachPlan {
  readonly id: string;
  readonly createdAt: number;
  readonly sourceGameIds: readonly string[];
  readonly focus: CoachFocus;
  readonly objective: string;
  readonly turningPoints: readonly CoachTurningPoint[];
  readonly baseline: CoachBaseline;
  readonly engineEnhanced: boolean;
  readonly practiceSummary?: CoachPracticeSummary;
  readonly archivedAt?: number;
}

export type CoachOutcomeStatus =
  | 'awaiting-game'
  | 'not-enough-play'
  | 'improved'
  | 'stable'
  | 'worse';

export interface CoachOutcome {
  readonly status: CoachOutcomeStatus;
  readonly followupGame: SavedGameRecord | null;
  readonly baselineSignalPer20Moves: number | null;
  readonly followupSignalPer20Moves: number | null;
  readonly baselineMastery: number;
  readonly currentMastery: number;
  readonly masteryDelta: number;
  readonly matchingFindings: number;
  readonly message: string;
}

export interface CoachPlanInput {
  readonly games: readonly SavedGameRecord[];
  readonly mastery: MasterySnapshot;
  readonly engineScans?: readonly KataGoGameScan[];
  readonly now?: number;
}
