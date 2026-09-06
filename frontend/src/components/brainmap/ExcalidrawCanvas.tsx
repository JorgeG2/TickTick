import { useCallback, useMemo, useRef } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

interface ExcalidrawCanvasProps {
  initialData?: string;
  onChange: (json: string) => void;
  /** Sizing for the canvas shell. Defaults to a fixed height. */
  className?: string;
}

/**
 * Excalidraw's appState mixes durable drawing preferences with runtime-only
 * values. `collaborators` is the dangerous one: it is a Map, so JSON.stringify
 * flattens it to `{}`, and on restore Excalidraw calls .forEach on it and
 * throws. Persisting an explicit allowlist keeps saved canvases loadable.
 *
 * Scroll and zoom are deliberately excluded: restoring them reopens the canvas
 * wherever it was last left, which strands the drawing off-screen behind a
 * "Scroll back to content" prompt. Omitting them lets Excalidraw frame the
 * content itself.
 */
const PERSISTED_APP_STATE_KEYS = [
  'viewBackgroundColor',
  'currentItemStrokeColor',
  'currentItemBackgroundColor',
  'currentItemFillStyle',
  'currentItemStrokeWidth',
  'currentItemStrokeStyle',
  'currentItemRoughness',
  'currentItemOpacity',
  'currentItemFontFamily',
  'currentItemFontSize',
  'currentItemTextAlign',
  'currentItemStartArrowhead',
  'currentItemEndArrowhead',
  'currentItemRoundness',
  'gridSize',
];

function pickAppState(appState: unknown): Record<string, unknown> {
  if (!appState || typeof appState !== 'object') return {};
  const source = appState as Record<string, unknown>;
  const picked: Record<string, unknown> = {};
  for (const key of PERSISTED_APP_STATE_KEYS) {
    if (source[key] !== undefined) picked[key] = source[key];
  }
  return picked;
}

export function ExcalidrawCanvas({ initialData, onChange, className }: ExcalidrawCanvasProps) {
  const debounceRef = useRef<number | null>(null);
  const { theme } = useTheme();

  const parsedData = useMemo(() => {
    if (!initialData) return undefined;
    try {
      const parsed = JSON.parse(initialData);
      // Canvases saved before the allowlist existed still carry the bad
      // `collaborators` shape, so sanitise on the way in as well as out.
      if (parsed && typeof parsed === 'object') {
        parsed.appState = pickAppState(parsed.appState);
      }
      return parsed;
    } catch {
      return undefined;
    }
  }, [initialData]);

  const handleChange = useCallback(
    (elements: readonly unknown[], appState: unknown) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        onChange(JSON.stringify({ elements, appState: pickAppState(appState) }));
      }, 1500);
    },
    [onChange]
  );

  return (
    <div className={cn('rounded-xl border border-border overflow-hidden', className ?? 'h-[400px]')}>
      <Excalidraw initialData={parsedData} onChange={handleChange} theme={theme} />
    </div>
  );
}
