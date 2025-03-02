
import React from 'react';
import { EditorButton } from './EditorButton';
import { Editor } from '@tiptap/react';
import { Link as LinkIcon } from 'lucide-react';

interface LinkButtonProps {
  editor: Editor;
}

export const LinkButton: React.FC<LinkButtonProps> = ({ editor }) => {
  const handleLinkClick = () => {
    const url = window.prompt('URL', 'https://');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <EditorButton 
      onClick={handleLinkClick}
      isActive={editor.isActive('link')}
      title="Link"
    >
      <LinkIcon className="h-4 w-4" />
    </EditorButton>
  );
};
