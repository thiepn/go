import { getPreferences } from '../../platform/preferences';

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

const soundProfiles: Record<
  BoardFeedbackEvent,
  { readonly frequency: number; readonly duration: number }
> = {
  place: { frequency: 330, duration: 0.045 },
  capture: { frequency: 440, duration: 0.07 },
  invalid: { frequency: 180, duration: 0.075 },
  focus: { frequency: 280, duration: 0.035 },
  success: { frequency: 520, duration: 0.09 },
};

let audioContext: AudioContext | null = null;

function playGeneratedSound(
  event: BoardFeedbackEvent,
): void {
  if (
    typeof window === 'undefined' ||
    typeof window.AudioContext === 'undefined'
  ) {
    return;
  }

  try {
    audioContext ??= new window.AudioContext();
    const context = audioContext;
    const profile = soundProfiles[event];
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(
      profile.frequency,
      now,
    );
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(
      0.035,
      now + 0.006,
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + profile.duration,
    );

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + profile.duration + 0.01);
  } catch {
    // Audio feedback is optional and must never block play.
  }
}

export function triggerBoardFeedback(
  event: BoardFeedbackEvent,
  options: FeedbackOptions = {},
): void {
  const preferences = getPreferences();

  if (preferences.sound) {
    if (options.sound) {
      options.sound(event);
    } else {
      playGeneratedSound(event);
    }
  }

  if (!preferences.haptics || !options.haptics) return;
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.vibrate !== 'function'
  ) {
    return;
  }

  const pattern = patterns[event];

  if (pattern !== undefined) {
    navigator.vibrate(pattern);
  }
}
