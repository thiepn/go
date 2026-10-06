import { describe, expect, it } from 'vitest';

import {
  emptyGoSyncPayload,
  mergeGoSyncPayloads,
} from './sync';

describe('Go account sync merge', () => {
  it('never rolls course progress or first-game completion backward', () => {
    const remote = {
      ...emptyGoSyncPayload(),
      firstGameComplete: true,
      courses: {
        'go-foundations': {
          nextLessonIndex: 8,
        },
      },
    };
    const local = {
      ...emptyGoSyncPayload(),
      courses: {
        'go-foundations': {
          nextLessonIndex: 5,
        },
      },
    };

    const merged = mergeGoSyncPayloads(
      remote,
      local,
    );

    expect(
      merged.firstGameComplete,
    ).toBe(true);
    expect(
      merged.courses['go-foundations']
        .nextLessonIndex,
    ).toBe(8);
  });

  it('unions immutable mastery evidence by id', () => {
    const base = {
      id: 'evidence-1',
      conceptId: 'liberties',
      source: 'practice' as const,
      sourceId: 'p1',
      outcome: 1,
      weight: 1,
      occurredAt: 100,
    };

    const remote = {
      ...emptyGoSyncPayload(),
      masteryEvidence: [base],
    };
    const local = {
      ...emptyGoSyncPayload(),
      masteryEvidence: [
        {
          ...base,
          id: 'evidence-2',
          occurredAt: 200,
        },
      ],
    };

    const merged = mergeGoSyncPayloads(
      remote,
      local,
    );

    expect(
      merged.masteryEvidence.map(
        (item) => item.id,
      ),
    ).toEqual([
      'evidence-1',
      'evidence-2',
    ]);
  });

  it('keeps the newest study revision and all unique game records', () => {
    const remote = {
      ...emptyGoSyncPayload(),
      studies: [
        {
          id: 'study-1',
          title: 'Remote',
          metadata: {
            boardSize: 9,
            komi: 6.5,
          },
          root: {
            id: 'root',
            children: [],
          },
          createdAt: 1,
          updatedAt: 10,
        },
      ],
      gameRecords: [
        {
          id: 'game-1',
          playedAt: 10,
          settings: {
            mode: 'local' as const,
            boardSize: 9 as const,
            humanColor: 'black' as const,
            botLevel: '25k' as const,
            handicap: 0,
            komi: 6.5,
            assistanceLevel: 'independent' as const,
            clock: 'untimed' as const,
          },
          moves: [],
          result: {
            type: 'resign' as const,
            winner: 'black' as const,
            resignedBy: 'white' as const,
          },
          captures: {
            black: 0,
            white: 0,
          },
        },
      ],
    };

    const local = {
      ...emptyGoSyncPayload(),
      studies: [
        {
          ...remote.studies[0],
          title: 'Local',
          updatedAt: 20,
        },
      ],
      gameRecords: [
        {
          ...remote.gameRecords[0],
          id: 'game-2',
          playedAt: 20,
        },
      ],
    };

    const merged = mergeGoSyncPayloads(
      remote,
      local,
    );

    expect(merged.studies[0].title).toBe(
      'Local',
    );
    expect(
      merged.gameRecords.map(
        (item) => item.id,
      ),
    ).toEqual(['game-2', 'game-1']);
  });
});
