import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, ChevronUp, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createBrownNoiseBuffer } from '@/lib/noise';
import { AMBIENCE_SOUNDS, NOISE_SOUNDS, ALL_SOUNDS, type Sound } from '@/lib/sounds';

type Status = 'idle' | 'loading' | 'playing' | 'error';

export function AmbientAudioPlayer() {
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [status, setStatus] = useState<Status>('idle');

  // Streamed sounds use an <audio> element; generated noise runs through the
  // Web Audio graph. Only one of the two is ever live at a time.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const effectiveVolume = muted ? 0 : volume;

  const stopAll = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch {
        // Already stopped; nothing to do.
      }
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    gainRef.current?.disconnect();
    gainRef.current = null;
  }, []);

  // Keep whichever source is live in step with the volume/mute controls.
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = effectiveVolume;
    if (gainRef.current) gainRef.current.gain.value = effectiveVolume;
  }, [effectiveVolume]);

  useEffect(() => {
    return () => {
      stopAll();
      ctxRef.current?.close().catch(() => {});
    };
  }, [stopAll]);

  const playNoise = useCallback(
    (sound: Sound) => {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) throw new Error('Web Audio unavailable');

      const ctx = ctxRef.current ?? new Ctor();
      ctxRef.current = ctx;
      // Browsers start contexts suspended until a user gesture; this click is one.
      void ctx.resume();

      const source = ctx.createBufferSource();
      source.buffer = createBrownNoiseBuffer(ctx);
      source.loop = true;

      const gain = ctx.createGain();
      gain.gain.value = effectiveVolume;

      // Deep Ocean is the same brown noise rolled off into a submerged swell.
      if (sound.lowpassHz) {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = sound.lowpassHz;
        source.connect(filter).connect(gain).connect(ctx.destination);
      } else {
        source.connect(gain).connect(ctx.destination);
      }
      source.start();

      sourceRef.current = source;
      gainRef.current = gain;
    },
    [effectiveVolume]
  );

  const playStream = useCallback(
    async (sound: Sound) => {
      const audio = new Audio(sound.url);
      audio.loop = true;
      audio.volume = effectiveVolume;
      audio.preload = 'auto';
      audioRef.current = audio;
      await audio.play();
    },
    [effectiveVolume]
  );

  const select = useCallback(
    async (sound: Sound) => {
      // Clicking the sound that is already playing stops it.
      if (active === sound.id) {
        stopAll();
        setActive(null);
        setStatus('idle');
        return;
      }

      stopAll();
      setActive(sound.id);
      setStatus('loading');

      try {
        if (sound.kind === 'noise') {
          playNoise(sound);
        } else {
          await playStream(sound);
        }
        setStatus('playing');
      } catch (err) {
        console.error('Ambient sound failed to play:', sound.label, err);
        stopAll();
        setStatus('error');
      }
    },
    [active, playNoise, playStream, stopAll]
  );

  const activeSound = ALL_SOUNDS.find((s) => s.id === active);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-4 py-2.5 w-full hover:bg-background/50 transition-colors"
      >
        {status === 'loading' ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : status === 'error' ? (
          <AlertCircle className="h-4 w-4 text-destructive" />
        ) : (
          <Volume2
            className={cn(
              'h-4 w-4',
              status === 'playing' ? 'text-primary' : 'text-muted-foreground'
            )}
          />
        )}
        <span className="text-sm font-medium">{activeSound?.label ?? 'Ambient'}</span>
        {expanded ? (
          <ChevronDown className="h-3 w-3 ml-auto" />
        ) : (
          <ChevronUp className="h-3 w-3 ml-auto" />
        )}
      </button>

      {expanded && (
        <div className="w-56 max-h-[60vh] overflow-y-auto px-4 pb-4 space-y-2 animate-fade-in">
          {status === 'error' && (
            <p className="text-xs text-destructive">
              That sound would not load. Try another — the noise options always work.
            </p>
          )}

          <SoundGroup
            title="Ambience"
            sounds={AMBIENCE_SOUNDS}
            active={active}
            status={status}
            onSelect={select}
          />
          <SoundGroup
            title="Generated"
            sounds={NOISE_SOUNDS}
            active={active}
            status={status}
            onSelect={select}
          />

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? 'Unmute' : 'Mute'}
              className={cn(
                'p-1 transition-colors',
                muted ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              aria-label="Volume"
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setMuted(false);
              }}
              className="flex-1 accent-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface SoundGroupProps {
  title: string;
  sounds: Sound[];
  active: string | null;
  status: Status;
  onSelect: (sound: Sound) => void;
}

function SoundGroup({ title, sounds, active, status, onSelect }: SoundGroupProps) {
  return (
    <div className="space-y-1">
      <p className="px-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {sounds.map((sound) => {
        const isActive = active === sound.id;
        return (
          <button
            key={sound.id}
            onClick={() => onSelect(sound)}
            className={cn(
              'w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm transition-all',
              isActive
                ? 'bg-primary/15 text-primary font-medium'
                : 'text-muted-foreground hover:bg-background'
            )}
          >
            <span className="flex-1 truncate">{sound.label}</span>
            {isActive && status === 'playing' && <EqualizerBars />}
            {isActive && status === 'loading' && <Loader2 className="h-3 w-3 animate-spin" />}
          </button>
        );
      })}
    </div>
  );
}

/** Three bars that bounce while a sound is playing. */
function EqualizerBars() {
  return (
    <span className="flex h-3 items-end gap-0.5" aria-hidden="true">
      {[0, 0.2, 0.4].map((delay) => (
        <span
          key={delay}
          className="w-0.5 rounded-full bg-primary animate-equalize"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}
