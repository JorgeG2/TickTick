import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { HomeShoppingList } from '@/components/shopping/HomeShoppingList';
import { api, type TaskDto, type CategoryDto } from '@/lib/api';

interface OutletContext {
  selectedCategory: string | null;
}

export function DashboardPage() {
  const { selectedCategory } = useOutletContext<OutletContext>();
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);

  const load = () => {
    api.getTasks(selectedCategory ?? undefined).then(setTasks).catch(console.error);
    api.getCategories().then(setCategories).catch(console.error);
  };

  useEffect(() => { load(); }, [selectedCategory]);

  const completed = tasks.filter((t) => t.isCompleted).length;
  const pending = tasks.length - completed;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {pending} pending · {completed} completed
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <TaskBoard tasks={tasks} onUpdate={load} categories={categories} />
        </div>
        <div>
          <HomeShoppingList />
        </div>
      </div>
    </div>
  );
}
