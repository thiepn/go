import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  sanitizeQuery,
} from './analyze.js';

describe('KataGo public workload caps', () => {
  it('caps visits and PV length', () => {
    const before =
      process.env.KATAGO_MAX_VISITS;
    process.env.KATAGO_MAX_VISITS =
      '600';

    const result = sanitizeQuery({
      id: 'limits',
      moves: [],
      rules: 'chinese',
      komi: 6.5,
      boardXSize: 19,
      boardYSize: 19,
      maxVisits: 99_999,
      analysisPVLen: 99,
    });

    expect(result.maxVisits).toBe(
      600,
    );
    expect(result.analysisPVLen).toBe(
      20,
    );

    if (before === undefined) {
      delete process.env
        .KATAGO_MAX_VISITS;
    } else {
      process.env.KATAGO_MAX_VISITS =
        before;
    }
  });

  it('rejects unsupported board sizes and too many analysis turns', () => {
    expect(() =>
      sanitizeQuery({
        id: 'bad-board',
        moves: [],
        boardXSize: 20,
        boardYSize: 20,
      }),
    ).toThrow(
      'Invalid KataGo board or move payload.',
    );

    expect(() =>
      sanitizeQuery({
        id: 'too-many-turns',
        moves: Array.from(
          { length: 300 },
          () => ['B', 'pass'],
        ),
        boardXSize: 19,
        boardYSize: 19,
        analyzeTurns: Array.from(
          { length: 251 },
          (_, index) => index,
        ),
      }),
    ).toThrow(
      'Invalid analyzeTurns payload.',
    );
  });

  it('drops unapproved override settings', () => {
    const result = sanitizeQuery({
      id: 'overrides',
      moves: [],
      boardXSize: 9,
      boardYSize: 9,
      overrideSettings: {
        humanSLProfile: '20k',
        dangerousInternalOption: 1,
      },
    });

    expect(
      result.overrideSettings,
    ).toEqual({
      humanSLProfile: '20k',
    });
  });
});
