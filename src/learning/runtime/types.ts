import type {
  BoardHighlightKind,
  BoardMarker,
  GhostStone,
  GroupHighlight,
} from '../../board';
import type { Point, Stone } from '../../go/engine';

export type LessonInteractionKind =
  | 'continue'
  | 'play-move'
  | 'select-points'
  | 'select-stones'
  | 'select-group'
  | 'mark-liberties'
  | 'identify-territory'
  | 'choose-answer'
  | 'predict-move'
  | 'predict-sequence';

export interface LessonBoardSetup {
  readonly size: number;
  readonly toPlay?: Stone;
  readonly black?: readonly Point[];
  readonly white?: readonly Point[];
}

export interface LessonHint {
  readonly text: string;
  readonly effects?: readonly LessonEffect[];
}

export interface LessonChoice {
  readonly id: string;
  readonly label: string;
}

export type LessonEffect =
  | {
      readonly type: 'highlight';
      readonly points: readonly Point[];
      readonly kind: BoardHighlightKind;
      readonly pulse?: boolean;
    }
  | {
      readonly type: 'group-highlight';
      readonly stones: readonly Point[];
      readonly kind?: 'focus' | 'warning' | 'success';
    }
  | {
      readonly type: 'marker';
      readonly marker: BoardMarker;
    }
  | {
      readonly type: 'ghost';
      readonly ghost: GhostStone;
    }
  | {
      readonly type: 'clear-presentation';
    };

export interface ChoreographyCue {
  readonly atMs: number;
  readonly effects: readonly LessonEffect[];
}

interface LessonStepBase {
  readonly id: string;
  readonly title: string;
  readonly instruction: string;
  readonly board?: LessonBoardSetup;
  readonly enterEffects?: readonly LessonEffect[];
  readonly choreography?: readonly ChoreographyCue[];
  readonly hints?: readonly LessonHint[];
  readonly successText?: string;
}

export interface ContinueStep extends LessonStepBase {
  readonly kind: 'continue';
}

export interface PlayMoveStep extends LessonStepBase {
  readonly kind: 'play-move';
  readonly acceptedPoints?: readonly Point[];
  readonly wrongPointFeedback?: Readonly<Record<string, string>>;
}

interface PointCollectionStepBase extends LessonStepBase {
  readonly expectedPoints: readonly Point[];
  readonly wrongPointFeedback?: Readonly<Record<string, string>>;
}

export interface SelectPointsStep extends PointCollectionStepBase {
  readonly kind: 'select-points';
}

export interface SelectStonesStep extends PointCollectionStepBase {
  readonly kind: 'select-stones';
}

export interface MarkLibertiesStep extends PointCollectionStepBase {
  readonly kind: 'mark-liberties';
}

export interface IdentifyTerritoryStep extends PointCollectionStepBase {
  readonly kind: 'identify-territory';
}

export interface SelectGroupStep extends LessonStepBase {
  readonly kind: 'select-group';
  readonly expectedGroup: readonly Point[];
  readonly wrongPointFeedback?: Readonly<Record<string, string>>;
}

export interface ChoiceStep extends LessonStepBase {
  readonly kind: 'choose-answer';
  readonly choices: readonly LessonChoice[];
  readonly correctChoiceId: string;
  readonly wrongChoiceFeedback?: Readonly<Record<string, string>>;
}

export interface PredictMoveStep extends LessonStepBase {
  readonly kind: 'predict-move';
  readonly acceptedPoints: readonly Point[];
  readonly wrongPointFeedback?: Readonly<Record<string, string>>;
}

export interface PredictSequenceStep extends LessonStepBase {
  readonly kind: 'predict-sequence';
  readonly expectedSequence: readonly Point[];
  readonly wrongPointFeedback?: Readonly<Record<string, string>>;
}

export type LessonStep =
  | ContinueStep
  | PlayMoveStep
  | SelectPointsStep
  | SelectStonesStep
  | SelectGroupStep
  | MarkLibertiesStep
  | IdentifyTerritoryStep
  | ChoiceStep
  | PredictMoveStep
  | PredictSequenceStep;

export interface LessonDefinition {
  readonly id: string;
  readonly title: string;
  readonly concept: string;
  readonly prerequisiteConcepts?: readonly string[];
  readonly initialBoard: LessonBoardSetup;
  readonly steps: readonly LessonStep[];
}

export interface LessonPresentation {
  readonly highlights: readonly {
    readonly point: Point;
    readonly kind: BoardHighlightKind;
    readonly pulse?: boolean;
  }[];
  readonly groupHighlights: readonly GroupHighlight[];
  readonly markers: readonly BoardMarker[];
  readonly ghostStone: GhostStone | null;
}
