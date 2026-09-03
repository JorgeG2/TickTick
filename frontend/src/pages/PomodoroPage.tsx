import { useEffect, useMemo, useState } from 'react';
import { Image as ImageIcon, Pause, Play, RotateCcw, Settings2, SkipForward } from 'lucide-react';
import { PomodoroBackground } from '@/components/pomodoro/PomodoroBackground';
import { BackgroundPicker } from '@/components/pomodoro/BackgroundPicker';
import {
  DEFAULT_BACKGROUND_ID,
  findBackground,
  guessKindFromUrl,
  GRADIENT_BACKGROUNDS,
  type Background,
} from '@/lib/backgrounds';
import {
  MODE_LABELS,
  SESSIONS_BEFORE_LONG_BREAK,
  usePomodoro,
  type PomodoroMode,
} from '@/lib/pomodoro';
import { cn } from '@/lib/utils';

const SCENE_KEY = 'apex.pomodoro.scene';

const MODES: PomodoroMode[] = ['focus', 'short', 'long'];

const RADIUS = 140;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface Scene {
  background: Background;
  dim: number;
  blur: boolean;
}

const DEFAULT_SCENE: Scene = {
  background: findBackground(DEFAULT_BACKGROUND_ID) ?? GRADIENT_BACKGROUNDS[0],
  dim: 0.45,
  blur: false,
};

function readStoredScene(): Scene {
  try {
    const raw = localStorage.getItem(SCENE_KEY);
    if (!raw) return DEFAULT_SCENE;
    const parsed = JSON.parse(raw) as {
      backgroundId?: string;
      customUrl?: string;
      dim?: number;
      blur?: boolean;
    };
    const background = parsed.customUrl
      ? customBackground(parsed.customUrl)
      : findBackground(parsed.backgroundId ?? '') ?? DEFAULT_SCENE.background;
    return {
      background,
      dim: typeof parsed.dim === 'number' ? Math.min(0.85, Math.max(0, parsed.dim)) : DEFAULT_SCENE.dim,
      blur: parsed.blur === true,
    };
  } catch {
    return DEFAULT_SCENE;
  }
}

function customBackground(url: string): Background {
  return { id: `custom:${url}`, label: 'Custom', kind: guessKindFromUrl(url), src: url, poster: url };
}

export function PomodoroPage() {
  const {
    mode,
    running,
    formatted,
    progress,
    completedFocusSessions,
    durations,
    toggle,
    reset,
    skip,
    selectMode,
    setDuration,
  } = usePomodoro();

  const [scene, setScene] = useState<Scene>(readStoredScene);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    try {
      const isCustom = scene.background.id.startsWith('custom:');
      localStorage.setItem(
        SCENE_KEY,
        JSON.stringify({
          backgroundId: isCustom ? undefined : scene.background.id,
          customUrl: isCustom ? scene.background.src : undefined,
          dim: scene.dim,
          blur: scene.blur,
        })
      );
    } catch {
      // Best-effort persistence.
    }
  }, [scene]);

  // Space toggles the timer, as long as focus isn't in a text field.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const el = document.activeElement;
      if (el instanceof HTMLElement && (el.tagName === 'INPUT' || el.isContentEditable)) return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggle]);

  const dashOffset = useMemo(() => CIRCUMFERENCE * (1 - progress), [progress]);
  const sessionsInCycle = completedFocusSessions % SESSIONS_BEFORE_LONG_BREAK;

  return (
    // Negative margin cancels the layout's p-6 so the scene runs edge to edge.
    <div className="relative -m-6 h-[calc(100%+3rem)] min-h-[560px] overflow-hidden">
      <PomodoroBackground background={scene.background} dim={scene.dim} blur={scene.blur} />

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-8 px-6 text-white">
        <div className="flex gap-1 rounded-2xl border border-white/15 bg-black/25 p-1 backdrop-blur-md">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => selectMode(m)}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-medium transition-all',
                mode === m ? 'bg-white text-black shadow-lg' : 'text-white/70 hover:text-white'
              )}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        <div className="relative grid place-items-center">
          {running && (
            <div className="pointer-events-none absolute h-[19rem] w-[19rem] animate-breathe rounded-full bg-white/20 blur-3xl" />
          )}

          <svg viewBox="0 0 320 320" className="relative h-72 w-72 -rotate-90 sm:h-80 sm:w-80">
            <circle
              cx="160"
              cy="160"
              r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="10"
            />
            <circle
              cx="160"
              cy="160"
              r={RADIUS}
              fill="none"
              stroke="white"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
              style={{ filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.55))' }}
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-6xl font-semibold tabular-nums tracking-tight drop-shadow-lg sm:text-7xl">
              {formatted}
            </span>
            <span className="mt-2 text-xs font-medium uppercase tracking-[0.25em] text-white/70">
              {MODE_LABELS[mode]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            aria-label="Reset timer"
            className="rounded-full border border-white/20 bg-black/25 p-3 text-white/80 backdrop-blur-md transition-all hover:scale-105 hover:bg-black/40 hover:text-white"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          <button
            onClick={toggle}
            aria-label={running ? 'Pause timer' : 'Start timer'}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-2xl transition-transform hover:scale-105 active:scale-95"
          >
            {running ? <Pause className="h-7 w-7" /> : <Play className="ml-0.5 h-7 w-7" />}
          </button>

          <button
            onClick={skip}
            aria-label="Skip to next session"
            className="rounded-full border border-white/20 bg-black/25 p-3 text-white/80 backdrop-blur-md transition-all hover:scale-105 hover:bg-black/40 hover:text-white"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            {Array.from({ length: SESSIONS_BEFORE_LONG_BREAK }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors',
                  i < sessionsInCycle ? 'bg-white' : 'bg-white/30'
                )}
              />
            ))}
          </div>
          <p className="text-xs text-white/60">
            {completedFocusSessions} focus session{completedFocusSessions === 1 ? '' : 's'} today
          </p>
        </div>
      </div>

      <div className="absolute right-6 top-6 z-20 flex flex-col items-end gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSettingsOpen((v) => !v);
              setPickerOpen(false);
            }}
            aria-label="Timer settings"
            className="rounded-xl border border-white/15 bg-black/30 p-2.5 text-white/80 backdrop-blur-md transition-colors hover:bg-black/50 hover:text-white"
          >
            <Settings2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setPickerOpen((v) => !v);
              setSettingsOpen(false);
            }}
            aria-label="Change background"
            className="rounded-xl border border-white/15 bg-black/30 p-2.5 text-white/80 backdrop-blur-md transition-colors hover:bg-black/50 hover:text-white"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
        </div>

        {settingsOpen && (
          <div className="w-64 rounded-2xl border border-white/15 bg-black/70 p-4 text-white shadow-2xl backdrop-blur-xl animate-scale-in">
            <h2 className="mb-3 text-sm font-semibold">Session lengths</h2>
            <div className="space-y-2">
              {MODES.map((m) => (
                <label key={m} className="flex items-center justify-between gap-3 text-xs text-white/70">
                  <span>{MODE_LABELS[m]}</span>
                  <span className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={durations[m]}
                      onChange={(e) => setDuration(m, Number(e.target.value))}
                      className="w-16 rounded-lg border border-white/15 bg-white/10 px-2 py-1 text-right text-xs text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                    min
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-white/50">
              Long break every {SESSIONS_BEFORE_LONG_BREAK} focus sessions. Press Space to start or pause.
            </p>
          </div>
        )}

        {pickerOpen && (
          <BackgroundPicker
            current={scene.background}
            onSelect={(background) => setScene((s) => ({ ...s, background }))}
            onSelectCustom={(url) => setScene((s) => ({ ...s, background: customBackground(url) }))}
            onClose={() => setPickerOpen(false)}
            dim={scene.dim}
            onDimChange={(dim) => setScene((s) => ({ ...s, dim }))}
            blur={scene.blur}
            onBlurChange={(blur) => setScene((s) => ({ ...s, blur }))}
          />
        )}
      </div>
    </div>
  );
}
