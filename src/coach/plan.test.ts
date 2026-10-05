import { describe, expect, it } from 'vitest';

import type {
  KataGoGameScan,
} from '../analysis/types';
import {
  buildMasterySnapshot,
} from '../mastery/model';
import {
  buildCoachPlan,
} from './plan';

describe('coach plan safety boundaries', () => {
  it('returns no plan when there is no mastery or game evidence', () => {
    const plan =
      buildCoachPlan({
        games: [],
        mastery:
          buildMasterySnapshot([]),
        now: 100,
      });

    expect(plan).toBeNull();
  });

  it('does not let engine-only score swings invent a concept diagnosis', () => {
    const scan: KataGoGameScan = {
      recordId: 'missing-game',
      moves: [],
      missingPlayedMoves: [],
      analyzedAt: 100,
    };

    const plan =
      buildCoachPlan({
        games: [],
        mastery:
          buildMasterySnapshot([]),
        engineScans: [scan],
        now: 100,
      });

    expect(plan).toBeNull();
  });
});
