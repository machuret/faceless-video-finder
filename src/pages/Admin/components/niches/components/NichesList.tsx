
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { NichesData } from "../hooks/useNichesList";

interface NichesListProps {
  isLoading: boolean;
  nichesData: NichesData | undefined;
  onRefresh: () => Promise<void>;
  onEdit: (niche: string) => void;
  onDelete: (niche: string) => Promise<void>;
  isDeleting: boolean;
}

const NichesList: React.FC<NichesListProps> = ({
  isLoading,
  nichesData,
  onRefresh,
  onEdit,
  onDelete,
  isDeleting
}) => {
  const niches = nichesData?.niches || [];
  const nicheDetails = nichesData?.nicheDetails || {};

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Existing Niches</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : "Refresh"}
        </Button>
      </div>
      
      {isLoading ? (
        <div className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading niches...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {niches.length === 0 ? (
            <p className="col-span-full text-center py-4 text-gray-500">
              No niches found. Add your first niche above.
            </p>
          ) : (
            niches.sort().map((niche) => {
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(niche)}
                      disabled={isDeleting}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default NichesList;
