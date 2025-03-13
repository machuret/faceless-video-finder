
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { NichesData } from "../hooks/useNichesList";

interface NichesListProps {
  niches: string[];
  loading: boolean;
  error: Error | null;
  onEdit: (niche: string) => void;
  nicheDetails: Record<string, any>;
}

const NichesList: React.FC<NichesListProps> = ({
  niches,
  loading,
  error,
  onEdit,
  nicheDetails
}) => {
  if (loading) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
        <p className="text-gray-500">Loading niches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-medium">Error</p>
        <p>{error.message}</p>
      </div>
    );
  }

  if (niches.length === 0) {
    return (
      <p className="text-center py-4 text-gray-500">
        No niches found. Add your first niche above.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {niches.sort().map((niche) => {
        const details = nicheDetails[niche];
        return (
          <div key={niche} className="flex items-center p-2 border rounded">
            {details?.image_url && (
              <img 
                src={details.image_url} 
                alt={niche}
                className="w-10 h-10 rounded object-cover mr-2" 
              />
            )}
            <span className="flex-grow truncate">{niche}</span>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(niche)}
                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
              >
                Edit
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NichesList;
