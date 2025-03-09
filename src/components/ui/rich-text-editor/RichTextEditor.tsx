
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Label } from "@/components/ui/label";
import { EditorToolbar } from './components/EditorToolbar';

interface RichTextEditorProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = 'Enter content here...',
  className,
}) => {
  // Initialize editor with extensions
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(name, editor.getHTML());
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
          {label}
        </Label>
      )}

      <div className="border border-input rounded-md overflow-hidden mb-1">
        <EditorToolbar editor={editor} />
        <EditorContent 
          editor={editor} 
          id={id} 
          className="prose prose-sm max-w-none p-3 min-h-[150px] focus:outline-none" 
        />
      </div>
    </div>
  );
};
