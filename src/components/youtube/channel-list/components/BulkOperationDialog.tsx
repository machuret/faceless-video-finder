
import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { BulkOperation } from "../context/BulkOperationsContext";

interface BulkOperationDialogProps {
  showDialog: boolean;
  onClose: () => void;
  onDone: () => void;
  currentOperation: BulkOperation | null;
  isProcessing: boolean;
  progress: number;
  currentChannel: string | null;
  successCount: number;
  errorCount: number;
  totalCount: number;
}

const getOperationTitle = (operation: BulkOperation | null): string => {
  if (!operation) return "Bulk Operation";
  
  switch (operation) {
    case "stats": return "Bulk Update Channel Stats";
    case "types": return "Bulk Generate Channel Types";
    case "keywords": return "Bulk Generate Keywords";
    case "screenshots": return "Bulk Take Screenshots";
    default: return "Bulk Operation";
  }
};

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
  totalCount
}) => {
  const operationTitle = getOperationTitle(currentOperation);
  const isComplete = !isProcessing && (successCount > 0 || errorCount > 0);
  const allCompleted = successCount + errorCount >= totalCount;

  return (
    <Dialog open={showDialog} onOpenChange={(open) => {
      if (!open && !isProcessing) onClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{operationTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {isProcessing ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">
                  Processing {currentChannel && `"${currentChannel}"`}...
                </span>
              </div>
              <Progress value={progress} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">
                {currentChannel 
                  ? `Currently processing: ${currentChannel}`
                  : "Starting process..."}
              </p>
              <div className="mt-3 text-sm">
                <p>Progress: {successCount + errorCount} of {totalCount} channels processed</p>
                <p>Success: {successCount} | Errors: {errorCount}</p>
              </div>
              {errorCount > 0 && (
                <p className="text-xs text-yellow-600 mt-2">
                  Some errors occurred. You'll be able to retry failed operations after completion.
                </p>
              )}
            </>
          ) : isComplete ? (
            <>
              <h3 className="text-lg font-medium mb-2">
                {allCompleted ? "Operation Complete" : "Operation Partially Complete"}
              </h3>
              
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Successful:</span> {successCount} of {totalCount} channels
                </p>
                
                {errorCount > 0 && (
                  <p>
                    <span className="font-medium">Failed:</span> {errorCount} of {totalCount} channels
                  </p>
                )}
                
                {successCount === 0 && errorCount > 0 && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 rounded border border-red-200 text-sm">
                    <p className="font-medium">All operations failed</p>
                    <p className="text-xs mt-1">
                      Possible causes:
                    </p>
                    <ul className="text-xs mt-1 list-disc pl-4">
                      <li>API rate limits may have been exceeded</li>
                      <li>The YouTube channels may be unavailable</li>
                      <li>Network connectivity issues</li>
                      <li>The API service may be experiencing problems</li>
                    </ul>
                    <p className="text-xs mt-2">
                      Consider trying again later or with fewer channels at once.
                    </p>
                  </div>
                )}
                
                {successCount > 0 && errorCount > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 text-yellow-600 rounded border border-yellow-200 text-sm">
                    <p className="font-medium">Some operations failed</p>
                    <p className="text-xs mt-1">
                      You can retry the failed operations or try again later.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p>Preparing to process {totalCount} channels...</p>
          )}
        </div>
        
        <DialogFooter>
          {isProcessing ? (
            <Button variant="outline" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </Button>
          ) : (
            <Button onClick={onDone}>
              {isComplete ? "Done" : "Cancel"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkOperationDialog;
