import { HealthTrackerCard } from '@/components/health/HealthTrackerCard';

export function HealthPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Health Tracker</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Log your daily steps, sleep, and weight
        </p>
      </div>
      <HealthTrackerCard />
    </div>
  );
}
