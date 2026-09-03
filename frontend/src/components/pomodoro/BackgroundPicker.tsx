import { useState } from 'react';
import { Check, Link2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  GRADIENT_BACKGROUNDS,
  PHOTO_BACKGROUNDS,
  VIDEO_BACKGROUNDS,
  guessKindFromUrl,
  type Background,
} from '@/lib/backgrounds';

type Tab = 'gradient' | 'photo' | 'video' | 'custom';

const TABS: { id: Tab; label: string }[] = [
  { id: 'gradient', label: 'Animated' },
  { id: 'photo', label: 'Photos' },
  { id: 'video', label: 'Videos' },
  { id: 'custom', label: 'Custom' },
];

const SETS: Record<Exclude<Tab, 'custom'>, Background[]> = {
  gradient: GRADIENT_BACKGROUNDS,
  photo: PHOTO_BACKGROUNDS,
  video: VIDEO_BACKGROUNDS,
};

interface BackgroundPickerProps {
  current: Background;
  onSelect: (background: Background) => void;
  onSelectCustom: (url: string) => void;
  onClose: () => void;
  dim: number;
  onDimChange: (dim: number) => void;
  blur: boolean;
  onBlurChange: (blur: boolean) => void;
}

export function BackgroundPicker({
  current,
  onSelect,
  onSelectCustom,
  onClose,
  dim,
  onDimChange,
  blur,
  onBlurChange,
}: BackgroundPickerProps) {
  const [tab, setTab] = useState<Tab>(current.kind === 'gradient' ? 'gradient' : current.kind);
  const [customUrl, setCustomUrl] = useState('');

  return (
    <div className="w-[22rem] max-w-[calc(100vw-3rem)] rounded-2xl border border-white/15 bg-black/70 p-4 text-white shadow-2xl backdrop-blur-xl animate-scale-in">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Background</h2>
        <button
          onClick={onClose}
          aria-label="Close background picker"
          className="rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-3 flex gap-1 rounded-xl bg-white/10 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors',
              tab === t.id ? 'bg-white/90 text-black' : 'text-white/70 hover:text-white'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'custom' ? (
        <div className="space-y-2">
          <p className="text-xs text-white/60">
            Paste an image or video URL, or a path like{' '}
            <code className="rounded bg-white/10 px-1">/backgrounds/my-clip.mp4</code> for a file in{' '}
            <code className="rounded bg-white/10 px-1">public/backgrounds</code>.
          </p>
          <div className="flex gap-2">
            <input
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customUrl.trim()) onSelectCustom(customUrl.trim());
              }}
              placeholder="https://… or /backgrounds/…"
              className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              onClick={() => customUrl.trim() && onSelectCustom(customUrl.trim())}
              disabled={!customUrl.trim()}
              className="flex items-center gap-1 rounded-lg bg-white/90 px-3 py-2 text-xs font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Link2 className="h-3.5 w-3.5" />
              Use
            </button>
          </div>
          {customUrl.trim() && (
            <p className="text-[11px] text-white/50">
              Detected as {guessKindFromUrl(customUrl.trim()) === 'video' ? 'a video' : 'an image'}.
            </p>
          )}
        </div>
      ) : (
        <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto pr-1">
          {SETS[tab].map((bg) => {
            const selected = bg.id === current.id;
            return (
              <button
                key={bg.id}
                onClick={() => onSelect(bg)}
                title={bg.label}
                className={cn(
                  'group relative aspect-video overflow-hidden rounded-lg ring-2 transition-all',
                  selected ? 'ring-white' : 'ring-transparent hover:ring-white/40'
                )}
              >
                {bg.kind === 'gradient' ? (
                  <span className="absolute inset-0" style={{ background: bg.css }} />
                ) : (
                  <img
                    src={bg.poster}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/80 to-transparent px-1.5 pb-1 pt-3 text-left text-[10px] font-medium">
                  {bg.label}
                </span>
                {selected && (
                  <span className="absolute right-1 top-1 rounded-full bg-white p-0.5 text-black">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 space-y-3 border-t border-white/10 pt-3">
        <label className="flex items-center gap-3 text-xs text-white/70">
          <span className="w-10 shrink-0">Dim</span>
          <input
            type="range"
            min="0"
            max="0.85"
            step="0.05"
            value={dim}
            onChange={(e) => onDimChange(parseFloat(e.target.value))}
            className="flex-1 accent-white"
          />
          <span className="w-8 shrink-0 text-right tabular-nums">{Math.round(dim * 100)}%</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-xs text-white/70">
          <span className="w-10 shrink-0">Blur</span>
          <input
            type="checkbox"
            checked={blur}
            onChange={(e) => onBlurChange(e.target.checked)}
            className="h-4 w-4 accent-white"
          />
        </label>
      </div>
    </div>
  );
}
