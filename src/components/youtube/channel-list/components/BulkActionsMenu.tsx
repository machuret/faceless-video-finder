
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, Database, Image, KeySquare, Loader2, Tag } from "lucide-react";

interface BulkActionsMenuProps {
  disabled: boolean;
  onFetchStats: () => void;
  onGenerateTypes: () => void;
  onGenerateKeywords: () => void;
  onGenerateScreenshots: () => void;
  isProcessingStats?: boolean;
  isProcessingTypes?: boolean;
  isProcessingKeywords?: boolean;
  isProcessingScreenshots?: boolean;
}

const BulkActionsMenu: React.FC<BulkActionsMenuProps> = ({
  disabled,
  onFetchStats,
  onGenerateTypes,
  onGenerateKeywords,
  onGenerateScreenshots,
  isProcessingStats = false,
  isProcessingTypes = false,
  isProcessingKeywords = false,
  isProcessingScreenshots = false,
}) => {
  const renderActionIcon = (Icon: React.ElementType, isProcessing: boolean) => {
    return isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Icon className="w-4 h-4 mr-2" />;
  };

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={disabled}
                className="flex items-center gap-1"
              >
                Bulk Actions
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Perform actions on selected channels</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-56">
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem 
                onClick={onFetchStats} 
                className="cursor-pointer"
                disabled={isProcessingStats}
              >
                {renderActionIcon(Database, isProcessingStats)}
                {isProcessingStats ? "Fetching Stats..." : "Fetch Stats"}
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Update channel stats with latest data from YouTube</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem 
                onClick={onGenerateTypes} 
                className="cursor-pointer"
                disabled={isProcessingTypes}
              >
                {renderActionIcon(Tag, isProcessingTypes)}
                {isProcessingTypes ? "Generating Types..." : "Generate Types"}
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Use AI to classify channel types based on content</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem 
                onClick={onGenerateKeywords} 
                className="cursor-pointer"
                disabled={isProcessingKeywords}
              >
                {renderActionIcon(KeySquare, isProcessingKeywords)}
                {isProcessingKeywords ? "Generating Keywords..." : "Generate Keywords"}
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Use AI to generate relevant keywords for channels</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem 
                onClick={onGenerateScreenshots} 
                className="cursor-pointer"
                disabled={isProcessingScreenshots}
              >
                {renderActionIcon(Image, isProcessingScreenshots)}
                {isProcessingScreenshots ? "Taking Screenshots..." : "Take Screenshots"}
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Automatically capture channel page screenshots</p>
            </TooltipContent>
          </Tooltip>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};

export default BulkActionsMenu;
