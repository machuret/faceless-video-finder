
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useMassScreenshotUpdate } from "./hooks/useMassScreenshotUpdate";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MassScreenshotUpdater = () => {
  const {
    isProcessing,
    progress,
    totalChannels,
    processedChannels,
    startMassUpdate
  } = useMassScreenshotUpdate();
  
  const [noChannelsFound, setNoChannelsFound] = useState(false);
  
  // Reset the "no channels" state when starting a new process
  useEffect(() => {
    if (isProcessing) {
      setNoChannelsFound(false);
    } else if (totalChannels === 0 && processedChannels === 0) {
      setNoChannelsFound(false);
    }
  }, [isProcessing, totalChannels, processedChannels]);

  const handleStartUpdate = async () => {
    setNoChannelsFound(false);
    const result = await startMassUpdate();
    if (totalChannels === 0) {
      setNoChannelsFound(true);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Mass Screenshot Updater</h2>
      <p className="text-gray-600 mb-4">
        Update screenshots for YouTube channels that don't have one. This process may take several minutes.
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
      
      {noChannelsFound && !isProcessing && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <AlertDescription className="text-green-700">
            All channels already have screenshots. Great job!
          </AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={handleStartUpdate} 
        disabled={isProcessing}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Camera className="h-4 w-4 mr-2" />
            Update Missing Channel Screenshots
          </>
        )}
      </Button>
    </Card>
  );
};

export default MassScreenshotUpdater;
