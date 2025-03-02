
import React from 'react';
import { EditorButton } from './EditorButton';
import { Editor } from '@tiptap/react';
import { List, ListOrdered } from 'lucide-react';

interface ListButtonsProps {
  editor: Editor;
}

export const ListButtons: React.FC<ListButtonsProps> = ({ editor }) => {
  return (
    <>
      <EditorButton 
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </EditorButton>
      <EditorButton 
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </EditorButton>
    </>
  );
};
