
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BarChart, Tag, FileText, ImageIcon, ChevronDown, Trash2 } from "lucide-react";

interface BulkActionsMenuProps {
  disabled: boolean;
  onFetchStats: () => void;
  onGenerateTypes: () => void;
  onGenerateKeywords: () => void;
  onGenerateScreenshots: () => void;
  onDeleteChannels?: () => void;
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
  onDeleteChannels,
  isProcessingStats = false,
  isProcessingTypes = false,
  isProcessingKeywords = false,
  isProcessingScreenshots = false
}) => {
  const isAnyProcessing = isProcessingStats || isProcessingTypes || isProcessingKeywords || isProcessingScreenshots;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={disabled || isAnyProcessing}
          className="flex items-center gap-1"
        >
          Bulk Actions
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem 
          onClick={onFetchStats}
          disabled={isProcessingStats}
          className="flex items-center gap-2"
        >
          <BarChart className="h-4 w-4" />
          Fetch Stats
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={onGenerateTypes}
          disabled={isProcessingTypes}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Generate Types
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={onGenerateKeywords}
          disabled={isProcessingKeywords}
          className="flex items-center gap-2"
        >
          <Tag className="h-4 w-4" />
          Generate Keywords
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={onGenerateScreenshots}
          disabled={isProcessingScreenshots}
          className="flex items-center gap-2"
        >
          <ImageIcon className="h-4 w-4" />
          Take Screenshots
        </DropdownMenuItem>
        
        {onDeleteChannels && (
          <DropdownMenuItem 
            onClick={onDeleteChannels}
            className="flex items-center gap-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete Channels
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BulkActionsMenu;
