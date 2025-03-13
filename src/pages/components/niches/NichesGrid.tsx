
import React from "react";
import NicheCard from "./NicheCard";

interface NichesGridProps {
  niches: string[];
  nicheDetails: Record<string, any>;
}

const NichesGrid = ({ niches, nicheDetails }: NichesGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {niches.sort().map((niche) => {
        const details = nicheDetails[niche] || { 
          name: niche, 
          description: null, 
          image_url: null, 
          example: null 
        };
        
        return (
          <NicheCard key={niche} niche={niche} details={details} />
        );
      })}
    </div>
  );
};

export default NichesGrid;
