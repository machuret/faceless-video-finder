
import { Link } from "react-router-dom";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface ChannelTypeCardProps {
  id: string;
  label: string;
  description: string | null;
  image_url?: string | null;
}

const ChannelTypeCard = ({ id, label, description, image_url }: ChannelTypeCardProps) => {
  return (
    <Card key={id} className="hover:shadow-lg transition-shadow h-full overflow-hidden">
      {image_url ? (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={image_url} 
            alt={label}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="w-full h-48 overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
          <span className="text-blue-600 text-xl font-semibold">{label}</span>
        </div>
      )}
      
      <CardContent className={`p-6 flex flex-col ${image_url ? 'h-auto' : 'h-full'}`}>
        <CardTitle className="font-crimson text-xl mb-3">{label}</CardTitle>
        <p className="font-lato text-sm text-gray-600 mb-4 flex-grow">
          {typeof description === 'string' ? 
            (description.replace(/<[^>]*>?/gm, '').length > 120 ? 
              description.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...' : 
              description.replace(/<[^>]*>?/gm, '')
            ) : 
            'No description available'}
        </p>
        <Link 
          to={`/channel-types/${id}`} 
          className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium font-montserrat mt-auto"
        >
          View details <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
};

export default ChannelTypeCard;
