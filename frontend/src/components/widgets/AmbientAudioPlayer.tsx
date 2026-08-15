import { useState, useRef } from 'react';
import { Volume2, VolumeX, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const sounds = [
  { id: 'rain', label: 'Rain', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3' },
  { id: 'cafe', label: 'Café', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_8cb7499d9c.mp3' },
  { id: 'white', label: 'White Noise', url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_c8c8a7ac52.mp3' },
];

export function AmbientAudioPlayer() {
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = (id: string, url: string) => {
    if (active === id) {
      audioRef.current?.pause();
      setActive(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = volume;
    audio.play().catch(console.error);
    audioRef.current = audio;
    setActive(id);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (audioRef.current.volume > 0) {
        audioRef.current.volume = 0;
      } else {
        audioRef.current.volume = volume;
      }
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-4 py-2.5 w-full hover:bg-background/50 transition-colors"
      >
        <Volume2 className={cn('h-4 w-4', active ? 'text-primary' : 'text-muted-foreground')} />
        <span className="text-sm font-medium">
          {active ? sounds.find((s) => s.id === active)?.label : 'Ambient'}
        </span>
        {expanded ? <ChevronDown className="h-3 w-3 ml-auto" /> : <ChevronUp className="h-3 w-3 ml-auto" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 animate-fade-in">
          {sounds.map((sound) => (
            <button
              key={sound.id}
              onClick={() => playSound(sound.id, sound.url)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-all',
                active === sound.id
                  ? 'bg-primary/15 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-background'
              )}
            >
              {sound.label}
            </button>
          ))}
          <div className="flex items-center gap-2 pt-1">
            <button onClick={toggleMute} className="p-1 text-muted-foreground hover:text-foreground">
              <VolumeX className="h-4 w-4" />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setVolume(v);
                if (audioRef.current) audioRef.current.volume = v;
              }}
              className="flex-1 accent-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
}
