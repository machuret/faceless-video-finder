
import React from "react";
import { Button } from "@/components/ui/button";
import { Activity, RefreshCw, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useMassStatsUpdate } from "./hooks/useMassStatsUpdate";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const MassStatsUpdater = () => {
  const {
    isProcessing,
    progress,
    totalCount,
    processedCount,
    successCount,
    errorCount,
    currentChannel,
    errors,
    startMassUpdate,
    cancelUpdate
  } = useMassStatsUpdate();

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Mass Stats Updater</h2>
      <p className="text-gray-600 mb-4">
        Fetch and update statistics for YouTube channels with missing data. This process may take several minutes.
      </p>
      
      {isProcessing && (
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span>Progress: {processedCount} of {totalCount} channels</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 mb-2" />
          
          {currentChannel && (
            <div className="text-sm text-gray-600 mt-2">
              Currently processing: <span className="font-medium">{currentChannel}</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm mt-2">
            <span className="text-green-600">Success: {successCount}</span>
            <span className="text-red-600">Failed: {errorCount}</span>
          </div>

          {errors && errors.length > 0 && (
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="errors">
                <AccordionTrigger>
                  <span className="text-red-500">Errors ({errors.length})</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="max-h-40 overflow-y-auto">
                    <ul className="text-sm text-red-500 list-disc pl-5">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
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
              <Activity className="h-4 w-4 mr-2" />
              Update Missing Stats
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

export default MassStatsUpdater;
