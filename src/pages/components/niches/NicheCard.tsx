
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import LazyImage from "@/components/ui/lazy-image";

interface NicheCardProps {
  niche: string;
  details: {
    name: string;
    description: string | null;
    image_url: string | null;
    example: string | null;
  };
}

const NicheCard = ({ niche, details }: NicheCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow h-full">
      {details.image_url && (
        <div className="w-full h-40 overflow-hidden">
          <LazyImage 
            src={details.image_url} 
            alt={niche}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            width={320}
            height={160}
          />
        </div>
      )}
      <CardContent className="p-6">
        <h3 className="font-crimson text-xl font-semibold mb-2">{niche}</h3>
        
        {details.description && (
          <p className="font-lato text-sm text-gray-600 mb-4 line-clamp-3">
            {details.description.substring(0, 100)}
            {details.description.length > 100 ? "..." : ""}
          </p>
        )}
        
        <Link 
          to={`/niches/${encodeURIComponent(niche)}`} 
          className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium font-montserrat mt-4"
        >
          View details <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
};

export default NicheCard;
