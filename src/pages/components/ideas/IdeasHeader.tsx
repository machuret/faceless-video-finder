
import React, { useMemo } from "react";

interface IdeasHeaderProps {
  dataUpdatedAt: number | undefined;
}

const IdeasHeader = ({ dataUpdatedAt }: IdeasHeaderProps) => {
  const formattedUpdateTime = useMemo(() => {
    if (!dataUpdatedAt) return null;
    
    const now = new Date();
    const updated = new Date(dataUpdatedAt);
    const diffMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes === 1) return '1 minute ago';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return updated.toLocaleDateString();
  }, [dataUpdatedAt]);

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="font-crimson text-3xl font-bold text-gray-800">
          Faceless Content Ideas
        </h1>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <p className="font-lato text-gray-600 max-w-3xl">
          Explore different types of faceless YouTube content ideas to inspire your next video creation. 
          These ideas require minimal on-camera presence and can be produced with basic equipment.
        </p>
        
        {formattedUpdateTime && (
          <p className="text-xs text-gray-500">
            Updated: {formattedUpdateTime}
          </p>
        )}
      </div>
    </>
  );
};

export default IdeasHeader;
