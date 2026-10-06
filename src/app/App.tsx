import {
  lazy,
  Suspense,
  useEffect,
  useState,
} from 'react';

import {
  AccountPanel,
  FIRST_GAME_COMPLETE_KEY,
  useAccount,
} from '../account';
import {
  allProblems,
  beginnerCourse,
  beginnerProblems,
  developingCourse,
  developingProblems,
  firstGuidedGame,
} from '../content';
import { CoachHub } from '../coach/player';
import { markCoachPracticeComplete } from '../coach/store';
import { GuidedGamePlayer } from '../guided';
import {
  CoursePlayer,
  type CourseDefinition,
} from '../learning';
import { MasteryDashboard } from '../mastery/player';
import { resolveConceptIds } from '../mastery/graph';
import {
  loadMasteryEvidence,
  recordMasteryEvidence,
} from '../mastery/store';
import { PlayHub } from '../play/player';
import type { SavedGameRecord } from '../play/types';
import { StudyHub } from '../study/player';
import { ReviewHub } from '../review/player';
import { PracticeHub } from '../practice';
import {
  PlatformSettings,
  readJson,
  writeJson,
} from '../platform';

const ContentAuthoringStudio = lazy(
  () =>
    import('../studio').then((module) => ({
      default: module.ContentAuthoringStudio,
    })),
);

type AppMode =
  | 'home'
  | 'course'
  | 'guided-game'
  | 'practice'
  | 'progress'
  | 'play'
  | 'study'
  | 'review'
  | 'coach'
  | 'settings'
  | 'account';

function hasFirstGameComplete(): boolean {
  return readJson(
    FIRST_GAME_COMPLETE_KEY,
    () => false,
    (value): value is boolean =>
      typeof value === 'boolean',
  );
}

function markFirstGameComplete(): void {
  writeJson(
    FIRST_GAME_COMPLETE_KEY,
    true,
  );
}

export function App() {
  const account = useAccount();
  const [mode, setMode] = useState<AppMode>('home');
  const [studioOpen, setStudioOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('studio') === '1';
  });
  const [activeCourse, setActiveCourse] =
    useState<CourseDefinition>(beginnerCourse);
  const [practiceUnlocked, setPracticeUnlocked] = useState(
    () => hasFirstGameComplete(),
  );
  const [practiceFocus, setPracticeFocus] =
    useState<readonly string[]>([]);
  const [studyRecord, setStudyRecord] =
    useState<SavedGameRecord | null>(null);
  const [reviewRecord, setReviewRecord] =
    useState<SavedGameRecord | null>(null);
  const [coachPracticePlanId, setCoachPracticePlanId] =
    useState<string | null>(null);
  const [coachPlayPlanId, setCoachPlayPlanId] =
    useState<string | null>(null);
  const [coachObjective, setCoachObjective] =
    useState<string | null>(null);
  const [reviewReturnToCoach, setReviewReturnToCoach] =
    useState(false);

  useEffect(() => {
    const refreshUnlock = () => {
      setPracticeUnlocked(
        hasFirstGameComplete(),
      );
    };

    window.addEventListener(
      'thiepn-go:storage-write',
      refreshUnlock,
    );

    return () => {
      window.removeEventListener(
        'thiepn-go:storage-write',
        refreshUnlock,
      );
    };
  }, []);

  if (studioOpen) {
    return (
      <Suspense
        fallback={
          <main className="app-shell" aria-live="polite">
            <p>Loading authoring studio…</p>
          </main>
        }
      >
        <ContentAuthoringStudio
          onExit={() => {
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href);
              url.searchParams.delete('studio');
              window.history.replaceState(
                window.history.state,
                '',
                url,
              );
            }

            setStudioOpen(false);
          }}
        />
      </Suspense>
    );
  }

  if (mode === 'settings') {
    return (
      <PlatformSettings
        onExit={() => setMode('home')}
      />
    );
  }

  if (mode === 'account') {
    return (
      <AccountPanel
        onExit={() => setMode('home')}
      />
    );
  }

  const evidencedConcepts = new Set(
    loadMasteryEvidence().map(
      (event) => event.conceptId,
    ),
  );
  const unlockedDevelopingProblems =
    developingProblems.filter(
      (problem) =>
        resolveConceptIds(
          problem.concept,
        ).some(
          (conceptId) =>
            evidencedConcepts.has(
              conceptId,
            ),
        ),
    );
  const practiceProblems = [
    ...beginnerProblems,
    ...unlockedDevelopingProblems,
  ];

  if (mode === 'course') {
    return (
      <CoursePlayer
        course={activeCourse}
        onExit={() => setMode('home')}
        onReadyForGame={
          activeCourse.id === beginnerCourse.id
            ? () => setMode('guided-game')
            : undefined
        }
        onCompletionAction={
          activeCourse.id === developingCourse.id
            ? () => setMode('coach')
            : undefined
        }
      />
    );
  }

  if (mode === 'guided-game') {
    return (
      <GuidedGamePlayer
        scenario={firstGuidedGame}
        onExit={() => setMode('home')}
        onComplete={(result) => {
          const now = Date.now();
          const conceptCount = Math.max(
            1,
            result.masteryConcepts.length,
          );

          for (const concept of result.masteryConcepts) {
            recordMasteryEvidence({
              source: 'guided-game',
              sourceId: result.scenarioId,
              sourceConcept: concept,
              success: true,
              firstAttempt:
                result.mistakes === 0 &&
                result.helpUses === 0,
              mistakes: result.mistakes,
              hintsUsed: result.helpUses,
              responseMs:
                result.responseMs / conceptCount,
              occurredAt: now,
            });
          }

          markFirstGameComplete();
          setPracticeUnlocked(true);
          setMode('home');
        }}
      />
    );
  }

  if (mode === 'practice') {
    return (
      <PracticeHub
        problems={practiceProblems}
        focusedTags={practiceFocus}
        onComplete={(summary) => {
          if (coachPracticePlanId) {
            markCoachPracticeComplete(
              coachPracticePlanId,
              summary,
            );
          }
        }}
        onExit={() => {
          setPracticeFocus([]);

          if (coachPracticePlanId) {
            setCoachPracticePlanId(null);
            setMode('coach');
          } else {
            setMode('home');
          }
        }}
      />
    );
  }

  if (mode === 'play') {
    return (
      <PlayHub
        coachObjective={coachObjective}
        onExit={() => {
          if (coachPlayPlanId) {
            setCoachPlayPlanId(null);
            setCoachObjective(null);
            setMode('coach');
          } else {
            setMode('home');
          }
        }}
        onStudyRecord={(record) => {
          setCoachPlayPlanId(null);
          setCoachObjective(null);
          setStudyRecord(record);
          setMode('study');
        }}
        onReviewRecord={(record) => {
          setCoachPlayPlanId(null);
          setCoachObjective(null);
          setReviewReturnToCoach(false);
          setReviewRecord(record);
          setMode('review');
        }}
      />
    );
  }

  if (mode === 'coach') {
    return (
      <CoachHub
        problems={practiceProblems}
        onExit={() => setMode('home')}
        onPractice={(tags, planId) => {
          setPracticeFocus(tags);
          setCoachPracticePlanId(
            planId || null,
          );
          setMode('practice');
        }}
        onPlay={(objective, planId) => {
          setCoachObjective(objective);
          setCoachPlayPlanId(
            planId || null,
          );
          setMode('play');
        }}
        onReview={(record) => {
          setReviewRecord(record);
          setReviewReturnToCoach(true);
          setMode('review');
        }}
      />
    );
  }

  if (mode === 'review') {
    return (
      <ReviewHub
        initialRecord={reviewRecord}
        onExit={() => {
          setReviewRecord(null);

          if (reviewReturnToCoach) {
            setReviewReturnToCoach(false);
            setMode('coach');
          } else {
            setMode('home');
          }
        }}
        onPractice={(tags) => {
          setPracticeFocus(tags);
          setReviewRecord(null);
          setMode('practice');
        }}
        onStudy={(record) => {
          setStudyRecord(record);
          setReviewRecord(null);
          setReviewReturnToCoach(false);
          setMode('study');
        }}
      />
    );
  }

  if (mode === 'study') {
    return (
      <StudyHub
        initialRecord={studyRecord}
        onExit={() => {
          setStudyRecord(null);
          setMode('home');
        }}
      />
    );
  }

  if (mode === 'progress') {
    return (
      <MasteryDashboard
        problems={allProblems}
        onExit={() => setMode('home')}
        onPractice={(tags) => {
          setPracticeFocus(tags);
          setMode('practice');
        }}
      />
    );
  }

  return (
    <main className="app-shell">
      <section className="welcome" aria-labelledby="welcome-title">
        <div className="brand-mark" aria-hidden="true">
          <span className="brand-stone brand-stone--black" />
          <span className="brand-stone brand-stone--white" />
        </div>

        <p className="eyebrow">Learn Go from zero</p>
        <h1 id="welcome-title">One stone at a time.</h1>
        <p className="welcome-copy">
          Start with no Go knowledge. Learn directly on the board, understand
          each rule through interaction, then build skill through real games,
          short practice problems, and targeted review.
        </p>

        <div className="home-actions">
          <button
            className="primary-action"
            type="button"
            onClick={() => {
              setActiveCourse(
                practiceUnlocked
                  ? developingCourse
                  : beginnerCourse,
              );
              setMode('course');
            }}
          >
            {practiceUnlocked ? 'Continue developing' : 'Start learning'}
          </button>

          {practiceUnlocked && (
            <>
              <button
                className="home-secondary-action"
                type="button"
                onClick={() => setMode('coach')}
              >
                Coach
              </button>
              <button
                className="home-secondary-action"
                type="button"
                onClick={() => {
                  setPracticeFocus([]);
                  setCoachPracticePlanId(null);
                  setMode('practice');
                }}
              >
                Practice
              </button>
              <button
                className="home-secondary-action"
                type="button"
                onClick={() => {
                  setCoachPlayPlanId(null);
                  setCoachObjective(null);
                  setMode('play');
                }}
              >
                Play
              </button>
              <button
                className="home-secondary-action"
                type="button"
                onClick={() => {
                  setReviewRecord(null);
                  setReviewReturnToCoach(false);
                  setMode('review');
                }}
              >
                Review
              </button>
              <button
                className="home-secondary-action"
                type="button"
                onClick={() => {
                  setStudyRecord(null);
                  setMode('study');
                }}
              >
                Study
              </button>
              <button
                className="home-secondary-action"
                type="button"
                onClick={() => setMode('progress')}
              >
                Progress
              </button>
            </>
          )}
        </div>

        <p className="secondary-copy">
          {practiceUnlocked
            ? 'Developing course · coach · play · review · practice · study · mastery diagnosis'
            : '12 interactive lessons · guided first game · no account required'}
        </p>

        <div className="home-utility-actions">
          <button
            className="home-utility-action"
            type="button"
            onClick={() => setMode('account')}
          >
            {account.status === 'signed-in'
              ? account.syncStatus === 'syncing'
                ? 'Account · syncing…'
                : `Account · ${account.user?.email ?? 'signed in'}`
              : 'Account & sync'}
          </button>

          <button
            className="home-utility-action"
            type="button"
            onClick={() => setMode('settings')}
          >
            Device & accessibility settings
          </button>
        </div>
      </section>
    </main>
  );
}
