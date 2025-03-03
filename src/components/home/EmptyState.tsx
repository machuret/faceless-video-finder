
import React from 'react';
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  resetFilters: () => void;
  isFeatured?: boolean;
}

const EmptyState = ({ resetFilters, isFeatured = false }: EmptyStateProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <p className="text-gray-600 text-lg font-lato">No channels found matching your criteria.</p>
      {!isFeatured && (
        <Button 
          variant="outline" 
          className="mt-4 font-montserrat"
          onClick={resetFilters}
        >
          Reset filters
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
