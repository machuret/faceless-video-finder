
import React from "react";
import { Check, X } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";

type BulkOperationType = 'stats' | 'type' | 'keywords' | 'screenshot' | null;

interface BulkOperationDialogProps {
  showDialog: boolean;
  onClose: () => void;
  onDone: () => void;
  currentOperation: BulkOperationType;
  isProcessing: boolean;
  progress: number;
  currentChannel: string | null;
  successCount: number;
  errorCount: number;
  totalCount: number;
}

const BulkOperationDialog: React.FC<BulkOperationDialogProps> = ({
  showDialog,
  onClose,
  onDone,
  currentOperation,
  isProcessing,
  progress,
  currentChannel,
  successCount,
  errorCount,
  totalCount,
}) => {
  const getOperationTitle = () => {
    switch (currentOperation) {
      case 'stats': return "Fetching Channel Stats";
      case 'type': return "Generating Channel Types";
      case 'keywords': return "Generating Channel Keywords";
      case 'screenshot': return "Taking Channel Screenshots";
      default: return "Bulk Operation";
    }
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isProcessing ? `${getOperationTitle()}...` : `${getOperationTitle()} Complete`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isProcessing ? (
              <div className="space-y-4">
                <p>
                  {getOperationTitle()} for {totalCount} channels. This may take some time.
                  Please don't close this window.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Progress: {progress}%</span>
                    <span>
                      {successCount} success, {errorCount} failed
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                {currentChannel && (
                  <p className="text-sm text-muted-foreground truncate">
                    Current: {currentChannel}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p>
                  Completed {getOperationTitle().toLowerCase()} for {totalCount} channels.
                </p>
                <div className="flex justify-center gap-8">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 text-green-600 p-2 rounded-full">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">{successCount}</p>
                      <p className="text-sm text-muted-foreground">Success</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-red-100 text-red-600 p-2 rounded-full">
                      <X className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">{errorCount}</p>
                      <p className="text-sm text-muted-foreground">Failed</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {!isProcessing && (
            <AlertDialogAction onClick={onDone}>
              Done
            </AlertDialogAction>
          )}
          {isProcessing && (
            <AlertDialogCancel disabled>Cancel</AlertDialogCancel>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BulkOperationDialog;
