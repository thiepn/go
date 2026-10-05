import { describe, expect, it } from 'vitest';

import {
  addStudyMoveVariation,
  editRootSetupPoint,
  toggleStudyMark,
} from './editor';
import { replayStudyPath } from './replay';
import { createStudyDocument } from './tree';

describe('study editor', () => {
  it('edits root setup without overlapping colors', () => {
    let study = createStudyDocument({
      boardSize: 9,
      now: 1,
    });

    study = editRootSetupPoint(
      study,
      { x: 2, y: 2 },
      'black',
      2,
    );
    study = editRootSetupPoint(
      study,
      { x: 2, y: 2 },
      'white',
      3,
    );

    expect(study.root.setup?.black).toEqual([]);
    expect(study.root.setup?.white).toEqual([
      { x: 2, y: 2 },
    ]);
  });

  it('adds legal branches and selects duplicate variations instead of duplicating them', () => {
    let study = createStudyDocument({
      boardSize: 9,
      now: 1,
    });

    const first = addStudyMoveVariation(
      study,
      study.root.id,
      { x: 2, y: 2 },
      2,
    );
    study = first.document;

    const duplicate = addStudyMoveVariation(
      study,
      study.root.id,
      { x: 2, y: 2 },
      3,
    );

    expect(duplicate.existing).toBe(true);
    expect(duplicate.document.root.children).toHaveLength(1);

    const second = addStudyMoveVariation(
      study,
      study.root.id,
      { x: 3, y: 3 },
      4,
    );

    expect(second.document.root.children).toHaveLength(2);
    expect(
      replayStudyPath(
        second.document,
        second.childId,
      ).board.intersections.filter(Boolean),
    ).toHaveLength(1);
  });

  it('toggles annotations on the selected node', () => {
    let study = createStudyDocument({
      boardSize: 9,
      now: 1,
    });

    study = toggleStudyMark(
      study,
      study.root.id,
      { x: 4, y: 4 },
      'triangle',
      2,
    );

    expect(study.root.marks).toHaveLength(1);

    study = toggleStudyMark(
      study,
      study.root.id,
      { x: 4, y: 4 },
      'triangle',
      3,
    );

    expect(study.root.marks).toEqual([]);
  });
});
