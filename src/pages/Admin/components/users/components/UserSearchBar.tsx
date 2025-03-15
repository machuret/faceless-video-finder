
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCw, Trash2 } from "lucide-react";

interface UserSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  selectedCount: number;
  onBulkDelete: () => void;
}

const UserSearchBar: React.FC<UserSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onRefresh,
  selectedCount,
  onBulkDelete
}) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      
      {selectedCount > 0 && (
        <Button 
          variant="destructive" 
          onClick={onBulkDelete}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete Selected ({selectedCount})
        </Button>
      )}
      
      <Button variant="outline" onClick={onRefresh}>
        <RotateCw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default UserSearchBar;
