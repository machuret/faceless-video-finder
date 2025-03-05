
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  onClick: (e: React.MouseEvent) => void;
}

const DeleteButton = ({ onClick }: DeleteButtonProps) => {
  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={onClick}
      className="flex items-center gap-2"
      type="button" // Explicitly set type to button to prevent form submission
    >
      <Trash2 className="h-4 w-4" />
      Delete Screenshot
    </Button>
  );
};

export default DeleteButton;
