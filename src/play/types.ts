import type {
  AreaScore,
  GameState,
  MoveRecord,
  Point,
  Stone,
} from '../go/engine';
import type { AssistanceLevel } from '../guided';

export type IndependentBoardSize = 9 | 13 | 19;
export type PlayMode = 'computer' | 'local';
export type BotLevel = '25k' | '20k' | '15k';
export type ClockPreset = 'untimed' | '10m' | '20m';

export interface IndependentGameSettings {
  readonly mode: PlayMode;
  readonly boardSize: IndependentBoardSize;
  readonly humanColor: Stone;
  readonly botLevel: BotLevel;
  readonly handicap: number;
  readonly komi: number;
  readonly assistanceLevel: AssistanceLevel;
  readonly clock: ClockPreset;
}

export type IndependentGamePhase =
  | 'playing'
  | 'scoring'
  | 'complete';

export type IndependentGameResult =
  | {
      readonly type: 'score';
      readonly score: AreaScore;
    }
  | {
      readonly type: 'resign';
      readonly winner: Stone;
      readonly resignedBy: Stone;
    }
  | {
      readonly type: 'timeout';
      readonly winner: Stone;
      readonly timedOut: Stone;
    };

export interface IndependentGameState {
  readonly settings: IndependentGameSettings;
  readonly game: GameState;
  readonly phase: IndependentGamePhase;
  readonly deadStones: readonly Point[];
  readonly result: IndependentGameResult | null;
  readonly feedback: string | null;
  readonly illegalAttempts: number;
}

export interface SavedGameRecord {
  readonly id: string;
  readonly playedAt: number;
  readonly settings: IndependentGameSettings;
  readonly moves: readonly MoveRecord[];
  readonly result: IndependentGameResult;
  readonly captures: {
    readonly black: number;
    readonly white: number;
  };
}

export interface BotProfile {
  readonly id: BotLevel;
  readonly label: string;
  readonly description: string;
  readonly tacticalAwareness: number;
  readonly selfAtariPenalty: number;
  readonly connectionWeight: number;
  readonly localWeight: number;
  readonly noise: number;
}
