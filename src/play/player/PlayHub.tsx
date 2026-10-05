import { useMemo, useState } from 'react';

import {
  BOT_PROFILES,
} from '../bot';
import {
  loadGameRecords,
} from '../records';
import type {
  BotLevel,
  ClockPreset,
  IndependentBoardSize,
  IndependentGameSettings,
  PlayMode,
  SavedGameRecord,
} from '../types';
import { IndependentGamePlayer } from './IndependentGamePlayer';
import './play.css';

export interface PlayHubProps {
  readonly onExit?: () => void;
  readonly onStudyRecord?: (record: SavedGameRecord) => void;
  readonly onReviewRecord?: (record: SavedGameRecord) => void;
}

function resultLabel(
  record: ReturnType<typeof loadGameRecords>[number],
): string {
  if (record.result.type === 'score') {
    const winner = record.result.score.winner;
    if (winner === 'draw') return 'Draw';
    return `${winner === 'black' ? 'Black' : 'White'} +${record.result.score.margin}`;
  }

  const winner =
    record.result.winner === 'black'
      ? 'Black'
      : 'White';

  return record.result.type === 'resign'
    ? `${winner} · resignation`
    : `${winner} · time`;
}

export function PlayHub({
  onExit,
  onStudyRecord,
  onReviewRecord,
}: PlayHubProps) {
  const [activeSettings, setActiveSettings] =
    useState<IndependentGameSettings | null>(null);
  const [mode, setMode] = useState<PlayMode>('computer');
  const [boardSize, setBoardSize] =
    useState<IndependentBoardSize>(9);
  const [humanColor, setHumanColor] =
    useState<'black' | 'white'>('black');
  const [botLevel, setBotLevel] =
    useState<BotLevel>('25k');
  const [handicap, setHandicap] = useState(0);
  const [clock, setClock] =
    useState<ClockPreset>('untimed');
  const [coach, setCoach] =
    useState<'assisted' | 'optional' | 'independent'>('assisted');
  const [recordVersion, setRecordVersion] = useState(0);

  const recent = useMemo(
    () => loadGameRecords().slice(0, 5),
    [recordVersion],
  );

  if (activeSettings) {
    return (
      <IndependentGamePlayer
        settings={activeSettings}
        onExit={() => {
          setActiveSettings(null);
          setRecordVersion((value) => value + 1);
        }}
      />
    );
  }

  const start = () => {
    setActiveSettings({
      mode,
      boardSize,
      humanColor,
      botLevel,
      handicap,
      komi: 6.5,
      assistanceLevel: coach,
      clock,
    });
  };

  return (
    <main className="play-hub-shell">
      <section className="play-hub" aria-labelledby="play-hub-title">
        <header className="play-hub__header">
          <button
            className="lesson-icon-button"
            type="button"
            onClick={onExit}
            aria-label="Leave play"
            disabled={!onExit}
          >
            ×
          </button>
          <div>
            <p className="eyebrow">Play</p>
            <h1 id="play-hub-title">Play a real game.</h1>
            <p>
              Start on 9×9 if you are still learning. The rules are identical
              on larger boards; only the amount you need to read and plan changes.
            </p>
          </div>
        </header>

        <div className="play-setup">
          <section className="play-setting-card">
            <span className="play-setting-label">Opponent</span>
            <div className="segmented-control">
              <button
                type="button"
                className={mode === 'computer' ? 'is-active' : ''}
                onClick={() => setMode('computer')}
              >
                Computer
              </button>
              <button
                type="button"
                className={mode === 'local' ? 'is-active' : ''}
                onClick={() => setMode('local')}
              >
                Local
              </button>
            </div>
          </section>

          <section className="play-setting-card">
            <span className="play-setting-label">Board</span>
            <div className="segmented-control">
              {([9, 13, 19] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  className={boardSize === size ? 'is-active' : ''}
                  onClick={() => setBoardSize(size)}
                >
                  {size}×{size}
                </button>
              ))}
            </div>
            <small>
              {boardSize === 9
                ? 'Best for learning and shorter games.'
                : boardSize === 13
                  ? 'A bridge between beginner and full-board play.'
                  : 'The standard full Go board.'}
            </small>
          </section>

          {mode === 'computer' && (
            <>
              <section className="play-setting-card">
                <span className="play-setting-label">Your color</span>
                <div className="segmented-control">
                  <button
                    type="button"
                    className={humanColor === 'black' ? 'is-active' : ''}
                    onClick={() => setHumanColor('black')}
                  >
                    Black
                  </button>
                  <button
                    type="button"
                    className={humanColor === 'white' ? 'is-active' : ''}
                    onClick={() => setHumanColor('white')}
                  >
                    White
                  </button>
                </div>
              </section>

              <section className="play-setting-card play-setting-card--wide">
                <span className="play-setting-label">Computer level</span>
                <div className="bot-level-grid">
                  {(Object.keys(BOT_PROFILES) as BotLevel[]).map((level) => {
                    const profile = BOT_PROFILES[level];
                    return (
                      <button
                        key={level}
                        type="button"
                        className={botLevel === level ? 'is-active' : ''}
                        onClick={() => setBotLevel(level)}
                      >
                        <strong>{profile.label}</strong>
                        <small>{profile.description}</small>
                      </button>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          <section className="play-setting-card">
            <span className="play-setting-label">Handicap</span>
            <select
              value={handicap}
              onChange={(event) =>
                setHandicap(Number(event.target.value))
              }
            >
              <option value={0}>None</option>
              {[2, 3, 4, 5, 6, 7, 8, 9].map((count) => (
                <option key={count} value={count}>
                  {count} stones
                </option>
              ))}
            </select>
            <small>
              Fixed handicap stones use standard star-point placements.
              Komi becomes 0.5 when handicap stones are used.
            </small>
          </section>

          <section className="play-setting-card">
            <span className="play-setting-label">Clock</span>
            <select
              value={clock}
              onChange={(event) =>
                setClock(event.target.value as ClockPreset)
              }
            >
              <option value="untimed">Untimed</option>
              <option value="10m">10 minutes each</option>
              <option value="20m">20 minutes each</option>
            </select>
            <small>
              Beginner games default to untimed. These clocks use simple absolute time.
            </small>
          </section>

          <section className="play-setting-card">
            <span className="play-setting-label">Coach</span>
            <select
              value={coach}
              onChange={(event) =>
                setCoach(
                  event.target.value as
                    | 'assisted'
                    | 'optional'
                    | 'independent',
                )
              }
            >
              <option value="assisted">Assisted</option>
              <option value="optional">Hints only</option>
              <option value="independent">Off</option>
            </select>
            <small>
              Coaching can point out immediate tactical facts. It never restricts your moves.
            </small>
          </section>
        </div>

        <button
          className="primary-action play-start-action"
          type="button"
          onClick={start}
        >
          Start {boardSize}×{boardSize} game
        </button>

        {recent.length > 0 && (
          <section className="recent-games" aria-labelledby="recent-games-title">
            <div>
              <p className="eyebrow">Recent games</p>
              <h2 id="recent-games-title">Your last results</h2>
            </div>
            <div className="recent-games__list">
              {recent.map((record) => (
                <article key={record.id}>
                  <span>
                    {record.settings.boardSize}×{record.settings.boardSize}
                    {' · '}
                    {record.settings.mode === 'computer'
                      ? BOT_PROFILES[record.settings.botLevel].label
                      : 'Local'}
                  </span>
                  <strong>{resultLabel(record)}</strong>
                  <small>
                    {record.moves.length} moves ·{' '}
                    {new Date(record.playedAt).toLocaleDateString()}
                  </small>
                  {(onReviewRecord || onStudyRecord) && (
                    <div className="recent-game-actions">
                      {onReviewRecord && (
                        <button
                          className="recent-game-review"
                          type="button"
                          onClick={() => onReviewRecord(record)}
                        >
                          Review
                        </button>
                      )}
                      {onStudyRecord && (
                        <button
                          className="recent-game-study"
                          type="button"
                          onClick={() => onStudyRecord(record)}
                        >
                          Study
                        </button>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
