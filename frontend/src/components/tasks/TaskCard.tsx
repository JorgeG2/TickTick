import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { api, priorityLabels, type TaskDto } from '@/lib/api';

interface TaskCardProps {
  task: TaskDto;
  onUpdate: () => void;
}

const priorityColors: Record<number, string> = {
  0: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  1: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  2: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
};

export function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const handleToggle = async () => {
    await api.toggleTask(task.id);
    onUpdate();
  };

  const handleDelete = async () => {
    await api.deleteTask(task.id);
    onUpdate();
  };

  const handleTitleBlur = async () => {
    setEditing(false);
    if (title !== task.title && title.trim()) {
      // Title inline edit would need a PUT endpoint; for now toggle handles completion
    }
  };

  const isOverdue =
    task.dueDate && !task.isCompleted && new Date(task.dueDate) < new Date();

  return (
    <div
      className={cn(
        'group flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-all',
        task.isCompleted && 'opacity-50'
      )}
    >
      <Checkbox checked={task.isCompleted} onCheckedChange={handleToggle} />

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
            className="w-full bg-transparent text-sm font-medium outline-none border-b border-primary"
            autoFocus
          />
        ) : (
          <p
            className={cn(
              'text-sm font-medium truncate cursor-text',
              task.isCompleted && 'line-through text-muted-foreground'
            )}
            onClick={() => !task.isCompleted && setEditing(true)}
          >
            {task.title}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span
            className={cn(
              'text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border',
              priorityColors[task.priority]
            )}
          >
            {priorityLabels[task.priority]}
          </span>
          {task.categoryName && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: task.categoryColor ?? '#6366f1' }} />
              {task.categoryName}
            </span>
          )}
          {task.dueDate && (
            <span className={cn('text-[10px]', isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground')}>
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
