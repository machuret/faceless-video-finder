
import React from 'react';
import { EditorButton } from './EditorButton';
import { Editor } from '@tiptap/react';
import { Bold, Italic } from 'lucide-react';

interface FormattingButtonsProps {
  editor: Editor;
}

export const FormattingButtons: React.FC<FormattingButtonsProps> = ({ editor }) => {
  return (
    <>
      <EditorButton 
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </EditorButton>
      <EditorButton 
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </EditorButton>
    </>
  );
};
