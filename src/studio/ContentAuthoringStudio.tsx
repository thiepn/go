import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from 'react';

import { GoBoard } from '../board';
import type { Point, Stone } from '../go/engine';
import {
  LessonPlayer,
  type LessonDefinition,
  type LessonInteractionKind,
  type LessonStep,
} from '../learning';
import {
  ProblemPlayer,
  type ProblemDefinition,
  type ProblemDifficulty,
} from '../practice';
import {
  editSetupPoint,
  inspectAuthoringSource,
  lessonSummary,
  problemSummary,
  setupToBoard,
  templateSource,
  type AuthoringKind,
  type BoardTool,
} from './model';
import './studio.css';

const DRAFT_KEYS: Record<AuthoringKind, string> = {
  lesson: 'thiepn-go:studio:lesson-draft',
  problem: 'thiepn-go:studio:problem-draft',
};

type DeepMutable<T> =
  T extends readonly (infer U)[]
    ? DeepMutable<U>[]
    : T extends object
      ? { -readonly [K in keyof T]: DeepMutable<T[K]> }
      : T;

const LESSON_KINDS: readonly LessonInteractionKind[] = [
  'continue',
  'play-move',
  'try-illegal-move',
  'pass',
  'select-points',
  'select-stones',
  'select-group',
  'mark-liberties',
  'identify-territory',
  'choose-answer',
  'predict-move',
  'predict-sequence',
];

function loadDraft(kind: AuthoringKind): string {
  if (typeof window === 'undefined') {
    return templateSource(kind);
  }

  try {
    return (
      window.localStorage.getItem(DRAFT_KEYS[kind]) ??
      templateSource(kind)
    );
  } catch {
    return templateSource(kind);
  }
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function sanitizeId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function makeLessonStep(
  kind: LessonInteractionKind,
  previous?: LessonStep,
): LessonStep {
  const common = {
    id: previous?.id ?? 'new-step',
    title: previous?.title ?? 'New step',
    instruction:
      previous?.instruction ??
      'Tell the learner what to notice or do.',
    board: previous?.board,
    enterEffects: previous?.enterEffects,
    choreography: previous?.choreography ?? [],
    hints: previous?.hints ?? [],
    successText: previous?.successText ?? 'Good.',
  };

  switch (kind) {
    case 'continue':
      return { ...common, kind };
    case 'play-move':
      return {
        ...common,
        kind,
        acceptedPoints: [],
        wrongPointFeedback: {},
      };
    case 'try-illegal-move':
      return {
        ...common,
        kind,
        point: { x: 0, y: 0 },
        expectedReason: 'suicide',
        wrongPointFeedback: {},
      };
    case 'pass':
      return { ...common, kind };
    case 'select-points':
    case 'select-stones':
    case 'mark-liberties':
    case 'identify-territory':
      return {
        ...common,
        kind,
        expectedPoints: [],
        wrongPointFeedback: {},
      };
    case 'select-group':
      return {
        ...common,
        kind,
        expectedGroup: [],
        wrongPointFeedback: {},
      };
    case 'choose-answer':
      return {
        ...common,
        kind,
        choices: [
          { id: 'a', label: 'First answer' },
          { id: 'b', label: 'Second answer' },
        ],
        correctChoiceId: 'a',
        wrongChoiceFeedback: {},
      };
    case 'predict-move':
      return {
        ...common,
        kind,
        acceptedPoints: [],
        wrongPointFeedback: {},
      };
    case 'predict-sequence':
      return {
        ...common,
        kind,
        expectedSequence: [],
        wrongPointFeedback: {},
      };
  }
}

function supportsPointFeedback(
  step: LessonStep,
): step is Extract<
  LessonStep,
  {
    readonly kind:
      | 'play-move'
      | 'try-illegal-move'
      | 'select-points'
      | 'select-stones'
      | 'select-group'
      | 'mark-liberties'
      | 'identify-territory'
      | 'predict-move'
      | 'predict-sequence';
  }
> {
  return step.kind !== 'continue' &&
    step.kind !== 'pass' &&
    step.kind !== 'choose-answer';
}

function resizePoints(
  points: readonly Point[] | undefined,
  size: number,
): Point[] {
  return (points ?? []).filter(
    (point) =>
      point.x >= 0 &&
      point.y >= 0 &&
      point.x < size &&
      point.y < size,
  );
}

export interface ContentAuthoringStudioProps {
  readonly onExit?: () => void;
}

export function ContentAuthoringStudio({
  onExit,
}: ContentAuthoringStudioProps) {
  const [kind, setKind] = useState<AuthoringKind>('lesson');
  const [source, setSource] = useState(() => loadDraft('lesson'));
  const [boardTool, setBoardTool] = useState<BoardTool>('black');
  const [selectedStep, setSelectedStep] = useState(0);
  const [preview, setPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [misPoint, setMisPoint] = useState('');
  const [misText, setMisText] = useState('');

  const inspection = useMemo(
    () => inspectAuthoringSource(kind, source),
    [kind, source],
  );

  const lesson =
    kind === 'lesson'
      ? (inspection.value as LessonDefinition | null)
      : null;
  const problem =
    kind === 'problem'
      ? (inspection.value as ProblemDefinition | null)
      : null;

  const setup =
    kind === 'lesson'
      ? lesson?.initialBoard
      : problem?.setup;

  const board = useMemo(() => {
    if (!setup) return null;

    try {
      return setupToBoard(setup);
    } catch {
      return null;
    }
  }, [setup]);

  const activeStep =
    lesson?.steps?.[
      Math.min(
        selectedStep,
        Math.max(0, (lesson.steps?.length ?? 1) - 1),
      )
    ];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(DRAFT_KEYS[kind], source);
    } catch {
      // The studio stays usable even when local persistence is unavailable.
    }
  }, [kind, source]);

  useEffect(() => {
    if (!lesson?.steps?.length) {
      setSelectedStep(0);
      return;
    }

    if (selectedStep >= lesson.steps.length) {
      setSelectedStep(lesson.steps.length - 1);
    }
  }, [lesson?.steps?.length, selectedStep]);

  const commit = (next: unknown) => {
    setSource(JSON.stringify(next, null, 2));
  };

  const updateLesson = (
    updater: (draft: DeepMutable<LessonDefinition>) => void,
  ) => {
    if (!lesson) return;
    const draft = deepClone(
      lesson,
    ) as DeepMutable<LessonDefinition>;
    updater(draft);
    commit(draft);
  };

  const updateProblem = (
    updater: (draft: DeepMutable<ProblemDefinition>) => void,
  ) => {
    if (!problem) return;
    const draft = deepClone(
      problem,
    ) as DeepMutable<ProblemDefinition>;
    updater(draft);
    commit(draft);
  };

  const switchKind = (next: AuthoringKind) => {
    if (next === kind) return;
    setKind(next);
    setSource(loadDraft(next));
    setSelectedStep(0);
    setPreview(false);
    setCopied(false);
  };

  const updateSetup = (
    point: Point,
  ) => {
    if (!setup) return;

    if (kind === 'lesson' && lesson) {
      updateLesson((draft) => {
        draft.initialBoard = editSetupPoint(
          draft.initialBoard,
          point,
          boardTool,
        );
      });
      return;
    }

    if (problem) {
      updateProblem((draft) => {
        draft.setup = editSetupPoint(
          draft.setup,
          point,
          boardTool,
        );
      });
    }
  };

  const changeBoardSize = (size: number) => {
    if (kind === 'lesson' && lesson) {
      updateLesson((draft) => {
        draft.initialBoard = {
          ...draft.initialBoard,
          size,
          black: resizePoints(draft.initialBoard.black, size),
          white: resizePoints(draft.initialBoard.white, size),
        };
      });
      return;
    }

    if (problem) {
      updateProblem((draft) => {
        draft.setup = {
          ...draft.setup,
          size,
          black: resizePoints(draft.setup.black, size),
          white: resizePoints(draft.setup.white, size),
        };
      });
    }
  };

  const changeToPlay = (toPlay: Stone) => {
    if (kind === 'lesson' && lesson) {
      updateLesson((draft) => {
        draft.initialBoard = {
          ...draft.initialBoard,
          toPlay,
        };
      });
      return;
    }

    if (problem) {
      updateProblem((draft) => {
        draft.setup = {
          ...draft.setup,
          toPlay,
        };
      });
    }
  };

  const setLessonStepField = (
    field: 'id' | 'title' | 'instruction' | 'successText',
    value: string,
  ) => {
    updateLesson((draft) => {
      const step = draft.steps[selectedStep];
      if (!step) return;
      (step as unknown as Record<string, unknown>)[field] = value;
    });
  };

  const setLessonKind = (
    nextKind: LessonInteractionKind,
  ) => {
    updateLesson((draft) => {
      const current = draft.steps[selectedStep];
      if (!current) return;

      const steps = [...draft.steps];
      steps[selectedStep] = deepClone(
        makeLessonStep(nextKind, current as LessonStep),
      ) as DeepMutable<LessonStep>;
      draft.steps = steps;
    });
  };

  const addStep = () => {
    updateLesson((draft) => {
      const nextIndex = draft.steps.length + 1;
      draft.steps = [
        ...draft.steps,
        deepClone({
          ...makeLessonStep('continue'),
          id: `step-${nextIndex}`,
          title: `Step ${nextIndex}`,
        }) as DeepMutable<LessonStep>,
      ];
    });
    setSelectedStep(lesson?.steps.length ?? 0);
  };

  const duplicateStep = () => {
    if (!activeStep) return;

    updateLesson((draft) => {
      const copy = deepClone(draft.steps[selectedStep]);
      const steps = [...draft.steps];
      steps.splice(selectedStep + 1, 0, {
        ...copy,
        id: `${copy.id}-copy`,
      });
      draft.steps = steps;
    });
    setSelectedStep((value) => value + 1);
  };

  const removeStep = () => {
    if (!lesson || lesson.steps.length <= 1) return;

    updateLesson((draft) => {
      draft.steps = draft.steps.filter(
        (_, index) => index !== selectedStep,
      );
    });
    setSelectedStep((value) => Math.max(0, value - 1));
  };

  const moveStep = (direction: -1 | 1) => {
    if (!lesson) return;
    const nextIndex = selectedStep + direction;
    if (nextIndex < 0 || nextIndex >= lesson.steps.length) return;

    updateLesson((draft) => {
      const steps = [...draft.steps];
      const current = steps[selectedStep];
      const target = steps[nextIndex];
      if (!current || !target) return;
      steps[selectedStep] = target;
      steps[nextIndex] = current;
      draft.steps = steps;
    });
    setSelectedStep(nextIndex);
  };

  const addLessonHint = () => {
    updateLesson((draft) => {
      const step = draft.steps[selectedStep];
      if (!step) return;
      step.hints = [
        ...(step.hints ?? []),
        { text: 'New hint' },
      ];
    });
  };

  const updateLessonHint = (
    index: number,
    text: string,
  ) => {
    updateLesson((draft) => {
      const step = draft.steps[selectedStep];
      if (!step) return;
      const hints = [...(step.hints ?? [])];
      const hint = hints[index];
      if (!hint) return;
      hints[index] = { ...hint, text };
      step.hints = hints;
    });
  };

  const removeLessonHint = (index: number) => {
    updateLesson((draft) => {
      const step = draft.steps[selectedStep];
      if (!step) return;
      step.hints = (step.hints ?? []).filter(
        (_, hintIndex) => hintIndex !== index,
      );
    });
  };

  const addCue = () => {
    updateLesson((draft) => {
      const step = draft.steps[selectedStep];
      if (!step) return;
      step.choreography = [
        ...(step.choreography ?? []),
        {
          atMs: 500,
          effects: [],
        },
      ];
    });
  };

  const updateCueTime = (
    index: number,
    atMs: number,
  ) => {
    updateLesson((draft) => {
      const step = draft.steps[selectedStep];
      if (!step) return;
      const choreography = [...(step.choreography ?? [])];
      const cue = choreography[index];
      if (!cue) return;
      choreography[index] = {
        ...cue,
        atMs,
      };
      step.choreography = choreography;
    });
  };

  const removeCue = (index: number) => {
    updateLesson((draft) => {
      const step = draft.steps[selectedStep];
      if (!step) return;
      step.choreography = (step.choreography ?? []).filter(
        (_, cueIndex) => cueIndex !== index,
      );
    });
  };

  const addMisconception = () => {
    if (!activeStep || !supportsPointFeedback(activeStep)) return;
    if (!/^\d+\s*,\s*\d+$/.test(misPoint.trim())) return;
    if (!misText.trim()) return;

    updateLesson((draft) => {
      const step = draft.steps[selectedStep];
      if (!step || !supportsPointFeedback(step)) return;
      step.wrongPointFeedback = {
        ...(step.wrongPointFeedback ?? {}),
        [misPoint.replace(/\s+/g, '')]: misText.trim(),
      };
    });
    setMisPoint('');
    setMisText('');
  };

  const removeMisconception = (key: string) => {
    updateLesson((draft) => {
      const step = draft.steps[selectedStep];
      if (!step || !supportsPointFeedback(step)) return;
      const feedback = {
        ...(step.wrongPointFeedback ?? {}),
      };
      delete feedback[key];
      step.wrongPointFeedback = feedback;
    });
  };

  const addProblemHint = () => {
    updateProblem((draft) => {
      draft.hints = [
        ...(draft.hints ?? []),
        { text: 'New hint' },
      ];
    });
  };

  const updateProblemHint = (
    index: number,
    text: string,
  ) => {
    updateProblem((draft) => {
      const hints = [...(draft.hints ?? [])];
      const hint = hints[index];
      if (!hint) return;
      hints[index] = { ...hint, text };
      draft.hints = hints;
    });
  };

  const removeProblemHint = (index: number) => {
    updateProblem((draft) => {
      draft.hints = (draft.hints ?? []).filter(
        (_, hintIndex) => hintIndex !== index,
      );
    });
  };

  const addProblemBranch = () => {
    updateProblem((draft) => {
      draft.root.branches = [
        ...draft.root.branches,
        {
          move: { x: 0, y: 0 },
          verdict: 'solved',
          feedback: 'Correct.',
        },
      ];
    });
  };

  const updateRootBranch = (
    index: number,
    updater: (
      branch: DeepMutable<
        ProblemDefinition['root']['branches'][number]
      >,
    ) => DeepMutable<
      ProblemDefinition['root']['branches'][number]
    >,
  ) => {
    updateProblem((draft) => {
      const branches = [...draft.root.branches];
      const branch = branches[index];
      if (!branch) return;
      branches[index] = updater(branch);
      draft.root.branches = branches;
    });
  };

  const removeRootBranch = (index: number) => {
    updateProblem((draft) => {
      if (draft.root.branches.length <= 1) return;
      draft.root.branches = draft.root.branches.filter(
        (_, branchIndex) => branchIndex !== index,
      );
    });
  };

  const formatSource = () => {
    try {
      setSource(JSON.stringify(JSON.parse(source), null, 2));
    } catch {
      // Parse feedback already explains the issue.
    }
  };

  const copySource = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const downloadSource = () => {
    const value = inspection.value;
    if (!value) return;

    const id =
      'id' in value && typeof value.id === 'string'
        ? sanitizeId(value.id) || kind
        : kind;

    const blob = new Blob([source], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importFile = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        setSource(reader.result);
      }
    });
    reader.readAsText(file);
    event.target.value = '';
  };

  const resetDraft = () => {
    setSource(templateSource(kind));
    setSelectedStep(0);
    setPreview(false);
  };

  const valid =
    inspection.value !== null &&
    inspection.parseError === null &&
    inspection.issues.length === 0;

  if (preview && valid) {
    if (kind === 'lesson' && lesson) {
      return (
        <LessonPlayer
          key={source}
          lesson={lesson}
          onExit={() => setPreview(false)}
        />
      );
    }

    if (kind === 'problem' && problem) {
      return (
        <ProblemPlayer
          key={source}
          problem={problem}
          position={{ current: 1, total: 1 }}
          onExit={() => setPreview(false)}
          onSolved={() => setPreview(false)}
        />
      );
    }
  }

  const lessonStats = lesson ? lessonSummary(lesson) : null;
  const problemStats = problem ? problemSummary(problem) : null;

  return (
    <main className="studio-shell">
      <header className="studio-header">
        <div>
          <p className="eyebrow">Internal tool · P14</p>
          <h1>Content Authoring Studio</h1>
          <p>
            Build, validate, preview, and export lessons and tsumego
            without touching runtime code.
          </p>
        </div>
        <div className="studio-header__actions">
          <button
            type="button"
            className="secondary-action"
            onClick={onExit}
            disabled={!onExit}
          >
            Exit studio
          </button>
          <button
            type="button"
            className="primary-action studio-preview-action"
            disabled={!valid}
            onClick={() => setPreview(true)}
          >
            Preview in real runtime
          </button>
        </div>
      </header>

      <section className="studio-toolbar" aria-label="Authoring mode">
        <div className="studio-segment">
          {(['lesson', 'problem'] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={kind === item ? 'is-active' : ''}
              onClick={() => switchKind(item)}
            >
              {item === 'lesson' ? 'Lesson' : 'Practice problem'}
            </button>
          ))}
        </div>
        <div className="studio-toolbar__meta">
          {lessonStats && (
            <span>
              {lessonStats.steps} steps · {lessonStats.hints} hints ·{' '}
              {lessonStats.choreographyCues} timeline cues
            </span>
          )}
          {problemStats && (
            <span>
              {problemStats.nodes} nodes · {problemStats.branches} branches ·{' '}
              {problemStats.hints} hints
            </span>
          )}
          <strong className={valid ? 'is-valid' : 'is-invalid'}>
            {valid
              ? 'Valid'
              : inspection.parseError
                ? 'JSON error'
                : `${inspection.issues.length} validation issue${inspection.issues.length === 1 ? '' : 's'}`}
          </strong>
        </div>
      </section>

      <div className="studio-grid">
        <section className="studio-panel studio-panel--board">
          <div className="studio-panel__heading">
            <div>
              <p className="eyebrow">Board setup</p>
              <h2>Author the position visually</h2>
            </div>
            {setup && (
              <div className="studio-inline-controls">
                <select
                  aria-label="Board size"
                  value={setup.size}
                  onChange={(event) =>
                    changeBoardSize(Number(event.target.value))
                  }
                >
                  {[5, 7, 9, 13, 19].map((size) => (
                    <option key={size} value={size}>
                      {size}×{size}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Player to move"
                  value={setup.toPlay ?? 'black'}
                  onChange={(event) =>
                    changeToPlay(event.target.value as Stone)
                  }
                >
                  <option value="black">Black to play</option>
                  <option value="white">White to play</option>
                </select>
              </div>
            )}
          </div>

          <div className="studio-board-tools" aria-label="Board editing tool">
            {(['black', 'white', 'erase'] as const).map((tool) => (
              <button
                key={tool}
                type="button"
                className={boardTool === tool ? 'is-active' : ''}
                onClick={() => setBoardTool(tool)}
              >
                {tool === 'black'
                  ? '● Black'
                  : tool === 'white'
                    ? '○ White'
                    : 'Erase'}
              </button>
            ))}
          </div>

          <div className="studio-board">
            {board ? (
              <GoBoard
                board={board}
                interactive
                placementColor={
                  boardTool === 'white' ? 'white' : 'black'
                }
                showPlacementGhost={boardTool !== 'erase'}
                showCoordinates={board.size >= 13}
                label="Content authoring board setup"
                onIntersectionIntent={updateSetup}
              />
            ) : (
              <div className="studio-empty-state">
                Fix the draft shape before using the visual board editor.
              </div>
            )}
          </div>

          <p className="studio-help">
            Board edits write directly into the JSON draft and use the same
            coordinate model as the production Go engine.
          </p>
        </section>

        <section className="studio-panel studio-panel--structured">
          {kind === 'lesson' && lesson ? (
            <>
              <div className="studio-panel__heading">
                <div>
                  <p className="eyebrow">Lesson builder</p>
                  <h2>Metadata & steps</h2>
                </div>
              </div>

              <div className="studio-fields studio-fields--three">
                <label>
                  ID
                  <input
                    value={lesson.id}
                    onChange={(event) =>
                      updateLesson((draft) => {
                        draft.id = event.target.value;
                      })
                    }
                  />
                </label>
                <label>
                  Title
                  <input
                    value={lesson.title}
                    onChange={(event) =>
                      updateLesson((draft) => {
                        draft.title = event.target.value;
                      })
                    }
                  />
                </label>
                <label>
                  Concept
                  <input
                    value={lesson.concept}
                    onChange={(event) =>
                      updateLesson((draft) => {
                        draft.concept = event.target.value;
                      })
                    }
                  />
                </label>
              </div>

              <div className="studio-step-nav">
                <select
                  aria-label="Selected lesson step"
                  value={selectedStep}
                  onChange={(event) =>
                    setSelectedStep(Number(event.target.value))
                  }
                >
                  {lesson.steps.map((step, index) => (
                    <option key={`${step.id}-${index}`} value={index}>
                      {index + 1}. {step.title}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => moveStep(-1)}>
                  ↑
                </button>
                <button type="button" onClick={() => moveStep(1)}>
                  ↓
                </button>
                <button type="button" onClick={duplicateStep}>
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={removeStep}
                  disabled={lesson.steps.length <= 1}
                >
                  Remove
                </button>
                <button type="button" onClick={addStep}>
                  + Step
                </button>
              </div>

              {activeStep && (
                <>
                  <div className="studio-fields studio-fields--two">
                    <label>
                      Step ID
                      <input
                        value={activeStep.id}
                        onChange={(event) =>
                          setLessonStepField('id', event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Interaction
                      <select
                        value={activeStep.kind}
                        onChange={(event) =>
                          setLessonKind(
                            event.target.value as LessonInteractionKind,
                          )
                        }
                      >
                        {LESSON_KINDS.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Step title
                      <input
                        value={activeStep.title}
                        onChange={(event) =>
                          setLessonStepField('title', event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Success text
                      <input
                        value={activeStep.successText ?? ''}
                        onChange={(event) =>
                          setLessonStepField(
                            'successText',
                            event.target.value,
                          )
                        }
                      />
                    </label>
                  </div>

                  <label className="studio-full-field">
                    Instruction
                    <textarea
                      rows={3}
                      value={activeStep.instruction}
                      onChange={(event) =>
                        setLessonStepField(
                          'instruction',
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <div className="studio-subsection">
                    <div className="studio-subsection__heading">
                      <div>
                        <strong>Hint ladder</strong>
                        <span>Reveal help progressively.</span>
                      </div>
                      <button type="button" onClick={addLessonHint}>
                        + Hint
                      </button>
                    </div>
                    {(activeStep.hints ?? []).map((hint, index) => (
                      <div
                        className="studio-row-editor"
                        key={`hint-${index}`}
                      >
                        <span>{index + 1}</span>
                        <input
                          value={hint.text}
                          onChange={(event) =>
                            updateLessonHint(index, event.target.value)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeLessonHint(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="studio-subsection">
                    <div className="studio-subsection__heading">
                      <div>
                        <strong>Animation timeline</strong>
                        <span>
                          Cue timing is structured here; effects remain fully
                          editable in JSON.
                        </span>
                      </div>
                      <button type="button" onClick={addCue}>
                        + Cue
                      </button>
                    </div>
                    {(activeStep.choreography ?? []).map((cue, index) => (
                      <div
                        className="studio-row-editor"
                        key={`cue-${index}`}
                      >
                        <span>#{index + 1}</span>
                        <input
                          type="number"
                          min={0}
                          step={50}
                          value={cue.atMs}
                          onChange={(event) =>
                            updateCueTime(
                              index,
                              Number(event.target.value),
                            )
                          }
                        />
                        <small>
                          {cue.effects.length} effect
                          {cue.effects.length === 1 ? '' : 's'}
                        </small>
                        <button
                          type="button"
                          onClick={() => removeCue(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {supportsPointFeedback(activeStep) && (
                    <div className="studio-subsection">
                      <div className="studio-subsection__heading">
                        <div>
                          <strong>Misconception feedback</strong>
                          <span>
                            Map a wrong coordinate to an explanation.
                          </span>
                        </div>
                      </div>

                      {Object.entries(
                        activeStep.wrongPointFeedback ?? {},
                      ).map(([key, text]) => (
                        <div
                          className="studio-row-editor"
                          key={key}
                        >
                          <code>{key}</code>
                          <span>{text}</span>
                          <button
                            type="button"
                            onClick={() =>
                              removeMisconception(key)
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      <div className="studio-add-feedback">
                        <input
                          placeholder="x,y"
                          value={misPoint}
                          onChange={(event) =>
                            setMisPoint(event.target.value)
                          }
                        />
                        <input
                          placeholder="Explain the misconception"
                          value={misText}
                          onChange={(event) =>
                            setMisText(event.target.value)
                          }
                        />
                        <button
                          type="button"
                          onClick={addMisconception}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          ) : kind === 'problem' && problem ? (
            <>
              <div className="studio-panel__heading">
                <div>
                  <p className="eyebrow">Problem builder</p>
                  <h2>Metadata & solution tree</h2>
                </div>
              </div>

              <div className="studio-fields studio-fields--three">
                <label>
                  ID
                  <input
                    value={problem.id}
                    onChange={(event) =>
                      updateProblem((draft) => {
                        draft.id = event.target.value;
                      })
                    }
                  />
                </label>
                <label>
                  Title
                  <input
                    value={problem.title}
                    onChange={(event) =>
                      updateProblem((draft) => {
                        draft.title = event.target.value;
                      })
                    }
                  />
                </label>
                <label>
                  Concept
                  <input
                    value={problem.concept}
                    onChange={(event) =>
                      updateProblem((draft) => {
                        draft.concept = event.target.value;
                      })
                    }
                  />
                </label>
                <label>
                  Difficulty
                  <select
                    value={problem.difficulty}
                    onChange={(event) =>
                      updateProblem((draft) => {
                        draft.difficulty = Number(
                          event.target.value,
                        ) as ProblemDifficulty;
                      })
                    }
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="studio-span-two">
                  Tags
                  <input
                    value={problem.tags.join(', ')}
                    onChange={(event) =>
                      updateProblem((draft) => {
                        draft.tags = event.target.value
                          .split(',')
                          .map((tag) => tag.trim())
                          .filter(Boolean);
                      })
                    }
                  />
                </label>
              </div>

              <label className="studio-full-field">
                Instruction
                <textarea
                  rows={3}
                  value={problem.instruction}
                  onChange={(event) =>
                    updateProblem((draft) => {
                      draft.instruction = event.target.value;
                    })
                  }
                />
              </label>

              <div className="studio-subsection">
                <div className="studio-subsection__heading">
                  <div>
                    <strong>Root solution branches</strong>
                    <span>
                      Common first moves are editable here. Nested continuations
                      remain available in JSON.
                    </span>
                  </div>
                  <button type="button" onClick={addProblemBranch}>
                    + Branch
                  </button>
                </div>

                {problem.root.branches.map((branch, index) => (
                  <div
                    className="studio-branch"
                    key={`branch-${index}`}
                  >
                    <div className="studio-branch__move">
                      <span>Move</span>
                      <input
                        type="number"
                        min={0}
                        max={problem.setup.size - 1}
                        value={branch.move.x}
                        onChange={(event) =>
                          updateRootBranch(index, (current) => ({
                            ...current,
                            move: {
                              ...current.move,
                              x: Number(event.target.value),
                            },
                          }))
                        }
                      />
                      <input
                        type="number"
                        min={0}
                        max={problem.setup.size - 1}
                        value={branch.move.y}
                        onChange={(event) =>
                          updateRootBranch(index, (current) => ({
                            ...current,
                            move: {
                              ...current.move,
                              y: Number(event.target.value),
                            },
                          }))
                        }
                      />
                    </div>

                    <select
                      value={branch.verdict}
                      onChange={(event) =>
                        updateRootBranch(index, (current) => {
                          const verdict = event.target.value as
                            | 'continue'
                            | 'solved';

                          if (verdict === 'solved') {
                            const {
                              next: _next,
                              ...rest
                            } = current;
                            return {
                              ...rest,
                              verdict,
                            };
                          }

                          return {
                            ...current,
                            verdict,
                            next:
                              current.next ?? {
                                prompt: 'Read the reply.',
                                branches: [
                                  {
                                    move: { x: 0, y: 0 },
                                    verdict: 'solved',
                                    feedback: 'Correct.',
                                  },
                                ],
                              },
                          };
                        })
                      }
                    >
                      <option value="solved">Solved</option>
                      <option value="continue">Continue</option>
                    </select>

                    <input
                      className="studio-branch__feedback"
                      value={branch.feedback}
                      onChange={(event) =>
                        updateRootBranch(index, (current) => ({
                          ...current,
                          feedback: event.target.value,
                        }))
                      }
                    />

                    <button
                      type="button"
                      onClick={() => removeRootBranch(index)}
                      disabled={problem.root.branches.length <= 1}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="studio-subsection">
                <div className="studio-subsection__heading">
                  <div>
                    <strong>Hint ladder</strong>
                    <span>
                      Hint highlights can be added in JSON when needed.
                    </span>
                  </div>
                  <button type="button" onClick={addProblemHint}>
                    + Hint
                  </button>
                </div>
                {(problem.hints ?? []).map((hint, index) => (
                  <div
                    className="studio-row-editor"
                    key={`problem-hint-${index}`}
                  >
                    <span>{index + 1}</span>
                    <input
                      value={hint.text}
                      onChange={(event) =>
                        updateProblemHint(index, event.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeProblemHint(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="studio-empty-state">
              Fix the JSON structure before using structured controls.
            </div>
          )}
        </section>

        <section className="studio-panel studio-panel--source">
          <div className="studio-panel__heading">
            <div>
              <p className="eyebrow">Source</p>
              <h2>Canonical JSON draft</h2>
            </div>
            <div className="studio-source-actions">
              <button type="button" onClick={formatSource}>
                Format
              </button>
              <button type="button" onClick={copySource}>
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={downloadSource}
                disabled={!inspection.value}
              >
                Export
              </button>
              <label className="studio-file-action">
                Import
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={importFile}
                />
              </label>
              <button type="button" onClick={resetDraft}>
                Reset
              </button>
            </div>
          </div>

          <textarea
            className="studio-source"
            spellCheck={false}
            value={source}
            onChange={(event) => setSource(event.target.value)}
            aria-label="Content JSON source"
          />

          <div className="studio-validation">
            <div className="studio-validation__heading">
              <strong>Validation</strong>
              <span>
                Uses the same validators that gate production lesson and
                practice runtimes.
              </span>
            </div>

            {inspection.parseError ? (
              <div className="studio-issue">
                <code>JSON</code>
                <span>{inspection.parseError}</span>
              </div>
            ) : inspection.issues.length > 0 ? (
              inspection.issues.map((issue, index) => (
                <div
                  className="studio-issue"
                  key={`${issue.path}-${index}`}
                >
                  <code>{issue.path}</code>
                  <span>{issue.message}</span>
                </div>
              ))
            ) : (
              <div className="studio-valid-message">
                Ready to preview and export.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
