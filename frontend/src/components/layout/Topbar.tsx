import { Flame, CalendarDays } from 'lucide-react';
import { formatDate } from '@/lib/api';

interface TopbarProps {
  streak: number;
}

export function Topbar({ streak }: TopbarProps) {
  const today = new Date();
  const formatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">{formatted}</span>
      </div>

      <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-warning/10 border border-warning/20">
        <Flame className="h-5 w-5 text-warning" />
        <span className="text-sm font-semibold text-warning">{streak} day streak</span>
      </div>
    </header>
  );
}

export { formatDate };
