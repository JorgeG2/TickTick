import { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const WORK_DURATION = 25 * 60;

export function PomodoroWidget() {
  const [expanded, setExpanded] = useState(false);
  const [seconds, setSeconds] = useState(WORK_DURATION);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = ((WORK_DURATION - seconds) / WORK_DURATION) * 100;

  const reset = () => {
    setRunning(false);
    setSeconds(WORK_DURATION);
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-4 py-2.5 w-full hover:bg-background/50 transition-colors"
      >
        <Timer className="h-4 w-4 text-primary" />
        <span className="text-sm font-mono font-medium">
          {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </span>
        {expanded ? <ChevronDown className="h-3 w-3 ml-auto" /> : <ChevronUp className="h-3 w-3 ml-auto" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in">
          <div className="h-1.5 rounded-full bg-background overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button
              size="icon"
              variant="secondary"
              onClick={() => setRunning(!running)}
              className={cn(running && 'bg-primary/20')}
            >
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
