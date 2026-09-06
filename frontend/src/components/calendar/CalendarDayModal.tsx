import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/lib/api';

interface CalendarDayModalProps {
  date: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CalendarDayModal({ date, open, onOpenChange }: CalendarDayModalProps) {
  const [blockNoteJson, setBlockNoteJson] = useState<string | null>(null);
  const [Editor, setEditor] = useState<React.ComponentType<{
    initialContent?: string;
    onChange: (json: string) => void;
  }> | null>(null);

  useEffect(() => {
    if (!open) return;
    api.getCalendar(date).then((entry) => setBlockNoteJson(entry.blockNoteJson));
  }, [date, open]);

  useEffect(() => {
    import('./BlockNoteEditor').then((mod) => setEditor(() => mod.BlockNoteEditor));
  }, []);

  const saveNotes = useCallback(
    async (json: string) => {
      setBlockNoteJson(json);
      await api.updateCalendar(date, { blockNoteJson: json });
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

        {Editor ? (
          <Editor initialContent={blockNoteJson ?? undefined} onChange={saveNotes} />
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
            Loading editor...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
