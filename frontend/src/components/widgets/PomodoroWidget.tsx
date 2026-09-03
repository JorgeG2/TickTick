import { useState } from 'react';
import { Timer, Play, Pause, RotateCcw, Maximize2, ChevronUp, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MODE_LABELS, usePomodoro } from '@/lib/pomodoro';

export function PomodoroWidget() {
  const [expanded, setExpanded] = useState(false);
  const { mode, running, formatted, progress, toggle, reset } = usePomodoro();

  return (
    <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-4 py-2.5 w-full hover:bg-background/50 transition-colors"
      >
        <Timer className={cn('h-4 w-4', running ? 'text-primary' : 'text-muted-foreground')} />
        <span className="text-sm font-mono font-medium">{formatted}</span>
        {expanded ? <ChevronDown className="h-3 w-3 ml-auto" /> : <ChevronUp className="h-3 w-3 ml-auto" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in">
          <p className="text-xs text-muted-foreground text-center">{MODE_LABELS[mode]}</p>
          <div className="h-1.5 rounded-full bg-background overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button
              size="icon"
              variant="secondary"
              onClick={toggle}
              aria-label={running ? 'Pause timer' : 'Start timer'}
              className={cn(running && 'bg-primary/20')}
            >
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={reset} aria-label="Reset timer">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" asChild aria-label="Open full Pomodoro">
              <Link to="/pomodoro">
                <Maximize2 className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
