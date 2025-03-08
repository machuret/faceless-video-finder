
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBulkOperations, BulkOperationType } from "../context/BulkOperationsContext";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const getOperationTitle = (operation: BulkOperationType): string => {
  switch (operation) {
    case 'stats': return 'Fetching Channel Stats';
    case 'type': return 'Generating Channel Types';
    case 'keywords': return 'Generating Keywords';
    case 'screenshot': return 'Taking Screenshots';
    default: return 'Processing Channels';
  }
};

const BulkOperationDialog: React.FC = () => {
  const { 
    currentOperation,
    showBulkDialog,
    closeBulkDialog,
    handleBulkDialogDone,
    isAnyProcessing,
    getCurrentProgress,
    getCurrentChannel,
    getSuccessCount,
    getErrorCount,
    getTotalCount
  } = useBulkOperations();

  const progress = getCurrentProgress();
  const currentChannel = getCurrentChannel();
  const successCount = getSuccessCount();
  const errorCount = getErrorCount();
  const totalCount = getTotalCount();
  
  const operationTitle = getOperationTitle(currentOperation);
  
  const isComplete = progress === 100 && !isAnyProcessing;
  const hasErrors = errorCount > 0;
  const allFailed = errorCount === totalCount;

  return (
    <Dialog open={showBulkDialog} onOpenChange={closeBulkDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{operationTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Progress value={progress} className="h-2 mb-2" />
          
          <div className="flex justify-between text-sm text-gray-500 mb-4">
            <span>{Math.round(progress)}% complete</span>
            <span>
              {successCount + errorCount}/{totalCount} channels
            </span>
          </div>

          {isAnyProcessing && (
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span>{currentChannel ? `Processing: ${currentChannel}` : 'Starting process...'}</span>
            </div>
          )}

          {isComplete && (
            <div className="text-sm space-y-2">
              {!allFailed ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{successCount} channels processed successfully</span>
                </div>
              ) : null}
              
              {hasErrors ? (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>Failed to process {errorCount} channels</span>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <DialogFooter>
          {isComplete ? (
            <Button onClick={handleBulkDialogDone}>Done</Button>
          ) : (
            <Button disabled={isAnyProcessing} onClick={closeBulkDialog}>Cancel</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkOperationDialog;
