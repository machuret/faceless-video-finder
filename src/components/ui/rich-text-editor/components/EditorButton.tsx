
import React from 'react';
import { Button } from "@/components/ui/button";
import { Editor } from '@tiptap/react';

interface EditorButtonProps {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}

export const EditorButton: React.FC<EditorButtonProps> = ({
  onClick,
  isActive = false,
  title,
  children,
}) => {
  return (
    <Button 
      type="button" 
      variant="ghost" 
      size="sm" 
      onClick={onClick}
      className={`h-8 px-2 py-1 ${isActive ? 'bg-accent text-accent-foreground' : ''}`}
      title={title}
    >
      {children}
    </Button>
  );
};
