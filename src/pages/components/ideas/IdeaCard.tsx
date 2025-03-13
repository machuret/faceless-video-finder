
import React, { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FacelessIdeaInfo } from '@/services/facelessIdeas';
import LazyImage from '@/components/ui/lazy-image';

interface IdeaCardProps {
  idea: FacelessIdeaInfo;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow h-full">
      {idea.image_url && (
        <div className="w-full h-40 overflow-hidden">
          <LazyImage 
            src={idea.image_url} 
            alt={idea.label}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            width={320}
            height={160}
            lowQualityUrl={idea.image_url + '?quality=10&width=50'} 
          />
        </div>
      )}
      <CardContent className="p-6">
        <h3 className="font-crimson text-xl font-semibold mb-2">{idea.label}</h3>
        
        {idea.description && (
          <p className="font-lato text-sm text-gray-600 line-clamp-3">
            {idea.description.substring(0, 100)}
            {idea.description.length > 100 ? "..." : ""}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(IdeaCard);
