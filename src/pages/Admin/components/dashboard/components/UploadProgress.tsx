
import React from "react";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface UploadProgressProps {
  processedCount: number;
  totalCount: number;
  progress: number;
  currentChannel: string;
  errorCount?: number;
  successCount?: number;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  processedCount,
  totalCount,
  progress,
  currentChannel,
  errorCount = 0,
  successCount = 0
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <span>Progress: {processedCount} of {totalCount} channels</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2 mb-2" />
      
      <div className="space-y-2">
        <p className="text-sm text-gray-500 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          Currently processing: {currentChannel}
        </p>
        
        {(successCount > 0 || errorCount > 0) && (
          <div className="flex space-x-4 text-sm">
            {successCount > 0 && (
              <p className="text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Success: {successCount}
              </p>
            )}
            
            {errorCount > 0 && (
              <p className="text-red-600 flex items-center">
                <XCircle className="h-4 w-4 mr-2" />
                Failed: {errorCount}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadProgress;
