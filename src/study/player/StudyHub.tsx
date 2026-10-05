import {
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  loadGameRecords,
  type SavedGameRecord,
} from '../../play';
import { parseSgfCollection } from '../../sgf/parser';
import { savedGameToStudy } from '../../sgf/records';
import {
  deleteStudyDocument,
  loadStudyDocuments,
  saveStudyDocument,
} from '../store';
import { createStudyDocument } from '../tree';
import type {
  StudyDocument,
} from '../types';
import { StudyWorkspace } from './StudyWorkspace';
import './study.css';

export interface StudyHubProps {
  readonly initialRecord?: SavedGameRecord | null;
  readonly onExit?: () => void;
}

export function StudyHub({
  initialRecord = null,
  onExit,
}: StudyHubProps) {
  const initialDocument = useMemo(
    () =>
      initialRecord
        ? savedGameToStudy(initialRecord)
        : null,
    [initialRecord],
  );

  const [active, setActive] =
    useState<StudyDocument | null>(
      initialDocument,
    );
  const [version, setVersion] = useState(0);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] =
    useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const studies = useMemo(
    () => loadStudyDocuments(),
    [version],
  );
  const games = useMemo(
    () => loadGameRecords().slice(0, 10),
    [version],
  );

  if (active) {
    return (
      <StudyWorkspace
        initialDocument={active}
        onChange={(document) => {
          setActive(document);
          setVersion((value) => value + 1);
        }}
        onExit={() => {
          saveStudyDocument(active);
          setActive(null);
          setVersion((value) => value + 1);
        }}
      />
    );
  }

  const importSource = (source: string) => {
    try {
      const documents =
        parseSgfCollection(source);

      for (const document of documents) {
        saveStudyDocument(document);
      }

      setImportError(null);
      setImportText('');
      setVersion((value) => value + 1);
      setActive(documents[0]);
    } catch (error) {
      setImportError(
        error instanceof Error
          ? error.message
          : 'The SGF could not be imported.',
      );
    }
  };

  const newStudy = (
    boardSize: 9 | 13 | 19,
  ) => {
    const document = createStudyDocument({
      title: `New ${boardSize}×${boardSize} study`,
      boardSize,
      komi: 6.5,
    });
    saveStudyDocument(document);
    setActive(document);
  };

  return (
    <main className="study-hub-shell">
      <section className="study-hub" aria-labelledby="study-hub-title">
        <header className="study-hub__header">
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
            <p className="eyebrow">Study</p>
            <h1 id="study-hub-title">Replay. Branch. Understand.</h1>
            <p>
              Reopen your own games, import SGF, or build a position from scratch.
              Every source uses the same variation workspace.
            </p>
          </div>
        </header>

        <section className="study-create-section">
          <div>
            <p className="eyebrow">New position</p>
            <h2>Start with an empty board</h2>
          </div>
          <div className="study-create-actions">
            {([9, 13, 19] as const).map((size) => (
              <button
                key={size}
                className="home-secondary-action"
                type="button"
                onClick={() => newStudy(size)}
              >
                {size}×{size}
              </button>
            ))}
          </div>
        </section>

        <section className="study-import-section">
          <div>
            <p className="eyebrow">SGF import</p>
            <h2>Paste or open an SGF file</h2>
          </div>

          <textarea
            value={importText}
            onChange={(event) =>
              setImportText(event.target.value)
            }
            placeholder="(;FF[4]GM[1]SZ[19];B[pd];W[dd]...)"
          />

          <div className="study-import-actions">
            <button
              className="primary-action"
              type="button"
              disabled={!importText.trim()}
              onClick={() => importSource(importText)}
            >
              Import pasted SGF
            </button>
            <button
              className="secondary-action"
              type="button"
              onClick={() => fileRef.current?.click()}
            >
              Open .sgf file
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".sgf,application/x-go-sgf,text/plain"
              hidden
              onChange={(event) => {
                const file =
                  event.target.files?.[0];
                if (!file) return;

                file
                  .text()
                  .then(importSource)
                  .catch(() =>
                    setImportError(
                      'The selected file could not be read.',
                    ),
                  );
              }}
            />
          </div>

          {importError && (
            <p className="study-import-error" role="alert">
              {importError}
            </p>
          )}
        </section>

        {games.length > 0 && (
          <section className="study-library-section">
            <div>
              <p className="eyebrow">Your games</p>
              <h2>Study a recent game</h2>
            </div>

            <div className="study-library-grid">
              {games.map((record) => (
                <button
                  key={record.id}
                  type="button"
                  className="study-library-card"
                  onClick={() =>
                    setActive(
                      savedGameToStudy(record),
                    )
                  }
                >
                  <strong>
                    {record.settings.boardSize}×{record.settings.boardSize}
                  </strong>
                  <span>
                    {record.settings.mode === 'computer'
                      ? `vs ${record.settings.botLevel}`
                      : 'Local game'}
                  </span>
                  <small>
                    {record.moves.length} moves ·{' '}
                    {new Date(record.playedAt).toLocaleDateString()}
                  </small>
                </button>
              ))}
            </div>
          </section>
        )}

        {studies.length > 0 && (
          <section className="study-library-section">
            <div>
              <p className="eyebrow">Saved studies</p>
              <h2>Continue where you left off</h2>
            </div>

            <div className="study-library-grid">
              {studies.map((document) => (
                <article
                  key={document.id}
                  className="study-library-card study-library-card--saved"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setActive(document)
                    }
                  >
                    <strong>{document.title}</strong>
                    <span>
                      {document.metadata.boardSize}×{document.metadata.boardSize}
                    </span>
                    <small>
                      Updated{' '}
                      {new Date(document.updatedAt).toLocaleDateString()}
                    </small>
                  </button>
                  <button
                    type="button"
                    className="study-delete-action"
                    aria-label={`Delete ${document.title}`}
                    onClick={() => {
                      deleteStudyDocument(document.id);
                      setVersion((value) => value + 1);
                    }}
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
