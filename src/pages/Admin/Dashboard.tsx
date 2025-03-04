import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MainNavbar from "@/components/MainNavbar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Channel } from "@/types/youtube";
import { Star } from "lucide-react";

// Import the component we need
import { ChannelList } from "@/components/youtube/channel-list/ChannelList";

const DashboardHeader = () => {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 py-4 px-4 mb-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm">Manage your YouTube channels and application settings.</p>
          </div>
          <Button onClick={async () => {
            try {
              await supabase.auth.signOut();
              toast.success("Logged out successfully");
              window.location.href = "/admin/login";
            } catch (error) {
              console.error("Error logging out:", error);
              toast.error("Error logging out");
            }
          }} variant="outline">Logout</Button>
        </div>
      </div>
    </div>
  );
};

// New component to display featured channels
const FeaturedChannels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedChannels();
  }, []);

  const fetchFeaturedChannels = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Create a properly typed array to avoid deep type instantiation
      const typedChannels: Channel[] = [];
      
      if (data) {
        for (const item of data) {
          // Explicitly construct each channel object to avoid type recursion
          typedChannels.push({
            id: item.id,
            video_id: item.video_id,
            channel_title: item.channel_title,
            channel_url: item.channel_url,
            description: item.description || undefined,
            screenshot_url: item.screenshot_url || undefined,
            total_subscribers: typeof item.total_subscribers === 'number' ? item.total_subscribers : undefined,
            total_views: typeof item.total_views === 'number' ? item.total_views : undefined,
            start_date: item.start_date || undefined,
            video_count: typeof item.video_count === 'number' ? item.video_count : undefined,
            cpm: typeof item.cpm === 'number' ? item.cpm : undefined,
            channel_type: item.channel_type || undefined,
            country: item.country || undefined,
            channel_category: item.channel_category || undefined,
            notes: item.notes || undefined,
            niche: item.niche || undefined,
            keywords: item.keywords || undefined,
            is_featured: !!item.is_featured,
            upload_frequency: item.upload_frequency || undefined,
            revenue_per_month: typeof item.revenue_per_month === 'number' ? item.revenue_per_month : undefined,
            revenue_per_video: typeof item.revenue_per_video === 'number' ? item.revenue_per_video : undefined,
            potential_revenue: typeof item.potential_revenue === 'number' ? item.potential_revenue : undefined,
            uses_ai: !!item.uses_ai,
            channel_size: item.channel_size || undefined,
            metadata: item.metadata || undefined,
            created_at: item.created_at || undefined,
            updated_at: item.updated_at || undefined,
          });
        }
      }
      
      setChannels(typedChannels);
    } catch (error) {
      console.error("Error fetching featured channels:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 mb-8">
        <div className="flex items-center mb-4">
          <Star className="text-yellow-500 h-5 w-5 mr-2" />
          <h2 className="text-xl font-semibold">Featured Channels</h2>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (channels.length === 0) {
    return (
      <Card className="p-6 mb-8">
        <div className="flex items-center mb-4">
          <Star className="text-yellow-500 h-5 w-5 mr-2" />
          <h2 className="text-xl font-semibold">Featured Channels</h2>
        </div>
        <p className="text-gray-500 mb-2">No featured channels yet.</p>
        <p className="text-sm text-gray-400">
          Use the channel list below to mark channels as featured.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center mb-4">
        <Star className="text-yellow-500 h-5 w-5 mr-2" />
        <h2 className="text-xl font-semibold">Featured Channels</h2>
      </div>
      <div className="space-y-3">
        {channels.map(channel => (
          <div key={channel.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
            <div>
              <p className="font-medium">{channel.channel_title}</p>
              <p className="text-sm text-gray-500">
                {channel.total_subscribers?.toLocaleString() || 0} subscribers • {channel.channel_type || 'N/A'}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/channel/${channel.id}`)}
            >
              View
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please log in to access the admin dashboard");
      navigate("/admin/login");
      return;
    }
    
    if (!loading && !isAdmin) {
      toast.error("You don't have permission to access this page");
      navigate("/");
      return;
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      <DashboardHeader />
      <div className="container mx-auto px-4 py-8">
        <FeaturedChannels />
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Channels</h2>
            <p className="text-gray-600 mb-4">Manage YouTube channels in the database.</p>
            <Button onClick={() => navigate("/admin/add-channel")} className="w-full">
              Add New Channel
            </Button>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Channel Types</h2>
            <p className="text-gray-600 mb-4">Manage channel types and their descriptions.</p>
            <Button onClick={() => navigate("/admin/channel-types")} className="w-full">
              Manage Channel Types
            </Button>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Faceless Ideas</h2>
            <p className="text-gray-600 mb-4">Manage faceless content ideas for YouTube creators.</p>
            <Button onClick={() => navigate("/admin/faceless-ideas")} className="w-full">
              Manage Faceless Ideas
            </Button>
          </Card>
        </div>
        
        <ChannelList isAdmin={true} />
      </div>
    </div>
  );
}
