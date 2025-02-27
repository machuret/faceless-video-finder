
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder, 
  className = "border rounded-md p-4 min-h-[200px] prose prose-sm max-w-none",
  minHeight = "200px"
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "outline-none min-h-[200px]",
        placeholder: placeholder,
      },
    },
  }, [value]); // Added value as dependency to update when it changes

  if (!editor) {
    return null;
  }

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
}
