import { useCallback, useRef } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { useTheme } from '@/lib/theme';

interface ExcalidrawCanvasProps {
  initialData?: string;
  onChange: (json: string) => void;
}

export function ExcalidrawCanvas({ initialData, onChange }: ExcalidrawCanvasProps) {
  const debounceRef = useRef<number | null>(null);
  const { theme } = useTheme();

  let parsedData;
  try {
    parsedData = initialData ? JSON.parse(initialData) : undefined;
  } catch {
    parsedData = undefined;
  }

  const handleChange = useCallback(
    (elements: readonly unknown[], appState: unknown) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        onChange(JSON.stringify({ elements, appState }));
      }, 1500);
    },
    [onChange]
  );

  return (
    <div className="h-[400px] rounded-xl border border-border overflow-hidden">
      <Excalidraw
        initialData={parsedData}
        onChange={handleChange}
        theme={theme}
      />
    </div>
  );
}
