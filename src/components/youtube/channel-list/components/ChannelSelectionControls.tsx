
import React from "react";
import { Button } from "@/components/ui/button";
import BulkActionsMenu from "./BulkActionsMenu";

interface ChannelSelectionControlsProps {
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onToggleSelection: () => void;
  onBulkFetchStats: () => void;
  onBulkGenerateTypes: () => void;
  onBulkGenerateKeywords: () => void;
  onBulkTakeScreenshots: () => void;
  showSelectionControls: boolean;
  hasChannels: boolean;
}

const ChannelSelectionControls: React.FC<ChannelSelectionControlsProps> = ({
  selectedCount,
  onSelectAll,
  onClearSelection,
  onToggleSelection,
  onBulkFetchStats,
  onBulkGenerateTypes,
  onBulkGenerateKeywords,
  onBulkTakeScreenshots,
  showSelectionControls,
  hasChannels
}) => {
  return (
    <div className="flex gap-2">
      {showSelectionControls && (
        <div className="flex items-center gap-2 mr-2">
          <span className="text-sm font-medium">
            {selectedCount} selected
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onSelectAll}
            disabled={!hasChannels}
          >
            Select All
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClearSelection}
            disabled={selectedCount === 0}
          >
            Clear
          </Button>
          
          <BulkActionsMenu 
            disabled={selectedCount === 0}
            onFetchStats={onBulkFetchStats}
            onGenerateTypes={onBulkGenerateTypes}
            onGenerateKeywords={onBulkGenerateKeywords}
            onGenerateScreenshots={onBulkTakeScreenshots}
          />
        </div>
      )}
      <Button 
        variant={showSelectionControls ? "secondary" : "outline"} 
        size="sm" 
        onClick={onToggleSelection}
      >
        {showSelectionControls ? "Exit Selection" : "Select Channels"}
      </Button>
    </div>
  );
};

export default ChannelSelectionControls;
