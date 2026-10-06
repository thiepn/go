import type { CoachPlan } from '../coach/types';
import {
  COACH_PLANS_STORAGE_KEY,
  loadCoachState,
  saveCoachState,
  type CoachStoreState,
} from '../coach/store';
import type { MasteryEvidence } from '../mastery/types';
import {
  loadMasteryEvidence,
  saveMasteryEvidence,
} from '../mastery/store';
import {
  GAME_RECORDS_STORAGE_KEY,
  loadGameRecords,
} from '../play/records';
import type { SavedGameRecord } from '../play/types';
import {
  PRACTICE_HISTORY_STORAGE_KEY,
  loadProblemHistory,
  saveProblemHistory,
} from '../practice/history';
import type {
  ProblemHistory,
  ProblemHistoryEntry,
} from '../practice/types';
import {
  isRecord,
  readJson,
  writeJson,
} from '../platform/storage';
import {
  STUDY_STORAGE_KEY,
  loadStudyDocuments,
} from '../study/store';
import type { StudyDocument } from '../study/types';
import type {
  ThiepnAccount,
  ThiepnUser,
} from './runtime';

export const FIRST_GAME_COMPLETE_KEY =
  'thiepn-go:guided:first-9x9:complete';

const COURSE_STORAGE_KEYS = {
  'go-foundations':
    'thiepn-go:course:go-foundations:v1',
  'developing-go':
    'thiepn-go:course:developing-go:v1',
} as const;

export interface CourseProgress {
  readonly nextLessonIndex: number;
}

export interface GoSyncPayload {
  readonly schemaVersion: 1;
  readonly firstGameComplete: boolean;
  readonly courses: Readonly<
    Record<string, CourseProgress>
  >;
  readonly masteryEvidence:
    readonly MasteryEvidence[];
  readonly problemHistory: ProblemHistory;
  readonly gameRecords:
    readonly SavedGameRecord[];
  readonly coachState: CoachStoreState;
  readonly studies:
    readonly StudyDocument[];
}

interface RemoteStateRow {
  readonly revision: number;
  readonly payload: GoSyncPayload;
  readonly client_updated_at: number;
  readonly updated_at: string;
}

export interface SyncResult {
  readonly revision: number;
  readonly changedLocal: boolean;
  readonly changedRemote: boolean;
  readonly syncedAt: number;
}

function emptyCoachState(): CoachStoreState {
  return {
    activePlanId: null,
    plans: [],
  };
}

export function emptyGoSyncPayload(): GoSyncPayload {
  return {
    schemaVersion: 1,
    firstGameComplete: false,
    courses: {},
    masteryEvidence: [],
    problemHistory: {},
    gameRecords: [],
    coachState: emptyCoachState(),
    studies: [],
  };
}

function isCourseProgress(
  value: unknown,
): value is CourseProgress {
  return (
    isRecord(value) &&
    typeof value.nextLessonIndex === 'number' &&
    Number.isInteger(value.nextLessonIndex) &&
    value.nextLessonIndex >= 0
  );
}

function isMasteryEvidence(
  value: unknown,
): value is MasteryEvidence {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.conceptId === 'string' &&
    typeof value.source === 'string' &&
    typeof value.sourceId === 'string' &&
    typeof value.outcome === 'number' &&
    typeof value.weight === 'number' &&
    typeof value.occurredAt === 'number'
  );
}

function isProblemHistoryEntry(
  value: unknown,
): value is ProblemHistoryEntry {
  return (
    isRecord(value) &&
    typeof value.problemId === 'string' &&
    typeof value.attempts === 'number' &&
    typeof value.successes === 'number' &&
    typeof value.failures === 'number' &&
    typeof value.firstTrySuccesses === 'number' &&
    typeof value.totalHintsUsed === 'number'
  );
}

function isProblemHistory(
  value: unknown,
): value is ProblemHistory {
  return (
    isRecord(value) &&
    Object.values(value).every(
      isProblemHistoryEntry,
    )
  );
}

function isGameRecord(
  value: unknown,
): value is SavedGameRecord {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.playedAt === 'number' &&
    isRecord(value.settings) &&
    Array.isArray(value.moves) &&
    isRecord(value.result) &&
    isRecord(value.captures)
  );
}

function isCoachPlan(
  value: unknown,
): value is CoachPlan {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.createdAt === 'number' &&
    Array.isArray(value.sourceGameIds) &&
    isRecord(value.focus) &&
    typeof value.objective === 'string' &&
    Array.isArray(value.turningPoints) &&
    isRecord(value.baseline) &&
    typeof value.engineEnhanced === 'boolean'
  );
}

function isCoachState(
  value: unknown,
): value is CoachStoreState {
  return (
    isRecord(value) &&
    (value.activePlanId === null ||
      typeof value.activePlanId === 'string') &&
    Array.isArray(value.plans) &&
    value.plans.every(isCoachPlan)
  );
}

function isStudyDocument(
  value: unknown,
): value is StudyDocument {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    isRecord(value.metadata) &&
    isRecord(value.root) &&
    typeof value.createdAt === 'number' &&
    typeof value.updatedAt === 'number'
  );
}

export function isGoSyncPayload(
  value: unknown,
): value is GoSyncPayload {
  return (
    isRecord(value) &&
    value.schemaVersion === 1 &&
    typeof value.firstGameComplete === 'boolean' &&
    isRecord(value.courses) &&
    Object.values(value.courses).every(
      isCourseProgress,
    ) &&
    Array.isArray(value.masteryEvidence) &&
    value.masteryEvidence.every(
      isMasteryEvidence,
    ) &&
    isProblemHistory(value.problemHistory) &&
    Array.isArray(value.gameRecords) &&
    value.gameRecords.every(isGameRecord) &&
    isCoachState(value.coachState) &&
    Array.isArray(value.studies) &&
    value.studies.every(isStudyDocument)
  );
}

function readCourseProgress(
  key: string,
): CourseProgress | null {
  return readJson<CourseProgress | null>(
    key,
    () => null,
    (value): value is CourseProgress | null =>
      value === null || isCourseProgress(value),
  );
}

export function collectLocalState(): GoSyncPayload {
  const courses: Record<string, CourseProgress> = {};

  for (const [courseId, key] of Object.entries(
    COURSE_STORAGE_KEYS,
  )) {
    const progress = readCourseProgress(key);
    if (progress) courses[courseId] = progress;
  }

  return {
    schemaVersion: 1,
    firstGameComplete: readJson(
      FIRST_GAME_COMPLETE_KEY,
      () => false,
      (value): value is boolean =>
        typeof value === 'boolean',
    ),
    courses,
    masteryEvidence: loadMasteryEvidence(),
    problemHistory: loadProblemHistory(),
    gameRecords: loadGameRecords(),
    coachState: loadCoachState(),
    studies: loadStudyDocuments(),
  };
}

export function applyLocalState(
  state: GoSyncPayload,
): void {
  writeJson(
    FIRST_GAME_COMPLETE_KEY,
    state.firstGameComplete,
  );

  for (const [courseId, key] of Object.entries(
    COURSE_STORAGE_KEYS,
  )) {
    const progress = state.courses[courseId];
    if (progress) writeJson(key, progress);
  }

  saveMasteryEvidence(state.masteryEvidence);
  saveProblemHistory(state.problemHistory);
  writeJson(
    GAME_RECORDS_STORAGE_KEY,
    state.gameRecords,
  );
  saveCoachState(state.coachState);
  writeJson(
    STUDY_STORAGE_KEY,
    state.studies,
  );
}

function mergeEvidence(
  remote: readonly MasteryEvidence[],
  local: readonly MasteryEvidence[],
): MasteryEvidence[] {
  const byId = new Map<string, MasteryEvidence>();

  for (const item of [...remote, ...local]) {
    const current = byId.get(item.id);

    if (
      !current ||
      item.occurredAt >= current.occurredAt
    ) {
      byId.set(item.id, item);
    }
  }

  return [...byId.values()].sort(
    (a, b) => a.occurredAt - b.occurredAt,
  );
}

function mergeHistoryEntry(
  remote: ProblemHistoryEntry,
  local: ProblemHistoryEntry,
): ProblemHistoryEntry {
  const remoteAt = remote.lastAttemptAt ?? 0;
  const localAt = local.lastAttemptAt ?? 0;
  const latest =
    localAt >= remoteAt ? local : remote;

  return {
    problemId: local.problemId,
    attempts: Math.max(
      remote.attempts,
      local.attempts,
    ),
    successes: Math.max(
      remote.successes,
      local.successes,
    ),
    failures: Math.max(
      remote.failures,
      local.failures,
    ),
    firstTrySuccesses: Math.max(
      remote.firstTrySuccesses,
      local.firstTrySuccesses,
    ),
    totalHintsUsed: Math.max(
      remote.totalHintsUsed,
      local.totalHintsUsed,
    ),
    lastResult: latest.lastResult,
    lastAttemptAt:
      Math.max(remoteAt, localAt) || null,
  };
}

function mergeProblemHistory(
  remote: ProblemHistory,
  local: ProblemHistory,
): ProblemHistory {
  const result: Record<
    string,
    ProblemHistoryEntry
  > = {
    ...remote,
  };

  for (const [id, localEntry] of Object.entries(
    local,
  )) {
    const remoteEntry = result[id];
    result[id] = remoteEntry
      ? mergeHistoryEntry(
          remoteEntry,
          localEntry,
        )
      : localEntry;
  }

  return result;
}

function mergeById<T extends { readonly id: string }>(
  remote: readonly T[],
  local: readonly T[],
  freshness: (value: T) => number,
): T[] {
  const byId = new Map<string, T>();

  for (const item of [...remote, ...local]) {
    const current = byId.get(item.id);

    if (
      !current ||
      freshness(item) >= freshness(current)
    ) {
      byId.set(item.id, item);
    }
  }

  return [...byId.values()];
}

function coachFreshness(plan: CoachPlan): number {
  return Math.max(
    plan.createdAt,
    plan.archivedAt ?? 0,
    plan.practiceSummary?.completedAt ?? 0,
  );
}

function mergeCoachState(
  remote: CoachStoreState,
  local: CoachStoreState,
): CoachStoreState {
  const plans = mergeById(
    remote.plans,
    local.plans,
    coachFreshness,
  )
    .sort(
      (a, b) => b.createdAt - a.createdAt,
    )
    .slice(0, 12);

  const ids = new Set(
    plans.map((plan) => plan.id),
  );

  return {
    activePlanId:
      local.activePlanId &&
      ids.has(local.activePlanId)
        ? local.activePlanId
        : remote.activePlanId &&
            ids.has(remote.activePlanId)
          ? remote.activePlanId
          : null,
    plans,
  };
}

export function mergeGoSyncPayloads(
  remote: GoSyncPayload,
  local: GoSyncPayload,
): GoSyncPayload {
  const courseIds = new Set([
    ...Object.keys(remote.courses),
    ...Object.keys(local.courses),
  ]);
  const courses: Record<string, CourseProgress> = {};

  for (const courseId of courseIds) {
    const remoteValue =
      remote.courses[courseId]?.nextLessonIndex ?? 0;
    const localValue =
      local.courses[courseId]?.nextLessonIndex ?? 0;

    courses[courseId] = {
      nextLessonIndex: Math.max(
        remoteValue,
        localValue,
      ),
    };
  }

  const gameRecords = mergeById(
    remote.gameRecords,
    local.gameRecords,
    (record) => record.playedAt,
  )
    .sort(
      (a, b) => b.playedAt - a.playedAt,
    )
    .slice(0, 50);

  const studies = mergeById(
    remote.studies,
    local.studies,
    (study) => study.updatedAt,
  )
    .sort(
      (a, b) => b.updatedAt - a.updatedAt,
    )
    .slice(0, 50);

  return {
    schemaVersion: 1,
    firstGameComplete:
      remote.firstGameComplete ||
      local.firstGameComplete,
    courses,
    masteryEvidence: mergeEvidence(
      remote.masteryEvidence,
      local.masteryEvidence,
    ),
    problemHistory: mergeProblemHistory(
      remote.problemHistory,
      local.problemHistory,
    ),
    gameRecords,
    coachState: mergeCoachState(
      remote.coachState,
      local.coachState,
    ),
    studies,
  };
}

function fingerprint(
  value: GoSyncPayload,
): string {
  return JSON.stringify(value);
}

async function fetchRemoteState(
  account: ThiepnAccount,
  userId: string,
): Promise<RemoteStateRow | null> {
  const { data, error } = await account.client
    .from('go_user_state')
    .select(
      'revision,payload,client_updated_at,updated_at',
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  if (!isGoSyncPayload(data.payload)) {
    throw new Error(
      'Cloud Go data uses an unsupported or invalid format.',
    );
  }

  return {
    revision: Number(data.revision),
    payload: data.payload,
    client_updated_at: Number(
      data.client_updated_at,
    ),
    updated_at: String(data.updated_at),
  };
}

async function markAppUsed(
  account: ThiepnAccount,
  user: ThiepnUser,
): Promise<void> {
  const now = new Date().toISOString();

  const { error } = await account.client
    .from('account_user_apps')
    .upsert(
      {
        user_id: user.id,
        app_slug: 'go',
        last_used_at: now,
        source: 'app',
      },
      {
        onConflict: 'user_id,app_slug',
      },
    );

  if (error) {
    // Entitlement/activity metadata is not allowed to
    // block Go learning-state synchronization.
  }
}

async function writeRemoteState(
  account: ThiepnAccount,
  expectedRevision: number,
  payload: GoSyncPayload,
): Promise<number | null> {
  const { data, error } = await account.client.rpc(
    'go_sync_write',
    {
      p_expected_revision: expectedRevision,
      p_payload: payload,
      p_client_updated_at: Date.now(),
    },
  );

  if (error) throw error;
  if (data === null || data === undefined) {
    return null;
  }

  const revision = Number(data);
  return Number.isFinite(revision)
    ? revision
    : null;
}

export async function syncGoState(
  account: ThiepnAccount,
  user: ThiepnUser,
): Promise<SyncResult> {
  await markAppUsed(account, user);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const local = collectLocalState();
    const remoteRow = await fetchRemoteState(
      account,
      user.id,
    );
    const remote =
      remoteRow?.payload ??
      emptyGoSyncPayload();

    const merged = mergeGoSyncPayloads(
      remote,
      local,
    );

    const changedLocal =
      fingerprint(merged) !== fingerprint(local);
    const changedRemote =
      fingerprint(merged) !== fingerprint(remote);

    if (changedLocal) {
      applyLocalState(merged);
    }

    if (!changedRemote && remoteRow) {
      return {
        revision: remoteRow.revision,
        changedLocal,
        changedRemote: false,
        syncedAt: Date.now(),
      };
    }

    const revision = await writeRemoteState(
      account,
      remoteRow?.revision ?? 0,
      merged,
    );

    if (revision !== null) {
      return {
        revision,
        changedLocal,
        changedRemote: true,
        syncedAt: Date.now(),
      };
    }
  }

  throw new Error(
    'Go cloud data changed repeatedly during sync. Retry once the other device finishes syncing.',
  );
}

export async function deleteGoCloudState(
  account: ThiepnAccount,
  user: ThiepnUser,
): Promise<void> {
  const { error } = await account.client
    .from('go_user_state')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
}
