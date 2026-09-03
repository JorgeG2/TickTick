import { Flame, CalendarDays, Sun, Moon } from 'lucide-react';
import { formatDate } from '@/lib/api';
import { useTheme } from '@/lib/theme';

interface TopbarProps {
  streak: number;
}

export function Topbar({ streak }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
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

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-warning/10 border border-warning/20">
          <Flame className="h-5 w-5 text-warning" />
          <span className="text-sm font-semibold text-warning">{streak} day streak</span>
        </div>

        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="relative h-9 w-9 rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <Sun
            className={`absolute inset-0 m-auto h-4 w-4 transition-all duration-300 ${
              theme === 'dark' ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
            }`}
          />
          <Moon
            className={`absolute inset-0 m-auto h-4 w-4 transition-all duration-300 ${
              theme === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0'
            }`}
          />
        </button>
      </div>
    </header>
  );
}

export { formatDate };
