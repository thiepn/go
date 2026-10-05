import { describe, expect, it } from 'vitest';

import type { SavedGameRecord } from '../play/types';
import { replayStudyPath } from '../study/replay';
import { savedGameToStudy } from './records';
import { serializeSgf } from './serializer';

describe('saved game SGF conversion', () => {
  it('preserves handicap setup, moves, passes and result metadata', () => {
    const record: SavedGameRecord = {
      id: 'g1',
      playedAt: Date.UTC(2026, 9, 5),
      settings: {
        mode: 'local',
        boardSize: 9,
        humanColor: 'black',
        botLevel: '25k',
        handicap: 2,
        komi: 0.5,
        assistanceLevel: 'independent',
        clock: 'untimed',
      },
      moves: [
        {
          type: 'play',
          player: 'white',
          point: { x: 4, y: 4 },
          captured: [],
        },
        {
          type: 'pass',
          player: 'black',
        },
      ],
      result: {
        type: 'resign',
        winner: 'white',
        resignedBy: 'black',
      },
      captures: {
        black: 0,
        white: 0,
      },
    };

    const study = savedGameToStudy(record);
    const final =
      study.root.children[0].children[0];
    const game = replayStudyPath(study, final.id);
    const sgf = serializeSgf(study);

    expect(study.root.setup?.black).toHaveLength(2);
    expect(study.root.setup?.toPlay).toBe('white');
    expect(game.moves).toHaveLength(2);
    expect(study.metadata.result).toBe('W+R');
    expect(sgf).toContain('RE[W+R]');
    expect(sgf).toContain('AB[');
    expect(sgf).toContain('W[ee]');
    expect(sgf).toContain('B[]');
  });
});
