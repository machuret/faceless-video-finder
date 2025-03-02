
import React from 'react';
import { EditorButton } from './EditorButton';
import { Editor } from '@tiptap/react';
import { Heading1, Heading2, Heading3 } from 'lucide-react';

interface HeadingButtonsProps {
  editor: Editor;
}

export const HeadingButtons: React.FC<HeadingButtonsProps> = ({ editor }) => {
  return (
    <>
      <EditorButton 
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </EditorButton>
      <EditorButton 
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </EditorButton>
      <EditorButton 
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </EditorButton>
    </>
  );
};
