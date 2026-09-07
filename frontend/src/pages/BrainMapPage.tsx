import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export function BrainMapPage() {
  const [initialData, setInitialData] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  // Excalidraw fires onChange once on mount; without this the page would
  // re-save identical content (and flash "Saved") on every visit.
  const lastSavedRef = useRef<string | null>(null);
  const [Canvas, setCanvas] = useState<React.ComponentType<{
    initialData?: string;
    onChange: (json: string) => void;
    className?: string;
  }> | null>(null);

  // Excalidraw is a large bundle, so keep it out of the initial page load.
  useEffect(() => {
    import('@/components/brainmap/ExcalidrawCanvas').then((mod) =>
      setCanvas(() => mod.ExcalidrawCanvas)
    );
  }, []);

  useEffect(() => {
    api
      .getBrainMap()
      .then((map) => {
        setInitialData(map.excalidrawJson);
        lastSavedRef.current = map.excalidrawJson;
      })
      .catch(console.error)
      .finally(() => setLoaded(true));
  }, []);

  const save = useCallback(async (json: string) => {
    if (json === lastSavedRef.current) return;
    lastSavedRef.current = json;
    setSaveState('saving');
    try {
      await api.updateBrainMap(json);
      setSaveState('saved');
    } catch (err) {
      console.error(err);
      setSaveState('error');
    }
  }, []);

  return (
    <div className="flex h-full flex-col gap-4 animate-fade-in">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Brain Map</h1>
          <p className="text-sm text-muted-foreground mt-1">
            One central canvas for ideas, diagrams, and anything that needs space to think
          </p>
        </div>
        <SaveIndicator state={saveState} />
      </div>

      <div className="flex-1 min-h-[400px]">
        {loaded && Canvas ? (
          <Canvas
            initialData={initialData ?? undefined}
            onChange={save}
            className="h-full"
          />
        ) : (
          <div className="h-full flex items-center justify-center rounded-xl border border-border text-muted-foreground text-sm">
            Loading canvas...
          </div>
        )}
      </div>
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === 'idle') return null;
  if (state === 'saving') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving...
      </span>
    );
  }
  if (state === 'error') {
    return <span className="text-xs text-destructive shrink-0">Could not save</span>;
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-success shrink-0">
      <Check className="h-3.5 w-3.5" />
      Saved
    </span>
  );
}
