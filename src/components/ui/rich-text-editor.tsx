import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Heading1, Heading2, Heading3 } from 'lucide-react'

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
  className = "border rounded-md p-4 min-h-[200px] prose prose-sm max-w-none bg-white",
  minHeight = "200px"
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'mb-2',
          },
        },
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'font-bold',
          },
        },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start typing here...',
        showOnlyWhenEditable: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "outline-none min-h-[200px] p-2",
      },
      handleKeyDown: (view, event) => {
        if (event.key === ' ') {
          return false;
        }
        return false;
      },
    },
  }, []);

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const setLink = () => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    if (url === null) {
      return;
    }
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: formattedUrl }).run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={className} onClick={(e) => e.stopPropagation()}>
      <div className="border-b mb-4 pb-2 flex flex-wrap gap-2 items-center">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
          type="button"
          title="Bold"
          onMouseDown={(e) => e.preventDefault()}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
          type="button"
          title="Italic"
          onMouseDown={(e) => e.preventDefault()}
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
          type="button"
          title="Heading 1"
          onMouseDown={(e) => e.preventDefault()}
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
          type="button"
          title="Heading 2"
          onMouseDown={(e) => e.preventDefault()}
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
          type="button"
          title="Heading 3"
          onMouseDown={(e) => e.preventDefault()}
        >
          <Heading3 className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
          type="button"
          title="Bullet List"
          onMouseDown={(e) => e.preventDefault()}
        >
          <List className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
          type="button"
          title="Numbered List"
          onMouseDown={(e) => e.preventDefault()}
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          onClick={setLink}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
          type="button"
          title="Add Link"
          onMouseDown={(e) => e.preventDefault()}
        >
          <LinkIcon className="h-4 w-4" />
        </button>
      </div>
      <EditorContent editor={editor} className="prose prose-sm max-w-none" onClick={(e) => {
        e.stopPropagation();
        if (editor && !editor.isActive('focus')) {
          editor.commands.focus();
        }
      }} />
    </div>
  );
}
