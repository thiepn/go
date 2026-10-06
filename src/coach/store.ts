import {
  isRecord,
  readJson,
  writeJson,
} from '../platform/storage';
import type {
  CoachPlan,
  CoachPracticeSummary,
} from './types';

export const COACH_PLANS_STORAGE_KEY =
  'thiepn-go:coach-plans:v1';

export interface CoachStoreState {
  readonly activePlanId: string | null;
  readonly plans: readonly CoachPlan[];
}

function emptyState(): CoachStoreState {
  return {
    activePlanId: null,
    plans: [],
  };
}

function isCoachStoreState(
  value: unknown,
): value is CoachStoreState {
  return (
    isRecord(value) &&
    (value.activePlanId === null ||
      typeof value.activePlanId === 'string') &&
    Array.isArray(value.plans) &&
    value.plans.every(
      (plan) =>
        isRecord(plan) &&
        typeof plan.id === 'string',
    )
  );
}

export function loadCoachState(): CoachStoreState {
  return readJson(
    COACH_PLANS_STORAGE_KEY,
    emptyState,
    isCoachStoreState,
  );
}

export function saveCoachState(
  state: CoachStoreState,
): void {
  writeJson(
    COACH_PLANS_STORAGE_KEY,
    {
      activePlanId: state.activePlanId,
      plans: state.plans.slice(0, 12),
    },
  );
}

export function activeCoachPlan(): CoachPlan | null {
  const state = loadCoachState();

  return (
    state.plans.find(
      (plan) =>
        plan.id ===
        state.activePlanId,
    ) ?? null
  );
}

export function setActiveCoachPlan(
  plan: CoachPlan,
): CoachPlan {
  const state = loadCoachState();
  const plans = [
    plan,
    ...state.plans.filter(
      (item) =>
        item.id !== plan.id,
    ),
  ];

  saveCoachState({
    activePlanId: plan.id,
    plans,
  });

  return plan;
}

export function updateCoachPlan(
  plan: CoachPlan,
): CoachPlan {
  const state = loadCoachState();

  saveCoachState({
    activePlanId:
      state.activePlanId ??
      plan.id,
    plans: [
      plan,
      ...state.plans.filter(
        (item) =>
          item.id !== plan.id,
      ),
    ],
  });

  return plan;
}

export function markCoachPracticeComplete(
  planId: string,
  summary: Omit<
    CoachPracticeSummary,
    'completedAt'
  >,
  completedAt = Date.now(),
): CoachPlan | null {
  const state = loadCoachState();
  const plan =
    state.plans.find(
      (item) =>
        item.id === planId,
    );

  if (!plan) return null;

  const updated: CoachPlan = {
    ...plan,
    practiceSummary: {
      ...summary,
      completedAt,
    },
  };

  updateCoachPlan(updated);
  return updated;
}

export function archiveCoachPlan(
  planId: string,
  archivedAt = Date.now(),
): void {
  const state = loadCoachState();

  saveCoachState({
    activePlanId:
      state.activePlanId === planId
        ? null
        : state.activePlanId,
    plans: state.plans.map(
      (plan) =>
        plan.id === planId
          ? {
              ...plan,
              archivedAt,
            }
          : plan,
    ),
  });
}
