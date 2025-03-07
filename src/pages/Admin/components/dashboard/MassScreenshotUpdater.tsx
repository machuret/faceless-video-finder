
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useMassScreenshotUpdate } from "./hooks/useMassScreenshotUpdate";

const MassScreenshotUpdater = () => {
  const {
    isProcessing,
    progress,
    totalChannels,
    processedChannels,
    startMassUpdate
  } = useMassScreenshotUpdate();

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Mass Screenshot Updater</h2>
      <p className="text-gray-600 mb-4">
        Update screenshots for all YouTube channels in the database. This process may take several minutes.
      </p>
      
      {isProcessing && (
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span>Progress: {processedChannels} of {totalChannels} channels</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      <Button 
        onClick={startMassUpdate} 
        disabled={isProcessing}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          "Update All Channel Screenshots"
        )}
      </Button>
    </Card>
  );
};

export default MassScreenshotUpdater;
