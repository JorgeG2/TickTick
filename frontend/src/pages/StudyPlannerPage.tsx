import { useState } from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, formatDate, type TaskDto } from '@/lib/api';

export function StudyPlannerPage() {
  const [goal, setGoal] = useState('');
  const [timelineDate, setTimelineDate] = useState('');
  const [intensity, setIntensity] = useState<'daily' | 'weekly'>('daily');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ tasksCreated: number; tasks: TaskDto[] } | null>(null);

  const handleGenerate = async () => {
    if (!goal.trim() || !timelineDate) return;
    setLoading(true);
    try {
      const res = await api.generatePlan({
        goal: goal.trim(),
        timelineDate,
        intensityLevel: intensity,
        userContext: context,
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const defaultTimeline = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return formatDate(d);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center">
        <Brain className="h-12 w-12 text-primary mx-auto mb-3" />
        <h1 className="text-2xl font-bold">AI Study Planner</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Describe your goal and let AI generate a structured study plan
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Goal</label>
          <Input
            placeholder="e.g., Pass the AWS Solutions Architect exam"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Target Date</label>
            <Input
              type="date"
              value={timelineDate || defaultTimeline()}
              onChange={(e) => setTimelineDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Intensity</label>
            <select
              value={intensity}
              onChange={(e) => setIntensity(e.target.value as 'daily' | 'weekly')}
              className="mt-1 w-full h-10 rounded-xl border border-border bg-card px-3 text-sm"
            >
              <option value="daily">Daily sessions</option>
              <option value="weekly">Weekly sessions</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Context</label>
          <textarea
            placeholder="Strengths, weaknesses, career goals, available study time..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        <Button onClick={handleGenerate} disabled={loading || !goal.trim()} className="w-full">
          <Sparkles className="h-4 w-4 mr-2" />
          {loading ? 'Generating Plan...' : 'Generate Study Plan'}
        </Button>
      </div>

      {result && (
        <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
          <h3 className="text-sm font-semibold mb-1">
            Plan Generated — {result.tasksCreated} tasks created
          </h3>
          <div className="space-y-2 mt-4">
            {result.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-background text-sm"
              >
                <span>{task.title}</span>
                <span className="text-xs text-muted-foreground">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
