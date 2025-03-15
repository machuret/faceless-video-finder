
import React from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface UserDialogFooterProps {
  isSubmitting: boolean;
  isEditing: boolean;
  onCancel: () => void;
}

const UserDialogFooter: React.FC<UserDialogFooterProps> = ({
  isSubmitting,
  isEditing,
  onCancel
}) => {
  return (
    <DialogFooter className="mt-6">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isEditing ? "Updating..." : "Creating..."}
          </>
        ) : (
          isEditing ? "Update" : "Create"
        )}
      </Button>
    </DialogFooter>
  );
};

export default UserDialogFooter;
