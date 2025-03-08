
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ChannelSelectionControls from "./ChannelSelectionControls";

interface ChannelListHeaderProps {
  isAdmin: boolean;
  showSelectionControls: boolean;
  selectedCount: number;
  channelsLength: number;
  toggleSelectionMode: () => void;
  selectAllChannels: () => void;
  clearSelection: () => void;
  onBulkFetchStats: () => void;
  onBulkGenerateTypes: () => void;
  onBulkGenerateKeywords: () => void;
  onBulkTakeScreenshots: () => void;
  isStatsProcessing?: boolean;
  isTypeProcessing?: boolean;
  isKeywordsProcessing?: boolean;
  isScreenshotProcessing?: boolean;
}

const ChannelListHeader: React.FC<ChannelListHeaderProps> = ({
  isAdmin,
  showSelectionControls,
  selectedCount,
  channelsLength,
  toggleSelectionMode,
  selectAllChannels,
  clearSelection,
  onBulkFetchStats,
  onBulkGenerateTypes,
  onBulkGenerateKeywords,
  onBulkTakeScreenshots,
  isStatsProcessing,
  isTypeProcessing,
  isKeywordsProcessing,
  isScreenshotProcessing
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-semibold">Channels</h2>
      <div className="flex gap-2">
        {isAdmin && (
          <>
            <ChannelSelectionControls
              selectedCount={selectedCount}
              onSelectAll={selectAllChannels}
              onClearSelection={clearSelection}
              onToggleSelection={toggleSelectionMode}
              onBulkFetchStats={onBulkFetchStats}
              onBulkGenerateTypes={onBulkGenerateTypes}
              onBulkGenerateKeywords={onBulkGenerateKeywords}
              onBulkTakeScreenshots={onBulkTakeScreenshots}
              showSelectionControls={showSelectionControls}
              hasChannels={channelsLength > 0}
              isProcessingStats={isStatsProcessing}
              isProcessingTypes={isTypeProcessing}
              isProcessingKeywords={isKeywordsProcessing}
              isProcessingScreenshots={isScreenshotProcessing}
            />
            <Button 
              onClick={() => navigate("/admin/add-channel")} 
              size="sm"
            >
              Add New Channel
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChannelListHeader;
