
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

interface ChannelType {
  id: string;
  label: string;
  description?: string;
  image_url?: string | null;
}

interface OtherChannelTypeCardProps {
  type: ChannelType;
}

const OtherChannelTypeCard = ({ type }: OtherChannelTypeCardProps) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {type.image_url && (
        <div className="w-full h-32 overflow-hidden">
          <img 
            src={type.image_url} 
            alt={type.label}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
          />
        </div>
      )}
      <Link to={`/channel-types/${type.id}`} className="flex-grow p-4 hover:bg-gray-50 transition-colors">
        <h3 className="text-lg font-semibold mb-2">{type.label}</h3>
        <p className="text-sm text-gray-700 line-clamp-3">
          {type.description?.replace(/<[^>]*>?/gm, '') || ''}
        </p>
      </Link>
      <div className="p-3 bg-blue-50 border-t">
        <Link 
          to={`/channel-types/${type.id}`}
          className="text-blue-600 hover:underline text-sm font-medium flex items-center justify-center"
        >
          View Details
        </Link>
      </div>
    </Card>
  );
};

export default OtherChannelTypeCard;
