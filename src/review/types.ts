import type {
  GameState,
  MoveRecord,
  Point,
  Stone,
} from '../go/engine';
import type {
  SavedGameRecord,
} from '../play/types';

export type ReviewFindingKind =
  | 'missed-capture'
  | 'ignored-atari'
  | 'left-in-atari'
  | 'self-atari'
  | 'direct-cut'
  | 'pass-in-atari';

export type ReviewSeverity =
  | 'opportunity'
  | 'warning'
  | 'mistake';

export type ReviewConfidence =
  | 'medium'
  | 'high';

export interface ReviewFrame {
  readonly moveNumber: number;
  readonly move: MoveRecord;
  readonly before: GameState;
  readonly after: GameState;
}

export interface ReviewFinding {
  readonly id: string;
  readonly kind: ReviewFindingKind;
  readonly moveNumber: number;
  readonly player: Stone;
  readonly severity: ReviewSeverity;
  readonly confidence: ReviewConfidence;
  readonly conceptId: string;
  readonly practiceTags: readonly string[];
  readonly title: string;
  readonly summary: string;
  readonly explanation: string;
  readonly actualMove: Point | null;
  readonly highlightPoints: readonly Point[];
  readonly alternativePoints: readonly Point[];
  readonly masteryEligible: boolean;
}

export interface ReviewConceptSummary {
  readonly conceptId: string;
  readonly count: number;
  readonly mistakeCount: number;
  readonly warningCount: number;
  readonly opportunityCount: number;
}

export interface GameReview {
  readonly record: SavedGameRecord;
  readonly frames: readonly ReviewFrame[];
  readonly findings: readonly ReviewFinding[];
  readonly concepts: readonly ReviewConceptSummary[];
  readonly mistakeCount: number;
  readonly warningCount: number;
  readonly opportunityCount: number;
}
