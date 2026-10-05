export type MasteryEvidenceSource =
  | 'lesson'
  | 'practice'
  | 'guided-game'
  | 'review';

export interface ConceptDefinition {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly prerequisites: readonly string[];
  readonly practiceTags: readonly string[];
}

export interface MasteryEvidence {
  readonly id: string;
  readonly conceptId: string;
  readonly source: MasteryEvidenceSource;
  readonly sourceId: string;
  readonly outcome: number;
  readonly weight: number;
  readonly firstAttempt?: boolean;
  readonly hintsUsed?: number;
  readonly mistakes?: number;
  readonly responseMs?: number;
  readonly occurredAt: number;
}

export type MasteryState =
  | 'unknown'
  | 'learning'
  | 'established'
  | 'mastered';

export interface ConceptMastery {
  readonly concept: ConceptDefinition;
  readonly exposureCount: number;
  readonly evidenceCount: number;
  readonly sourceCount: number;
  readonly accuracy: number;
  readonly firstAttemptAccuracy: number | null;
  readonly hintRate: number;
  readonly averageResponseMs: number | null;
  readonly lastEvidenceAt: number | null;
  readonly retention: number;
  readonly confidence: number;
  readonly rawMastery: number;
  readonly mastery: number;
  readonly state: MasteryState;
  readonly dueForReview: boolean;
}

export interface MasterySnapshot {
  readonly generatedAt: number;
  readonly concepts: Readonly<Record<string, ConceptMastery>>;
  readonly overallMastery: number;
  readonly evidenceCount: number;
}

export interface MasteryRecommendation {
  readonly conceptId: string;
  readonly title: string;
  readonly reason: string;
  readonly practiceTags: readonly string[];
  readonly mastery: number;
  readonly dueForReview: boolean;
}
