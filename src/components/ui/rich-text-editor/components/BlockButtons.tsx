
import React from 'react';
import { EditorButton } from './EditorButton';
import { Editor } from '@tiptap/react';
import { Quote, Code, CodeSquare } from 'lucide-react';

interface BlockButtonsProps {
  editor: Editor;
}

export const BlockButtons: React.FC<BlockButtonsProps> = ({ editor }) => {
  return (
    <>
      <EditorButton 
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </EditorButton>
      <EditorButton 
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title="Inline Code"
      >
        <Code className="h-4 w-4" />
      </EditorButton>
      <EditorButton 
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        title="Code Block"
      >
        <CodeSquare className="h-4 w-4" />
      </EditorButton>
    </>
  );
};
