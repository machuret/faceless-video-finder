
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NicheDetail {
  name: string;
  description: string | null;
  image_url: string | null;
  example: string | null;
}

const NicheDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nicheData, setNicheData] = useState<NicheDetail | null>(null);
  const [relatedChannels, setRelatedChannels] = useState([]);

  useEffect(() => {
    if (!slug) return;
    
    const fetchNicheDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const decodedSlug = decodeURIComponent(slug);
        console.log(`Fetching details for niche: ${decodedSlug}`);
        
        // Get niche details
        const { data: nichesData, error: nichesError } = await supabase
          .from('niches')
          .select('id, name, description, image_url')
          .eq('name', decodedSlug)
          .single();
        
        if (nichesError && nichesError.code !== 'PGRST116') {
          console.error("Error fetching niche:", nichesError);
          // Continue execution to show what we have instead of stopping with an error
        }
        
        if (!nichesData) {
          // Create a default object with just the name instead of showing an error
          setNicheData({
            name: decodedSlug,
            description: null,
            image_url: null,
            example: null
          });
          setLoading(false);
          return;
        }
        
        // Get additional niche content if available
        const { data: nicheContent, error: contentError } = await supabase
          .from('niche_details')
          .select('content')
          .eq('niche_id', nichesData.id)
          .single();
        
        if (contentError && contentError.code !== 'PGRST116') { // Not PGRST116 (not found)
          console.error("Error fetching niche content:", contentError);
        }
        
        // Get related channels
        const { data: channelsData, error: channelsError } = await supabase
          .from('youtube_channels')
          .select('id, channel_title, total_subscribers, total_views, screenshot_url')
          .eq('niche', decodedSlug)
          .order('total_subscribers', { ascending: false })
          .limit(8);
        
        if (channelsError) {
          console.error("Error fetching related channels:", channelsError);
        } else {
          setRelatedChannels(channelsData || []);
        }
        
        // Set niche data
        setNicheData({
          name: nichesData.name,
          description: nichesData.description,
          image_url: nichesData.image_url,
          example: nicheContent?.content || null
        });
        
      } catch (err) {
        console.error("Error in niche details fetch:", err);
        // Still show the page with the niche name instead of an error
        if (slug) {
          setNicheData({
            name: decodeURIComponent(slug),
            description: null,
            image_url: null,
            example: null
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchNicheDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavbar />
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
        <PageFooter />
      </div>
    );
  }

  if (!nicheData) {
    // This code should never execute with our new error handling approach
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavbar />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto p-6">
            <CardContent>
              <h1 className="text-2xl font-bold text-red-600 mb-4">Niche Not Found</h1>
              <p className="mb-6">We couldn't find information for this niche.</p>
              <Link to="/niches">
                <Button variant="outline" className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Niches
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <PageFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/niches" className="text-blue-600 hover:text-blue-800 flex items-center w-fit">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Niches
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          {nicheData.image_url && (
            <div className="w-full h-64 md:h-80 overflow-hidden">
              <img 
                src={nicheData.image_url} 
                alt={nicheData.name}
                className="w-full h-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="p-6 md:p-8">
            <h1 className="font-crimson text-3xl md:text-4xl font-bold mb-4">{nicheData.name}</h1>
            
            {nicheData.description && (
              <div className="mb-6">
                <h2 className="font-semibold text-xl mb-2">About this Niche</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700">{nicheData.description}</p>
                </div>
              </div>
            )}
            
            {nicheData.example && (
              <div className="mb-6">
                <h2 className="font-semibold text-xl mb-2">Examples and Ideas</h2>
                <div className="prose max-w-none text-gray-700">
                  {nicheData.example}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {relatedChannels.length > 0 ? (
          <div className="mb-12">
            <h2 className="font-crimson text-2xl font-bold mb-6">Channels in this Niche</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedChannels.map((channel) => (
                <Link 
                  key={channel.id} 
                  to={`/channel/${channel.channel_title.toLowerCase().replace(/\s+/g, '-')}-${channel.id}`}
                  className="block"
                >
                  <Card className="h-full hover:shadow-md transition-shadow overflow-hidden">
                    {channel.screenshot_url && (
                      <div className="w-full h-32 overflow-hidden bg-gray-100">
                        <img 
                          src={channel.screenshot_url} 
                          alt={channel.channel_title}
                          className="w-full h-full object-cover" 
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-medium text-lg mb-1 truncate">{channel.channel_title}</h3>
                      <p className="text-sm text-gray-500">
                        {channel.total_subscribers ? `${(channel.total_subscribers / 1000).toFixed(1)}K subscribers` : "No subscriber data"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-12">
            <h2 className="font-crimson text-2xl font-bold mb-6">Channels in this Niche</h2>
            <Card className="p-6 text-center bg-gray-50">
              <p className="text-gray-500">No channels found for this niche yet.</p>
            </Card>
          </div>
        )}
      </div>
      
      <PageFooter />
    </div>
  );
};

export default NicheDetails;
