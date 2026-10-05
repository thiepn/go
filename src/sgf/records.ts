import {
  handicapPoints,
} from '../play/handicap';
import type {
  IndependentGameResult,
  SavedGameRecord,
} from '../play/types';
import {
  addStudyChild,
  createStudyDocument,
} from '../study/tree';
import type {
  StudyDocument,
} from '../study/types';

function resultToSgf(
  result: IndependentGameResult,
): string {
  if (result.type === 'score') {
    if (result.score.winner === 'draw') {
      return '0';
    }

    return `${result.score.winner === 'black' ? 'B' : 'W'}+${result.score.margin}`;
  }

  if (result.type === 'resign') {
    return `${result.winner === 'black' ? 'B' : 'W'}+R`;
  }

  return `${result.winner === 'black' ? 'B' : 'W'}+T`;
}

export function savedGameToStudy(
  record: SavedGameRecord,
): StudyDocument {
  const date = new Date(record.playedAt)
    .toISOString()
    .slice(0, 10);
  const handicap = handicapPoints(
    record.settings.boardSize,
    record.settings.handicap,
  );

  let document = createStudyDocument({
    title: `${record.settings.boardSize}×${record.settings.boardSize} game · ${date}`,
    boardSize: record.settings.boardSize,
    komi: record.settings.komi,
    now: record.playedAt,
    metadata: {
      boardSize: record.settings.boardSize,
      komi: record.settings.komi,
      result: resultToSgf(record.result),
      date,
      rules: 'Area',
      source: 'Independent play',
    },
    root: {
      id: `record-root-${record.id}`,
      setup:
        handicap.length >= 2
          ? {
              black: handicap,
              toPlay: 'white',
            }
          : undefined,
      children: [],
    },
  });

  let parentId = document.root.id;

  for (const [index, move] of record.moves.entries()) {
    const added = addStudyChild(
      document,
      parentId,
      {
        move: {
          color: move.player,
          point:
            move.type === 'play'
              ? move.point
              : null,
        },
        children: [],
        comment:
          move.type === 'play' &&
          move.captured.length > 0
            ? `${move.captured.length} ${move.captured.length === 1 ? 'stone' : 'stones'} captured.`
            : undefined,
        id: `record-${record.id}-move-${index + 1}`,
      },
      record.playedAt,
    );

    document = added.document;
    parentId = added.childId;
  }

  return {
    ...document,
    id: `study-record-${record.id}`,
  };
}
