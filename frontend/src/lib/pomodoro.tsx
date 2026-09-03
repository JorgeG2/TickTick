import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type PomodoroMode = 'focus' | 'short' | 'long';

export interface Durations {
  focus: number;
  short: number;
  long: number;
}

/** Minutes per mode. */
export const DEFAULT_DURATIONS: Durations = { focus: 25, short: 5, long: 15 };

export const MODE_LABELS: Record<PomodoroMode, string> = {
  focus: 'Focus',
  short: 'Short Break',
  long: 'Long Break',
};

/** Long break after this many completed focus sessions. */
const SESSIONS_BEFORE_LONG_BREAK = 4;

const DURATIONS_KEY = 'apex.pomodoro.durations';

interface PomodoroContextValue {
  mode: PomodoroMode;
  running: boolean;
  /** Whole seconds remaining in the current session. */
  secondsLeft: number;
  /** Length of the current session, in seconds. */
  totalSeconds: number;
  /** 0–1, how far through the current session. */
  progress: number;
  completedFocusSessions: number;
  durations: Durations;
  toggle: () => void;
  reset: () => void;
  /** Abandon the current session and move to the next one in the cycle. */
  skip: () => void;
  selectMode: (mode: PomodoroMode) => void;
  setDuration: (mode: PomodoroMode, minutes: number) => void;
  formatted: string;
}

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

function readStoredDurations(): Durations {
  try {
    const raw = localStorage.getItem(DURATIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Durations>;
      return {
        focus: clampMinutes(parsed.focus, DEFAULT_DURATIONS.focus),
        short: clampMinutes(parsed.short, DEFAULT_DURATIONS.short),
        long: clampMinutes(parsed.long, DEFAULT_DURATIONS.long),
      };
    }
  } catch {
    // Corrupt or unavailable storage — fall back to the defaults.
  }
  return DEFAULT_DURATIONS;
}

function clampMinutes(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(180, Math.max(1, Math.round(value)));
}

/** A short two-tone chime, synthesised so there is no asset to ship or load. */
function playChime() {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + i * 0.18;
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.55);
    });
    window.setTimeout(() => ctx.close().catch(() => {}), 1500);
  } catch {
    // Audio is a nicety; never let it break the timer.
  }
}

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [durations, setDurations] = useState<Durations>(readStoredDurations);
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [running, setRunning] = useState(false);
  const [completedFocusSessions, setCompletedFocusSessions] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(durations.focus * 60);

  // Wall-clock deadline rather than a tick counter, so the timer stays honest
  // when the tab is backgrounded and intervals get throttled.
  const deadlineRef = useRef<number | null>(null);

  const totalSeconds = durations[mode] * 60;

  useEffect(() => {
    try {
      localStorage.setItem(DURATIONS_KEY, JSON.stringify(durations));
    } catch {
      // Best-effort persistence.
    }
  }, [durations]);

  const goToMode = useCallback(
    (next: PomodoroMode, mins: Durations) => {
      setMode(next);
      setRunning(false);
      deadlineRef.current = null;
      setSecondsLeft(mins[next] * 60);
    },
    []
  );

  /** Focus → break → focus, with a long break every fourth focus session. */
  const advance = useCallback(
    (finishedFocus: boolean, sessionsAfter: number) => {
      if (!finishedFocus) {
        goToMode('focus', durations);
        return;
      }
      const next: PomodoroMode =
        sessionsAfter % SESSIONS_BEFORE_LONG_BREAK === 0 ? 'long' : 'short';
      goToMode(next, durations);
    },
    [durations, goToMode]
  );

  useEffect(() => {
    if (!running) return;

    if (deadlineRef.current === null) {
      deadlineRef.current = Date.now() + secondsLeft * 1000;
    }

    const tick = () => {
      const deadline = deadlineRef.current;
      if (deadline === null) return;
      const remaining = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        playChime();
        const finishedFocus = mode === 'focus';
        const sessionsAfter = finishedFocus ? completedFocusSessions + 1 : completedFocusSessions;
        if (finishedFocus) setCompletedFocusSessions(sessionsAfter);
        advance(finishedFocus, sessionsAfter);
      }
    };

    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
    // `secondsLeft` is deliberately excluded: it is derived from the deadline,
    // and depending on it would restart the interval every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode, completedFocusSessions, advance]);

  const toggle = useCallback(() => {
    if (running) {
      // Drop the deadline so resuming re-arms from the seconds still on the clock.
      deadlineRef.current = null;
      setRunning(false);
    } else {
      setRunning(true);
    }
  }, [running]);

  const reset = useCallback(() => {
    setRunning(false);
    deadlineRef.current = null;
    setSecondsLeft(durations[mode] * 60);
  }, [durations, mode]);

  const skip = useCallback(() => {
    const finishedFocus = mode === 'focus';
    const sessionsAfter = finishedFocus ? completedFocusSessions + 1 : completedFocusSessions;
    if (finishedFocus) setCompletedFocusSessions(sessionsAfter);
    advance(finishedFocus, sessionsAfter);
  }, [advance, completedFocusSessions, mode]);

  const selectMode = useCallback(
    (next: PomodoroMode) => goToMode(next, durations),
    [durations, goToMode]
  );

  const setDuration = useCallback(
    (target: PomodoroMode, minutes: number) => {
      const clamped = clampMinutes(minutes, DEFAULT_DURATIONS[target]);
      setDurations((prev) => ({ ...prev, [target]: clamped }));
      // Editing the mode you're sitting in should re-arm it, not leave a stale
      // countdown from the old length.
      if (target === mode) {
        setRunning(false);
        deadlineRef.current = null;
        setSecondsLeft(clamped * 60);
      }
    },
    [mode]
  );

  const value = useMemo<PomodoroContextValue>(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return {
      mode,
      running,
      secondsLeft,
      totalSeconds,
      progress: totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0,
      completedFocusSessions,
      durations,
      toggle,
      reset,
      skip,
      selectMode,
      setDuration,
      formatted: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    };
  }, [
    mode,
    running,
    secondsLeft,
    totalSeconds,
    completedFocusSessions,
    durations,
    toggle,
    reset,
    skip,
    selectMode,
    setDuration,
  ]);

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
}

export function usePomodoro() {
  const ctx = useContext(PomodoroContext);
  if (!ctx) throw new Error('usePomodoro must be used within a PomodoroProvider');
  return ctx;
}

export { SESSIONS_BEFORE_LONG_BREAK };
