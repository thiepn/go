import type { Point, Stone } from '../go/engine';

export type KataGoColor = 'B' | 'W';

export interface KataGoQuery {
  readonly id: string;
  readonly initialStones?: readonly (readonly [KataGoColor, string])[];
  readonly initialPlayer?: KataGoColor;
  readonly moves: readonly (readonly [KataGoColor, string])[];
  readonly rules: string | Readonly<Record<string, unknown>>;
  readonly komi: number;
  readonly whiteHandicapBonus?: 0 | 'N' | 'N-1';
  readonly boardXSize: number;
  readonly boardYSize: number;
  readonly analyzeTurns?: readonly number[];
  readonly maxVisits?: number;
  readonly rootPolicyTemperature?: number;
  readonly rootFpuReductionMax?: number;
  readonly analysisPVLen?: number;
  readonly includeOwnership?: boolean;
  readonly includeOwnershipStdev?: boolean;
  readonly includeMovesOwnership?: boolean;
  readonly includeMovesOwnershipStdev?: boolean;
  readonly includePolicy?: boolean;
  readonly includePVVisits?: boolean;
  readonly includeNoResultValue?: boolean;
  readonly allowMoves?: readonly {
    readonly player: KataGoColor;
    readonly moves: readonly string[];
    readonly untilDepth: number;
  }[];
  readonly overrideSettings?: Readonly<Record<string, unknown>>;
}

export interface KataGoMoveInfoRaw {
  readonly move?: string;
  readonly order?: number;
  readonly visits?: number;
  readonly edgeVisits?: number;
  readonly winrate?: number;
  readonly scoreLead?: number;
  readonly scoreSelfplay?: number;
  readonly utility?: number;
  readonly prior?: number;
  readonly humanPrior?: number;
  readonly pv?: readonly string[];
  readonly pvVisits?: readonly number[];
  readonly ownership?: readonly number[];
  readonly [key: string]: unknown;
}

export interface KataGoRootInfoRaw {
  readonly currentPlayer?: KataGoColor;
  readonly visits?: number;
  readonly winrate?: number;
  readonly scoreLead?: number;
  readonly utility?: number;
  readonly rawWinrate?: number;
  readonly rawLead?: number;
  readonly humanStScoreError?: number;
  readonly [key: string]: unknown;
}

export interface KataGoResponseRaw {
  readonly id?: string;
  readonly turnNumber?: number;
  readonly isDuringSearch?: boolean;
  readonly moveInfos?: readonly KataGoMoveInfoRaw[];
  readonly rootInfo?: KataGoRootInfoRaw;
  readonly ownership?: readonly number[];
  readonly ownershipStdev?: readonly number[];
  readonly policy?: readonly number[];
  readonly humanPolicy?: readonly number[];
  readonly warning?: string;
  readonly error?: string;
  readonly field?: string;
  readonly [key: string]: unknown;
}

export interface KataGoCandidate {
  readonly point: Point | null;
  readonly coordinate: string;
  readonly order: number;
  readonly visits: number;
  readonly winrate: number | null;
  readonly scoreLead: number | null;
  readonly utility: number | null;
  readonly prior: number | null;
  readonly humanPrior: number | null;
  readonly pv: readonly (Point | null)[];
  readonly pvCoordinates: readonly string[];
}

export interface KataGoPositionAnalysis {
  readonly queryId: string;
  readonly turnNumber: number;
  readonly currentPlayer: Stone;
  readonly boardSize: number;
  readonly rootVisits: number;
  readonly rootWinrate: number | null;
  readonly rootScoreLead: number | null;
  readonly rootUtility: number | null;
  readonly candidates: readonly KataGoCandidate[];
  readonly ownership: readonly number[] | null;
  readonly policy: readonly number[] | null;
  readonly humanPolicy: readonly number[] | null;
  readonly humanProfile: string | null;
}

export type EngineMoveAssessment =
  | 'good'
  | 'small-loss'
  | 'mistake'
  | 'major-mistake'
  | 'unknown';

export interface KataGoMoveReview {
  readonly moveNumber: number;
  readonly actualPoint: Point | null;
  readonly actualCoordinate: string;
  readonly currentPlayer: Stone;
  readonly best: KataGoCandidate | null;
  readonly actual: KataGoCandidate | null;
  readonly scoreLoss: number | null;
  readonly winrateLoss: number | null;
  readonly assessment: EngineMoveAssessment;
  readonly position: KataGoPositionAnalysis;
}

export interface KataGoAnalysisOptions {
  readonly maxVisits?: number;
  readonly pvLength?: number;
  readonly includeOwnership?: boolean;
  readonly includePolicy?: boolean;
  readonly humanProfile?: string | null;
}

export interface KataGoProvider {
  analyze(
    query: KataGoQuery,
  ): Promise<readonly KataGoResponseRaw[]>;
}

export interface KataGoGameScan {
  readonly recordId: string;
  readonly moves: readonly KataGoMoveReview[];
  readonly missingPlayedMoves: readonly number[];
  readonly analyzedAt: number;
}
