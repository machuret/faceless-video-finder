
import React from "react";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";

interface UploadProgressProps {
  processedCount: number;
  totalCount: number;
  progress: number;
  currentChannel: string;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  processedCount,
  totalCount,
  progress,
  currentChannel
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <span>Progress: {processedCount} of {totalCount} channels</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2 mb-2" />
      <p className="text-sm text-gray-500 flex items-center">
        <AlertCircle className="h-4 w-4 mr-2" />
        Currently processing: {currentChannel}
      </p>
    </div>
  );
};

export default UploadProgress;
