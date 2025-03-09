
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, X, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useMassScreenshotUpdate } from "./hooks/useMassScreenshotUpdate";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

const MassScreenshotUpdater = () => {
  const {
    isProcessing,
    progress,
    totalChannels,
    processedChannels,
    errors,
    successCount,
    errorCount,
    currentChannel,
    updatedChannels,
    startMassUpdate,
    cancelUpdate
  } = useMassScreenshotUpdate();
  
  const [showSuccessDetails, setShowSuccessDetails] = useState(false);

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
          <Progress value={progress} className="h-2 mb-4" />
          
          {currentChannel && (
            <div className="text-sm text-gray-600 mt-2">
              Currently processing: <span className="font-medium">{currentChannel}</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm mt-2">
            <span className="text-green-600">Success: {successCount}</span>
            <span className="text-red-600">Failed: {errorCount}</span>
          </div>
        </div>
      )}
      
      {!isProcessing && updatedChannels.length > 0 && (
        <div className="mb-4">
          <div 
            className="flex justify-between items-center cursor-pointer p-2 hover:bg-gray-50 rounded"
            onClick={() => setShowSuccessDetails(!showSuccessDetails)}
          >
            <span className="font-medium">Successfully updated {updatedChannels.length} screenshots</span>
            {showSuccessDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
          
          {showSuccessDetails && (
            <ScrollArea className="max-h-40 mt-2">
              <div className="p-2 text-sm border rounded bg-gray-50">
                {updatedChannels.map((channel, idx) => (
                  <div key={idx} className="py-1 border-b last:border-0">
                    {channel}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
      
      {errors.length > 0 && (
        <Accordion type="single" collapsible className="mt-4 mb-4">
          <AccordionItem value="errors">
            <AccordionTrigger>
              <span className="text-red-500">Errors ({errors.length})</span>
            </AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="max-h-40">
                <ul className="text-sm text-red-500 list-disc pl-5">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      
      <div className="flex gap-2">
        <Button 
          onClick={startMassUpdate} 
          disabled={isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 mr-2" />
              Update Missing Screenshots
            </>
          )}
        </Button>
        
        {isProcessing && (
          <Button 
            onClick={cancelUpdate} 
            variant="destructive"
            size="icon"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
};

export default MassScreenshotUpdater;
