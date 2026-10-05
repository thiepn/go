export type BoardFeedbackEvent =
  | 'place'
  | 'capture'
  | 'invalid'
  | 'focus'
  | 'success';

export interface FeedbackOptions {
  readonly haptics?: boolean;
  readonly sound?: (event: BoardFeedbackEvent) => void;
}

const patterns: Partial<Record<BoardFeedbackEvent, number | number[]>> = {
  place: 8,
  capture: 16,
  invalid: [10, 35, 10],
  success: [8, 25, 14],
};

export function triggerBoardFeedback(
  event: BoardFeedbackEvent,
  options: FeedbackOptions = {},
): void {
  options.sound?.(event);

  if (!options.haptics) return;
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
    return;
  }

  const pattern = patterns[event];

  if (pattern !== undefined) {
    navigator.vibrate(pattern);
  }
}
