
import { Link } from "react-router-dom";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { channelTypes } from "@/components/youtube/channel-list/constants";
import { ArrowRight, Home } from "lucide-react";
import MainNavbar from "@/components/MainNavbar";

const ChannelTypes = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Navigation Bar */}
      <MainNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <h1 className="font-crimson text-3xl font-bold text-gray-800">Channel Types</h1>
        </div>
        
        <p className="font-lato text-gray-600 mb-8 max-w-3xl">
          Explore different types of YouTube channels to understand their unique characteristics, production styles, and potential for growth.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channelTypes.map((type) => (
            <Card key={type.id} className="hover:shadow-lg transition-shadow h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <CardTitle className="font-crimson text-xl mb-3">{type.label}</CardTitle>
                <p className="font-lato text-sm text-gray-600 mb-4 flex-grow">{type.description.substring(0, 120)}...</p>
                <Link 
                  to={`/channel-types/${type.id}`} 
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium font-montserrat mt-auto"
                >
                  View details <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChannelTypes;
