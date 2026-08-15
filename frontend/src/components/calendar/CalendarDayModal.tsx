import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { api } from '@/lib/api';

interface CalendarDayModalProps {
  date: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CalendarDayModal({ date, open, onOpenChange }: CalendarDayModalProps) {
  const [blockNoteJson, setBlockNoteJson] = useState<string | null>(null);
  const [excalidrawJson, setExcalidrawJson] = useState<string | null>(null);
  const [Editor, setEditor] = useState<React.ComponentType<{
    initialContent?: string;
    onChange: (json: string) => void;
  }> | null>(null);
  const [ExcalidrawComponent, setExcalidrawComponent] = useState<React.ComponentType<{
    initialData?: string;
    onChange: (json: string) => void;
  }> | null>(null);

  useEffect(() => {
    if (!open) return;
    api.getCalendar(date).then((entry) => {
      setBlockNoteJson(entry.blockNoteJson);
      setExcalidrawJson(entry.excalidrawJson);
    });
  }, [date, open]);

  useEffect(() => {
    import('./BlockNoteEditor').then((mod) => setEditor(() => mod.BlockNoteEditor));
    import('./ExcalidrawCanvas').then((mod) => setExcalidrawComponent(() => mod.ExcalidrawCanvas));
  }, []);

  const saveNotes = useCallback(
    async (json: string) => {
      setBlockNoteJson(json);
      await api.updateCalendar(date, { blockNoteJson: json });
    },
    [date]
  );

  const saveCanvas = useCallback(
    async (json: string) => {
      setExcalidrawJson(json);
      await api.updateCalendar(date, { excalidrawJson: json });
    },
    [date]
  );

  const formatted = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{formatted}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="notes">
          <TabsList>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="canvas">Canvas</TabsTrigger>
          </TabsList>

          <TabsContent value="notes">
            {Editor ? (
              <Editor initialContent={blockNoteJson ?? undefined} onChange={saveNotes} />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                Loading editor...
              </div>
            )}
          </TabsContent>

          <TabsContent value="canvas">
            {ExcalidrawComponent ? (
              <ExcalidrawComponent initialData={excalidrawJson ?? undefined} onChange={saveCanvas} />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                Loading canvas...
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
