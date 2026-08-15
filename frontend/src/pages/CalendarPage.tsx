import { useState, useEffect } from 'react';
import { CalendarGridView } from '@/components/calendar/CalendarGridView';
import { api, type TaskDto } from '@/lib/api';

export function CalendarPage() {
  const [tasks, setTasks] = useState<TaskDto[]>([]);

  useEffect(() => {
    api.getTasks().then(setTasks).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Click any day to add notes or draw on the canvas
        </p>
      </div>
      <CalendarGridView tasks={tasks} />
    </div>
  );
}
