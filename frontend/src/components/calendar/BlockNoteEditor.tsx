import { useEffect, useRef } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';

interface BlockNoteEditorProps {
  initialContent?: string;
  onChange: (json: string) => void;
}

export function BlockNoteEditor({ initialContent, onChange }: BlockNoteEditorProps) {
  const debounceRef = useRef<number | null>(null);

  let parsedContent;
  try {
    parsedContent = initialContent ? JSON.parse(initialContent) : undefined;
  } catch {
    parsedContent = undefined;
  }

  const editor = useCreateBlockNote({
    initialContent: parsedContent,
  });

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="min-h-[300px] rounded-xl border border-border overflow-hidden [&_.bn-editor]:bg-card [&_.bn-editor]:text-foreground">
      <BlockNoteView
        editor={editor}
        onChange={() => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = window.setTimeout(() => {
            onChange(JSON.stringify(editor.document));
          }, 1000);
        }}
      />
    </div>
  );
}
