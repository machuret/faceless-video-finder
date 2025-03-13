
import { Link } from "react-router-dom";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { channelTypes } from "@/components/youtube/channel-list/constants";
import { ArrowRight } from "lucide-react";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const backgroundImages = [
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&q=80",
];

interface ChannelTypeData {
  id: string;
  label: string;
  description: string | null;
  production?: string | null;
  example?: string | null;
  image_url?: string | null;
}

const fetchChannelTypes = async (): Promise<ChannelTypeData[]> => {
  try {
    console.log("Fetching channel types...");
    
    // Try using the edge function first for better reliability
    try {
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-channel-types');
      
      if (!edgeError && edgeData?.channelTypes && Array.isArray(edgeData.channelTypes) && edgeData.channelTypes.length > 0) {
        console.log(`Fetched ${edgeData.channelTypes.length} channel types via edge function`);
        return edgeData.channelTypes;
      }
    } catch (edgeCallError) {
      console.warn("Edge function fallback failed:", edgeCallError);
      // Continue to direct DB query
    }
    
    // Direct database query as fallback with explicit timeout
    const fetchPromise = supabase
      .from('channel_types')
      .select('*')
      .order('label');
    
    const timeoutPromise = new Promise<{data: null, error: Error}>((resolve) => 
      setTimeout(() => resolve({
        data: null, 
        error: new Error('Database query timeout')
      }), 8000)
    );
    
    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
      
    if (error) {
      console.error("Database query error:", error);
      throw error;
    }
    
    console.log(`Fetched ${data?.length || 0} channel types from database`);
    
    if (data && data.length > 0) {
      return data;
    }
    
    console.warn("No channel types found in database, using default list");
    // Fall back to default channel types
    return channelTypes.map(type => ({
      id: type.id,
      label: type.label,
      description: type.description
    }));
  } catch (error) {
    console.error("Error fetching channel types:", error);
    // Fall back to default channel types
    return channelTypes.map(type => ({
      id: type.id,
      label: type.label,
      description: type.description
    }));
  }
};

const ChannelTypes = () => {
  const [backgroundImage, setBackgroundImage] = useState("");
  
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    setBackgroundImage(backgroundImages[randomIndex]);
  }, []);
  
  const { data: types = [], isLoading, error, refetch } = useQuery({
    queryKey: ['channel-types'],
    queryFn: fetchChannelTypes,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attempt) => Math.min(attempt * 1000, 5000),
  });
  
  // Sort types by label and memoize to prevent unnecessary rerenders
  const sortedTypes = useMemo(() => {
    return [...types].sort((a, b) => a.label.localeCompare(b.label));
  }, [types]);

  return (
    <div className="min-h-screen bg-gray-50">
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
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-medium">Error</p>
            <p>{error instanceof Error ? error.message : "Failed to load channel types"}</p>
            <button 
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTypes.length === 0 ? (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-600 mb-4">No channel types found</p>
                <button 
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Refresh
                </button>
              </div>
            ) : (
              sortedTypes.map((type) => (
                <Card key={type.id} className="hover:shadow-lg transition-shadow h-full overflow-hidden">
                  {type.image_url ? (
                    <div className="w-full h-48 overflow-hidden">
                      <img 
                        src={type.image_url} 
                        alt={type.label}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
                      <span className="text-blue-600 text-xl font-semibold">{type.label}</span>
                    </div>
                  )}
                  <CardContent className={`p-6 flex flex-col ${type.image_url ? 'h-auto' : 'h-full'}`}>
                    <CardTitle className="font-crimson text-xl mb-3">{type.label}</CardTitle>
                    <p className="font-lato text-sm text-gray-600 mb-4 flex-grow">
                      {typeof type.description === 'string' ? 
                        (type.description.replace(/<[^>]*>?/gm, '').length > 120 ? 
                          type.description.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...' : 
                          type.description.replace(/<[^>]*>?/gm, '')
                        ) : 
                        'No description available'}
                    </p>
                    <Link 
                      to={`/channel-types/${type.id}`} 
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium font-montserrat mt-auto"
                    >
                      View details <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
      
      <PageFooter />
    </div>
  );
};

export default ChannelTypes;
