import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskCard } from './TaskCard';
import { CreateTaskModal } from './CreateTaskModal';
import { priorityLabels, type PriorityLevel, type TaskDto } from '@/lib/api';
import { cn } from '@/lib/utils';

interface TaskBoardProps {
  tasks: TaskDto[];
  onUpdate: () => void;
  categories: { id: string; name: string; colorHex: string }[];
}

const columns: { priority: PriorityLevel; label: string; color: string }[] = [
  { priority: 0, label: 'Day', color: 'border-amber-500/40' },
  { priority: 1, label: 'Week', color: 'border-emerald-500/40' },
  { priority: 2, label: 'Month', color: 'border-indigo-500/40' },
];

export function TaskBoard({ tasks, onUpdate, categories }: TaskBoardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultPriority, setDefaultPriority] = useState<PriorityLevel>(0);

  const openCreate = (priority: PriorityLevel) => {
    setDefaultPriority(priority);
    setModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(({ priority, label, color }) => {
          const columnTasks = tasks.filter((t) => t.priority === priority);
          return (
            <div key={priority} className={cn('rounded-xl border-t-2 bg-card/50 p-4', color)}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                  <span className="ml-2 text-foreground">{columnTasks.length}</span>
                </h3>
                <Button variant="ghost" size="icon" onClick={() => openCreate(priority)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {columnTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    No {priorityLabels[priority].toLowerCase()} tasks
                  </p>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onUpdate={onUpdate} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CreateTaskModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultPriority={defaultPriority}
        categories={categories}
        onCreated={onUpdate}
      />
    </>
  );
}
