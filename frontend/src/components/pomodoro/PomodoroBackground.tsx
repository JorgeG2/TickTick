import { useEffect, useState } from 'react';
import { GRADIENT_BACKGROUNDS, type Background } from '@/lib/backgrounds';

const FALLBACK_CSS = GRADIENT_BACKGROUNDS[0].css;

interface PomodoroBackgroundProps {
  background: Background;
  /** 0–1 darkening overlay, for keeping the timer legible over busy scenes. */
  dim: number;
  blur: boolean;
}

export function PomodoroBackground({ background, dim, blur }: PomodoroBackgroundProps) {
  const [failed, setFailed] = useState(false);

  // A new scene deserves a fresh chance to load.
  useEffect(() => setFailed(false), [background.id, background.src]);

  const showMedia = !failed && background.kind !== 'gradient' && !!background.src;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Always-present base layer: gradients render here, and it is what a
          failed photo/video falls back to. */}
      <div
        className="absolute inset-0 animate-aurora"
        style={{ background: background.kind === 'gradient' ? background.css : FALLBACK_CSS }}
      />

      {showMedia && background.kind === 'photo' && (
        <img
          src={background.src}
          alt=""
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full animate-ken-burns object-cover"
        />
      )}

      {showMedia && background.kind === 'video' && (
        <video
          key={background.src}
          src={background.src}
          poster={background.poster}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <div
        className="absolute inset-0 transition-[backdrop-filter,background-color] duration-300"
        style={{
          backgroundColor: `rgba(6, 8, 15, ${dim})`,
          backdropFilter: blur ? 'blur(10px)' : undefined,
        }}
      />
    </div>
  );
}
