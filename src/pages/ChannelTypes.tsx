
import { Link } from "react-router-dom";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { channelTypes } from "@/components/youtube/channel-list/constants";
import { ArrowRight } from "lucide-react";

const ChannelTypes = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Channel Types</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channelTypes.map((type) => (
          <Card key={type.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <CardTitle className="mb-2">{type.label}</CardTitle>
              <p className="text-sm text-gray-600 mb-4">{type.description.substring(0, 120)}...</p>
              <Link 
                to={`/channel-types/${type.id}`} 
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
              >
                View details <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChannelTypes;
