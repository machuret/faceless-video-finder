
import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3, 
  Quote, 
  Code, 
  CodeSquare 
} from 'lucide-react';

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
      <Label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
        {label}
      </Label>

      <div className="border border-input rounded-md overflow-hidden mb-1">
        <div className="flex flex-wrap items-center gap-1 p-1 border-b border-input bg-background">
          {/* Text formatting buttons */}
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-8 px-2 py-1 ${editor.isActive('bold') ? 'bg-accent text-accent-foreground' : ''}`}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`h-8 px-2 py-1 ${editor.isActive('italic') ? 'bg-accent text-accent-foreground' : ''}`}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>

          {/* Heading buttons */}
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`h-8 px-2 py-1 ${editor.isActive('heading', { level: 1 }) ? 'bg-accent text-accent-foreground' : ''}`}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`h-8 px-2 py-1 ${editor.isActive('heading', { level: 2 }) ? 'bg-accent text-accent-foreground' : ''}`}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`h-8 px-2 py-1 ${editor.isActive('heading', { level: 3 }) ? 'bg-accent text-accent-foreground' : ''}`}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>

          {/* List buttons */}
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`h-8 px-2 py-1 ${editor.isActive('bulletList') ? 'bg-accent text-accent-foreground' : ''}`}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`h-8 px-2 py-1 ${editor.isActive('orderedList') ? 'bg-accent text-accent-foreground' : ''}`}
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          {/* Blockquote button */}
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`h-8 px-2 py-1 ${editor.isActive('blockquote') ? 'bg-accent text-accent-foreground' : ''}`}
            title="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </Button>

          {/* Code buttons */}
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`h-8 px-2 py-1 ${editor.isActive('code') ? 'bg-accent text-accent-foreground' : ''}`}
            title="Inline Code"
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`h-8 px-2 py-1 ${editor.isActive('codeBlock') ? 'bg-accent text-accent-foreground' : ''}`}
            title="Code Block"
          >
            <CodeSquare className="h-4 w-4" />
          </Button>

          {/* Link button */}
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              const url = window.prompt('URL', 'https://');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            className={`h-8 px-2 py-1 ${editor.isActive('link') ? 'bg-accent text-accent-foreground' : ''}`}
            title="Link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>

        <EditorContent 
          editor={editor} 
          id={id} 
          className="prose prose-sm max-w-none p-3 min-h-[150px] focus:outline-none" 
        />
      </div>
    </div>
  );
};
