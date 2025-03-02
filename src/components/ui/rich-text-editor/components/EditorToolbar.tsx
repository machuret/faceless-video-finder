
import React from 'react';
import { Editor } from '@tiptap/react';
import { FormattingButtons } from './FormattingButtons';
import { HeadingButtons } from './HeadingButtons';
import { ListButtons } from './ListButtons';
import { BlockButtons } from './BlockButtons';
import { LinkButton } from './LinkButton';

interface EditorToolbarProps {
  editor: Editor;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-1 border-b border-input bg-background">
      <FormattingButtons editor={editor} />
      <HeadingButtons editor={editor} />
      <ListButtons editor={editor} />
      <BlockButtons editor={editor} />
      <LinkButton editor={editor} />
    </div>
  );
};
