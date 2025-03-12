
import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { FacelessIdeaInfo } from '@/services/facelessIdeas';
import LazyImage from '@/components/ui/lazy-image';

interface IdeaCardProps {
  idea: FacelessIdeaInfo;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow h-full overflow-hidden">
      {idea.image_url ? (
        <div className="w-full h-48 overflow-hidden bg-gray-100">
          <LazyImage 
            src={idea.image_url} 
            alt={idea.label}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            width={320}
            height={160}
            lowQualityUrl={idea.image_url + '?quality=10&width=50'} 
          />
        </div>
      ) : (
        <div className="w-full h-48 overflow-hidden bg-gradient-to-r from-blue-100 to-indigo-100">
          <div className="flex items-center justify-center h-full text-blue-600 text-xl font-semibold">
            {idea.label}
          </div>
        </div>
      )}
      <CardContent className="p-6 flex flex-col h-auto">
        <CardTitle className="font-crimson text-xl mb-3">{idea.label}</CardTitle>
        <p className="font-lato text-sm text-gray-600 mb-4 flex-grow">
          {idea.description ? (
            idea.description.length > 120 ? `${idea.description.substring(0, 120)}...` : idea.description
          ) : "No description available."}
        </p>
        <Link 
          to={`/faceless-ideas/${idea.id}`} 
          className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium font-montserrat mt-auto"
        >
          View details <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(IdeaCard);
