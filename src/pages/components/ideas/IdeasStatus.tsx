
import React from "react";
import { RefreshCcw } from "lucide-react";

interface IdeasStatusProps {
  ideas: any[];
  totalItems: number;
  isFetching: boolean;
  isLoading: boolean;
}

const IdeasStatus = ({ ideas, totalItems, isFetching, isLoading }: IdeasStatusProps) => {
  return (
    <div className="mb-4 flex justify-between items-center">
      <p className="text-sm text-gray-500">
        Showing {ideas.length} of {totalItems} ideas
      </p>
      
      {isFetching && !isLoading && (
        <div className="text-sm text-blue-500 flex items-center">
          <RefreshCcw className="h-3 w-3 mr-1 animate-spin" />
          Updating...
        </div>
      )}
    </div>
  );
};

export default IdeasStatus;
