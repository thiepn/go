import type {
  CoachPlan,
  CoachPracticeSummary,
} from './types';

export const COACH_PLANS_STORAGE_KEY =
  'thiepn-go:coach-plans:v1';

interface CoachStoreState {
  readonly activePlanId: string | null;
  readonly plans: readonly CoachPlan[];
}

function emptyState(): CoachStoreState {
  return {
    activePlanId: null,
    plans: [],
  };
}

export function loadCoachState(): CoachStoreState {
  if (typeof window === 'undefined') {
    return emptyState();
  }

  try {
    const raw =
      window.localStorage.getItem(
        COACH_PLANS_STORAGE_KEY,
      );

    if (!raw) return emptyState();

    const parsed =
      JSON.parse(raw) as Partial<CoachStoreState>;

    return {
      activePlanId:
        typeof parsed.activePlanId ===
        'string'
          ? parsed.activePlanId
          : null,
      plans:
        Array.isArray(parsed.plans)
          ? parsed.plans as CoachPlan[]
          : [],
    };
  } catch {
    return emptyState();
  }
}

export function saveCoachState(
  state: CoachStoreState,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      COACH_PLANS_STORAGE_KEY,
      JSON.stringify({
        activePlanId:
          state.activePlanId,
        plans:
          state.plans.slice(0, 12),
      }),
    );
  } catch {
    // Coaching remains usable without persistence.
  }
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
