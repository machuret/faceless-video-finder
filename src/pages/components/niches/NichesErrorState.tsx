
import React from "react";
import { Card } from "@/components/ui/card";

interface NichesErrorStateProps {
  error: Error | null;
  onRetry: () => void;
}

const NichesErrorState = ({ error, onRetry }: NichesErrorStateProps) => {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
      <p className="font-medium">Error loading niches</p>
      <p>{error instanceof Error ? error.message : "An unexpected error occurred"}</p>
      <button 
        onClick={onRetry}
        className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
};

export default NichesErrorState;
