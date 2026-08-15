import { useState, useEffect } from 'react';
import { Activity, Moon, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, formatDate, type HealthLogDto } from '@/lib/api';

export function HealthTrackerCard() {
  const [logs, setLogs] = useState<HealthLogDto[]>([]);
  const [steps, setSteps] = useState('');
  const [sleep, setSleep] = useState('');
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => api.getHealthLogs(14).then(setLogs).catch(console.error);
  useEffect(() => { load(); }, []);

  const todayLog = logs.find((l) => l.date === formatDate(new Date()));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.upsertHealth({
        date: formatDate(new Date()),
        steps: parseInt(steps) || todayLog?.stepCount || 0,
        sleepHours: parseFloat(sleep) || todayLog?.sleepHours || 0,
        weightLbs: parseFloat(weight) || todayLog?.weightLbs || 0,
      });
      await load();
      setSteps('');
      setSleep('');
      setWeight('');
    } finally {
      setSaving(false);
    }
  };

  const maxSteps = Math.max(...logs.map((l) => l.stepCount), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Activity} label="Steps Today" value={todayLog?.stepCount ?? 0} unit="" color="text-emerald-400" />
        <StatCard icon={Moon} label="Sleep" value={todayLog?.sleepHours ?? 0} unit="hrs" color="text-indigo-400" />
        <StatCard icon={Scale} label="Weight" value={todayLog?.weightLbs ?? 0} unit="lbs" color="text-amber-400" />
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold mb-4">Log Today's Stats</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Input placeholder="Steps" type="number" value={steps} onChange={(e) => setSteps(e.target.value)} />
          <Input placeholder="Sleep (hrs)" type="number" step="0.5" value={sleep} onChange={(e) => setSleep(e.target.value)} />
          <Input placeholder="Weight (lbs)" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {logs.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold mb-4">14-Day Step History</h3>
          <div className="flex items-end gap-1.5 h-32">
            {logs.slice(0, 14).reverse().map((log) => (
              <div key={log.id} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary/60 rounded-t-md transition-all hover:bg-primary"
                  style={{ height: `${(log.stepCount / maxSteps) * 100}%`, minHeight: '4px' }}
                  title={`${log.stepCount} steps`}
                />
                <span className="text-[9px] text-muted-foreground">
                  {new Date(log.date).getDate()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb--2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold">
        {value.toLocaleString()}
        {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
      </p>
    </div>
  );
}
