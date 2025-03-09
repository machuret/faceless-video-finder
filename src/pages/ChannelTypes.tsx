
import { Link } from "react-router-dom";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { channelTypes } from "@/components/youtube/channel-list/constants";
import { ArrowRight } from "lucide-react";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Array of background images for random selection
const backgroundImages = [
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80",
];

interface ChannelTypeData {
  id: string;
  label: string;
  description: string;
  production?: string;
  example?: string;
  image_url?: string;
}

const ChannelTypes = () => {
  const [backgroundImage, setBackgroundImage] = useState("");
  const [types, setTypes] = useState<ChannelTypeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Select a random background image
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    setBackgroundImage(backgroundImages[randomIndex]);
    
    // Fetch channel types from database
    fetchChannelTypes();
  }, []);
  
  const fetchChannelTypes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('channel_types')
        .select('*')
        .order('label');
        
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        setTypes(data);
      } else {
        // Fallback to constants if no data in database
        setTypes(channelTypes.map(type => ({
          id: type.id,
          label: type.label,
          description: type.description
        })));
      }
    } catch (error) {
      console.error("Error fetching channel types:", error);
      toast.error("Failed to load channel types");
      // Fallback to constants
      setTypes(channelTypes.map(type => ({
        id: type.id,
        label: type.label,
        description: type.description
      })));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Navigation Bar */}
      <MainNavbar />
      
      <div 
        className="bg-cover bg-center h-64 flex items-center justify-center mb-8"
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})` }}
      >
        <div className="text-center text-white max-w-3xl mx-auto px-4">
          <h1 className="font-crimson text-4xl font-bold mb-4 text-center">Channel Types</h1>
          <p className="font-lato text-lg text-center">
            Explore different types of YouTube channels to understand their unique characteristics, 
            production styles, and potential for growth.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {types.map((type) => (
              <Card key={type.id} className="hover:shadow-lg transition-shadow h-full overflow-hidden">
                {type.image_url && (
                  <div className="w-full h-48 overflow-hidden">
                    <img 
                      src={type.image_url} 
                      alt={type.label}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                    />
                  </div>
                )}
                <CardContent className={`p-6 flex flex-col ${type.image_url ? 'h-auto' : 'h-full'}`}>
                  <CardTitle className="font-crimson text-xl mb-3">{type.label}</CardTitle>
                  <p className="font-lato text-sm text-gray-600 mb-4 flex-grow">
                    {typeof type.description === 'string' ? 
                      type.description.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...' : 
                      type.description?.substring(0, 120) + '...'}
                  </p>
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
        )}
      </div>
      
      <PageFooter />
    </div>
  );
};

export default ChannelTypes;
