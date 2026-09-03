import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Brain,
  Timer,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CategoryDto } from '@/lib/api';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  categories: CategoryDto[];
  selectedCategory: string | null;
  onCategorySelect: (id: string | null) => void;
}

const navItems = [
  { to: '/pomodoro', icon: Timer, label: 'Pomodoro' },
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/study', icon: Brain, label: 'Study Planner' },
];

export function Sidebar({
  collapsed,
  onToggle,
  categories,
  selectedCategory,
  onCategorySelect,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Apex
          </span>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-background transition-colors text-muted-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-background',
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground',
                collapsed && 'justify-center'
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && categories.length > 0 && (
        <div className="p-3 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3">
            Categories
          </p>
          <button
            onClick={() => onCategorySelect(null)}
            className={cn(
              'w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors',
              !selectedCategory ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-background'
            )}
          >
            All Tasks
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.id)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                selectedCategory === cat.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-background'
              )}
            >
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.colorHex }} />
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
