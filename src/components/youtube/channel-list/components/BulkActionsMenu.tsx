
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Database, Image, KeySquare, Tag } from "lucide-react";

interface BulkActionsMenuProps {
  disabled: boolean;
  onFetchStats: () => void;
  onGenerateTypes: () => void;
  onGenerateKeywords: () => void;
  onGenerateScreenshots: () => void;
}

const BulkActionsMenu: React.FC<BulkActionsMenuProps> = ({
  disabled,
  onFetchStats,
  onGenerateTypes,
  onGenerateKeywords,
  onGenerateScreenshots,
}) => {
  return (
    <DropdownMenu>
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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onFetchStats} className="cursor-pointer">
          <Database className="w-4 h-4 mr-2" />
          Fetch Stats
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onGenerateTypes} className="cursor-pointer">
          <Tag className="w-4 h-4 mr-2" />
          Generate Types
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onGenerateKeywords} className="cursor-pointer">
          <KeySquare className="w-4 h-4 mr-2" />
          Generate Keywords
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onGenerateScreenshots} className="cursor-pointer">
          <Image className="w-4 h-4 mr-2" />
          Take Screenshots
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BulkActionsMenu;
