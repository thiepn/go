import {
  useMemo,
  useState,
} from 'react';

import {
  GoBoard,
  type BoardMarker,
} from '../../board';
import { coordinateLabel } from '../../board/model/geometry';
import type {
  Point,
  Stone,
} from '../../go/engine';
import { serializeSgf } from '../../sgf/serializer';
import {
  addStudyMoveVariation,
  editRootSetupPoint,
  setRootToPlay,
  setStudyLabel,
  toggleStudyMark,
} from '../editor';
import { studyMarksToBoardMarkers } from '../marks';
import {
  flattenStudyTree,
  nextMainNodeId,
  parentNodeId,
} from '../navigation';
import { replayStudyPath } from '../replay';
import { saveStudyDocument } from '../store';
import { updateStudyComment } from '../tree';
import type {
  StudyDocument,
  StudyMarkKind,
} from '../types';
import './study.css';

type WorkspaceMode =
  | 'replay'
  | 'variation'
  | 'setup-black'
  | 'setup-white'
  | 'setup-erase'
  | 'mark-triangle'
  | 'mark-square'
  | 'mark-circle'
  | 'mark-cross'
  | 'mark-label';

export interface StudyWorkspaceProps {
  readonly initialDocument: StudyDocument;
  readonly onExit?: () => void;
  readonly onChange?: (document: StudyDocument) => void;
}

function moveLabel(
  node: ReturnType<typeof flattenStudyTree>[number],
  boardSize: number,
): string {
  if (!node.node.move) {
    return node.depth === 0 ? 'Start' : 'Setup';
  }

  const color =
    node.node.move.color === 'black' ? 'B' : 'W';

  if (node.node.move.point === null) {
    return `${node.moveNumber}. ${color} pass`;
  }

  return `${node.moveNumber}. ${color} ${coordinateLabel(
    node.node.move.point,
    boardSize,
  )}`;
}

function modeMark(
  mode: WorkspaceMode,
): Exclude<StudyMarkKind, 'label'> | null {
  if (mode === 'mark-triangle') return 'triangle';
  if (mode === 'mark-square') return 'square';
  if (mode === 'mark-circle') return 'circle';
  if (mode === 'mark-cross') return 'cross';
  return null;
}

function downloadSgf(
  document: StudyDocument,
): void {
  const blob = new Blob(
    [serializeSgf(document)],
    { type: 'application/x-go-sgf;charset=utf-8' },
  );
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement('a');
  const safeTitle =
    document.title
      .trim()
      .replace(/[^a-z0-9-_]+/gi, '-')
      .replace(/^-+|-+$/g, '') ||
    'study';

  anchor.href = url;
  anchor.download = `${safeTitle}.sgf`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function StudyWorkspace({
  initialDocument,
  onExit,
  onChange,
}: StudyWorkspaceProps) {
  const [document, setDocument] =
    useState(initialDocument);
  const [selectedNodeId, setSelectedNodeId] =
    useState(initialDocument.root.id);
  const [mode, setMode] =
    useState<WorkspaceMode>('replay');
  const [status, setStatus] = useState<string | null>(null);

  const game = useMemo(
    () =>
      replayStudyPath(
        document,
        selectedNodeId,
      ),
    [document, selectedNodeId],
  );

  const flatTree = useMemo(
    () => flattenStudyTree(document.root),
    [document.root],
  );

  const selectedEntry = flatTree.find(
    (entry) => entry.node.id === selectedNodeId,
  );
  const selectedNode =
    selectedEntry?.node ?? document.root;

  const lastMove =
    selectedNode.move?.point ?? null;

  const boardMarkers: BoardMarker[] =
    studyMarksToBoardMarkers(
      selectedNode.marks,
    );

  const update = (
    next: StudyDocument,
    message?: string,
  ) => {
    setDocument(next);
    saveStudyDocument(next);
    onChange?.(next);
    setStatus(message ?? null);
  };

  const handlePoint = (point: Point) => {
    setStatus(null);

    try {
      if (mode === 'variation') {
        const result = addStudyMoveVariation(
          document,
          selectedNodeId,
          point,
        );

        update(
          result.document,
          result.existing
            ? 'Existing variation selected.'
            : 'Variation added.',
        );
        setSelectedNodeId(result.childId);
        return;
      }

      if (
        mode === 'setup-black' ||
        mode === 'setup-white' ||
        mode === 'setup-erase'
      ) {
        if (selectedNodeId !== document.root.id) {
          setSelectedNodeId(document.root.id);
        }

        update(
          editRootSetupPoint(
            document,
            point,
            mode === 'setup-black'
              ? 'black'
              : mode === 'setup-white'
                ? 'white'
                : 'erase',
          ),
          'Root position updated.',
        );
        return;
      }

      const mark = modeMark(mode);
      if (mark) {
        update(
          toggleStudyMark(
            document,
            selectedNodeId,
            point,
            mark,
          ),
          'Board mark updated.',
        );
        return;
      }

      if (mode === 'mark-label') {
        const label =
          window.prompt('Label for this point:', 'A');

        if (label !== null) {
          update(
            setStudyLabel(
              document,
              selectedNodeId,
              point,
              label,
            ),
            'Label updated.',
          );
        }
      }
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'That edit could not be applied.',
      );
    }
  };

  const goPrevious = () => {
    const previous = parentNodeId(
      document.root,
      selectedNodeId,
    );
    if (previous) setSelectedNodeId(previous);
  };

  const goNext = () => {
    const next = nextMainNodeId(
      document.root,
      selectedNodeId,
    );
    if (next) setSelectedNodeId(next);
  };

  const passVariation = () => {
    if (mode !== 'variation') return;

    try {
      const result = addStudyMoveVariation(
        document,
        selectedNodeId,
        null,
      );

      update(
        result.document,
        result.existing
          ? 'Existing pass variation selected.'
          : 'Pass variation added.',
      );
      setSelectedNodeId(result.childId);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Pass variation could not be added.',
      );
    }
  };

  const interactive =
    mode !== 'replay';

  const placementColor: Stone =
    mode === 'setup-white'
      ? 'white'
      : mode === 'setup-black'
        ? 'black'
        : game.toPlay;

  return (
    <main className="study-workspace-shell">
      <header className="study-workspace-header">
        <button
          className="lesson-icon-button"
          type="button"
          onClick={onExit}
          aria-label="Leave study"
          disabled={!onExit}
        >
          ×
        </button>

        <div>
          <span>Study</span>
          <strong>{document.title}</strong>
        </div>

        <div className="study-header-actions">
          <button
            type="button"
            className="control-chip"
            onClick={() => {
              navigator.clipboard
                ?.writeText(serializeSgf(document))
                .then(() => setStatus('SGF copied.'))
                .catch(() =>
                  setStatus('Clipboard access was unavailable.'),
                );
            }}
          >
            Copy SGF
          </button>
          <button
            type="button"
            className="control-chip"
            onClick={() => downloadSgf(document)}
          >
            Export
          </button>
        </div>
      </header>

      <section className="study-workspace-layout">
        <aside className="study-tools">
          <div className="study-mode-section">
            <span className="play-setting-label">Mode</span>
            <div className="study-mode-grid">
              <button
                type="button"
                className={mode === 'replay' ? 'is-active' : ''}
                onClick={() => setMode('replay')}
              >
                Replay
              </button>
              <button
                type="button"
                className={mode === 'variation' ? 'is-active' : ''}
                onClick={() => setMode('variation')}
              >
                Variation
              </button>
            </div>
          </div>

          <div className="study-mode-section">
            <span className="play-setting-label">Position editor</span>
            <div className="study-tool-row">
              <button
                type="button"
                className={mode === 'setup-black' ? 'is-active' : ''}
                onClick={() => {
                  setSelectedNodeId(document.root.id);
                  setMode('setup-black');
                }}
              >
                ● Black
              </button>
              <button
                type="button"
                className={mode === 'setup-white' ? 'is-active' : ''}
                onClick={() => {
                  setSelectedNodeId(document.root.id);
                  setMode('setup-white');
                }}
              >
                ○ White
              </button>
              <button
                type="button"
                className={mode === 'setup-erase' ? 'is-active' : ''}
                onClick={() => {
                  setSelectedNodeId(document.root.id);
                  setMode('setup-erase');
                }}
              >
                Erase
              </button>
            </div>

            <div className="study-to-play">
              <span>Next to play</span>
              <button
                type="button"
                className={
                  document.root.setup?.toPlay === 'black'
                    ? 'is-active'
                    : ''
                }
                onClick={() =>
                  update(
                    setRootToPlay(document, 'black'),
                    'Black set to play.',
                  )
                }
              >
                Black
              </button>
              <button
                type="button"
                className={
                  document.root.setup?.toPlay === 'white'
                    ? 'is-active'
                    : ''
                }
                onClick={() =>
                  update(
                    setRootToPlay(document, 'white'),
                    'White set to play.',
                  )
                }
              >
                White
              </button>
            </div>
          </div>

          <div className="study-mode-section">
            <span className="play-setting-label">Marks</span>
            <div className="study-tool-row">
              {([
                ['mark-triangle', '△'],
                ['mark-square', '□'],
                ['mark-circle', '○'],
                ['mark-cross', '×'],
                ['mark-label', 'A'],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={mode === id ? 'is-active' : ''}
                  onClick={() => setMode(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {mode === 'variation' && (
            <button
              className="secondary-action study-pass-action"
              type="button"
              onClick={passVariation}
            >
              Add pass
            </button>
          )}

          {status && (
            <p className="study-status" role="status">
              {status}
            </p>
          )}
        </aside>

        <div className="study-board-column">
          <div className="study-board-stage">
            <GoBoard
              board={game.board}
              label="Go study board"
              interactive={interactive}
              placementColor={placementColor}
              lastMove={lastMove}
              markers={boardMarkers}
              showCoordinates={document.metadata.boardSize >= 13}
              showPlacementGhost={
                mode === 'variation' ||
                mode === 'setup-black' ||
                mode === 'setup-white'
              }
              onIntersectionIntent={handlePoint}
            />
          </div>

          <div className="study-navigation">
            <button
              type="button"
              className="control-chip"
              onClick={() =>
                setSelectedNodeId(document.root.id)
              }
              disabled={selectedNodeId === document.root.id}
            >
              ⏮ Start
            </button>
            <button
              type="button"
              className="control-chip"
              onClick={goPrevious}
              disabled={
                !parentNodeId(document.root, selectedNodeId)
              }
            >
              ← Previous
            </button>
            <span>
              Move {selectedEntry?.moveNumber ?? 0}
            </span>
            <button
              type="button"
              className="control-chip"
              onClick={goNext}
              disabled={
                !nextMainNodeId(document.root, selectedNodeId)
              }
            >
              Next →
            </button>
          </div>
        </div>

        <aside className="study-inspector">
          <section className="study-tree-panel">
            <div className="study-panel-heading">
              <span className="play-setting-label">Game tree</span>
              <small>{flatTree.length} nodes</small>
            </div>

            <div className="study-tree-list">
              {flatTree.map((entry) => (
                <button
                  key={entry.node.id}
                  type="button"
                  className={[
                    entry.node.id === selectedNodeId
                      ? 'is-active'
                      : '',
                    entry.variationIndex > 0
                      ? 'is-variation'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{
                    paddingLeft: `${0.65 + Math.min(entry.depth, 8) * 0.72}rem`,
                  }}
                  onClick={() =>
                    setSelectedNodeId(entry.node.id)
                  }
                >
                  <span>{moveLabel(entry, document.metadata.boardSize)}</span>
                  {entry.node.comment && (
                    <small aria-label="Has comment">●</small>
                  )}
                  {entry.node.children.length > 1 && (
                    <em>
                      {entry.node.children.length} branches
                    </em>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="study-comment-panel">
            <span className="play-setting-label">Comment</span>
            <textarea
              value={selectedNode.comment ?? ''}
              placeholder="Write what you noticed, why a move matters, or what to review later…"
              onChange={(event) => {
                const next = updateStudyComment(
                  document,
                  selectedNodeId,
                  event.target.value,
                );
                setDocument(next);
                saveStudyDocument(next);
                onChange?.(next);
              }}
            />
          </section>

          <section className="study-position-meta">
            <span>
              To play: <strong>{game.toPlay === 'black' ? 'Black' : 'White'}</strong>
            </span>
            <span>
              Captures: <strong>{game.captures.black}–{game.captures.white}</strong>
            </span>
            <span>
              Variations: <strong>{selectedNode.children.length}</strong>
            </span>
          </section>
        </aside>
      </section>
    </main>
  );
}
