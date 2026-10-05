import type { Point } from '../go/engine';

export type AssistanceLevel =
  | 'demonstrated'
  | 'guided'
  | 'assisted'
  | 'optional'
  | 'independent';

export interface AssistanceProfile {
  readonly level: AssistanceLevel;
  readonly proactivePrompt: boolean;
  readonly showWhatMatters: boolean;
  readonly showMe: boolean;
  readonly why: boolean;
  readonly sequence: boolean;
  readonly constrainMoves: boolean;
}

export interface GuidedHelp {
  readonly whatMatters: string;
  readonly why: string;
  readonly showPoints?: readonly Point[];
  readonly sequence?: readonly Point[];
}

export interface GuidedOpponentPlay {
  readonly type: 'play';
  readonly point: Point;
  readonly explanation?: string;
}

export interface GuidedOpponentPass {
  readonly type: 'pass';
  readonly explanation?: string;
}

export type GuidedOpponentAction =
  | GuidedOpponentPlay
  | GuidedOpponentPass;

export interface GuidedPlayTurn {
  readonly id: string;
  readonly type: 'play';
  readonly title: string;
  readonly prompt: string;
  readonly acceptedMoves: readonly Point[];
  readonly recommendedMoves?: readonly Point[];
  readonly help: GuidedHelp;
  readonly successText: string;
  readonly outsidePlanText?: string;
  readonly opponent: GuidedOpponentAction;
}

export interface GuidedPassTurn {
  readonly id: string;
  readonly type: 'pass';
  readonly title: string;
  readonly prompt: string;
  readonly help: GuidedHelp;
  readonly successText: string;
  readonly opponent: GuidedOpponentAction;
}

export type GuidedTurn = GuidedPlayTurn | GuidedPassTurn;

export interface GuidedGameScenario {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly boardSize: number;
  readonly komi: number;
  readonly assistanceLevel: AssistanceLevel;
  readonly masteryConcepts?: readonly string[];
  readonly openingMessage: string;
  readonly turns: readonly GuidedTurn[];
  readonly completionMessage: string;
}
