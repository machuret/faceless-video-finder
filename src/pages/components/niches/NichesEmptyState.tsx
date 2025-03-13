
import React from "react";
import { Card } from "@/components/ui/card";

interface NichesEmptyStateProps {
  onRetry: () => void;
}

const NichesEmptyState = ({ onRetry }: NichesEmptyStateProps) => {
  return (
    <Card className="p-6 text-center">
      <p className="text-gray-500">No niches found. Please try refreshing the page.</p>
      <button 
        onClick={onRetry}
        className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
      >
        Refresh
      </button>
    </Card>
  );
};

export default NichesEmptyState;
