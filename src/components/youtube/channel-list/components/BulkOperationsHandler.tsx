
import React from "react";
import BulkOperationDialog from "./BulkOperationDialog";
import { useBulkOperations } from "../context/BulkOperationsContext";

const BulkOperationsHandler: React.FC = () => {
  const {
    showBulkDialog,
    closeBulkDialog,
    handleBulkDialogDone,
    currentOperation,
    isAnyProcessing,
    getCurrentProgress,
    getCurrentChannel,
    getSuccessCount,
    getErrorCount,
    getTotalCount
  } = useBulkOperations();

  return (
    <BulkOperationDialog
      showDialog={showBulkDialog}
      onClose={closeBulkDialog}
      onDone={handleBulkDialogDone}
      currentOperation={currentOperation}
      isProcessing={isAnyProcessing}
      progress={getCurrentProgress()}
      currentChannel={getCurrentChannel()}
      successCount={getSuccessCount()}
      errorCount={getErrorCount()}
      totalCount={getTotalCount()}
    />
  );
};

export default BulkOperationsHandler;
