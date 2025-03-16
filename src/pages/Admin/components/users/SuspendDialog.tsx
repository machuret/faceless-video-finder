
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface SuspendDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuspend: () => void;
  onUnsuspend: () => void;
  title: string;
  description: string;
  isCurrentlySuspended: boolean;
}

const SuspendDialog: React.FC<SuspendDialogProps> = ({
  isOpen,
  onClose,
  onSuspend,
  onUnsuspend,
  title,
  description,
  isCurrentlySuspended
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {isCurrentlySuspended ? (
            <Button
              onClick={onUnsuspend}
              className="bg-green-600 hover:bg-green-700"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Unsuspend User
            </Button>
          ) : (
            <AlertDialogAction 
              onClick={onSuspend}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <ShieldAlert className="mr-2 h-4 w-4" />
              Suspend User
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SuspendDialog;
