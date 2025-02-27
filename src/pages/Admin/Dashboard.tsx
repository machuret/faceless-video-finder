
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { CSVUploader } from "@/components/youtube/CSVUploader";
import { ChannelList } from "@/components/youtube/ChannelList";
import type { Channel, ChannelSize, UploadFrequency, DatabaseChannelType } from "@/types/youtube";

const calculatePotentialRevenue = (totalViews: number | null, cpm: number | null): number | null => {
  if (!totalViews || !cpm) return null;
  return Math.round((totalViews / 1000) * cpm);
};

const calculateRevenuePerVideo = (
  totalViews: number | null, 
  cpm: number | null, 
  videoCount: number | null
): number | null => {
  if (!totalViews || !cpm || !videoCount || videoCount === 0) return null;
  return Math.round(((totalViews / 1000) * cpm) / videoCount);
};

const calculateRevenuePerMonth = (
  totalViews: number | null,
  cpm: number | null,
  startDate: string | null
): number | null => {
  if (!totalViews || !cpm || !startDate) return null;

  const start = new Date(startDate);
  const now = new Date();
  const monthsDiff = (now.getFullYear() - start.getFullYear()) * 12 + 
                    (now.getMonth() - start.getMonth());
  
  if (monthsDiff === 0) {
    return Math.round((totalViews / 1000) * cpm);
  }

  const averageViewsPerMonth = totalViews / monthsDiff;
  
  return Math.round((averageViewsPerMonth / 1000) * cpm);
};

const getChannelSize = (subscribers: number | null): ChannelSize => {
  if (!subscribers) return "small";
  
  if (subscribers >= 1_000_000) return "big";
  if (subscribers >= 100_000) return "larger";
  if (subscribers >= 10_000) return "established";
  if (subscribers >= 1_000) return "growing";
  return "small";
};

const getGrowthRange = (size: ChannelSize): string => {
  switch (size) {
    case "big":
      return "10,000 - 50,000";
    case "larger":
      return "2,000 - 10,000";
    case "established":
      return "500 - 2,000";
    case "growing":
      return "100 - 500";
    case "small":
      return "10 - 100";
  }
};

const calculateUploadFrequency = (startDate: string | null, videoCount: number | null): number | null => {
  if (!startDate || !videoCount) return null;

  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  
  return videoCount / diffWeeks;
};

const getUploadFrequencyCategory = (frequency: number | null): UploadFrequency => {
  if (!frequency || frequency <= 0.25) return "very_low";
  if (frequency <= 0.5) return "low";
  if (frequency <= 1) return "medium";
  if (frequency <= 2) return "high";
  if (frequency <= 3) return "very_high";
  return "insane";
};

const getUploadFrequencyLabel = (frequency: number | null): string => {
  if (!frequency) return "N/A";
  const videosPerMonth = frequency * 4; // Convert weekly to monthly
  return `${frequency.toFixed(1)} videos/week (${Math.round(videosPerMonth)} per month)`;
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const mapToDatabaseChannelType = (uiChannelType: string | undefined): DatabaseChannelType => {
  if (uiChannelType === "creator" || uiChannelType === "brand" || uiChannelType === "media") {
    return uiChannelType;
  }
  return "other";
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingContent, setGeneratingContent] = useState(false);

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setChannels(data as Channel[] || []);
    } catch (error) {
      toast.error("Failed to fetch channels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const generateContent = async (channel: Channel) => {
    setGeneratingContent(true);
    try {
      console.log('Calling generate-channel-content for:', channel.channel_title);
      
      const { data, error } = await supabase.functions.invoke('generate-channel-content', {
        body: { channelTitle: channel.channel_title }
      });

      if (error) throw error;

      if (!data || !data.description) {
        throw new Error('Failed to generate valid content');
      }

      const { error: updateError } = await supabase
        .from('youtube_channels')
        .update({ description: data.description })
        .eq('id', channel.id);

      if (updateError) throw updateError;

      setChannels(channels.map(c => 
        c.id === channel.id 
          ? { ...c, description: data.description }
          : c
      ));

      toast.success('Channel description updated successfully');
    } catch (error) {
      console.error('Generate content error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate content');
    } finally {
      setGeneratingContent(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this channel?")) return;

    try {
      const { error } = await supabase
        .from("youtube_channels")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setChannels(channels.filter(channel => channel.id !== id));
      toast.success("Channel deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete channel");
    }
  };

  const handleSave = async (channel: Channel) => {
    try {
      console.log("Saving channel with data:", channel);
      
      const potentialRevenue = calculatePotentialRevenue(channel.total_views, channel.cpm);
      const revenuePerVideo = calculateRevenuePerVideo(channel.total_views, channel.cpm, channel.video_count);
      const revenuePerMonth = calculateRevenuePerMonth(channel.total_views, channel.cpm, channel.start_date);

      // Process the UI channel type
      let uiChannelType = channel.channel_type;
      let dbChannelType: DatabaseChannelType = "other";
      
      // If it's one of the database types, use it directly
      if (uiChannelType === "creator" || uiChannelType === "brand" || uiChannelType === "media") {
        dbChannelType = uiChannelType as DatabaseChannelType;
      } else {
        // Store the UI type in metadata
        dbChannelType = "other";
      }

      // Get or initialize metadata
      const metadata = channel.metadata || {};
      
      // If we have a UI channel type that's not a database type, save it in metadata
      if (uiChannelType && !["creator", "brand", "media", "other"].includes(uiChannelType)) {
        metadata.ui_channel_type = uiChannelType;
      }
      
      console.log(`Mapping channel_type from "${uiChannelType}" to database type "${dbChannelType}"`);
      console.log("Metadata:", metadata);

      const dataToUpdate = {
        ...channel,
        channel_type: dbChannelType,
        metadata: metadata,
        potential_revenue: potentialRevenue,
        revenue_per_video: revenuePerVideo,
        revenue_per_month: revenuePerMonth,
        total_views: channel.total_views ? Number(channel.total_views) : null,
        total_subscribers: channel.total_subscribers ? Number(channel.total_subscribers) : null,
        video_count: channel.video_count ? Number(channel.video_count) : null,
        cpm: channel.cpm ? Number(channel.cpm) : null,
      };

      delete dataToUpdate.videoStats;
      
      console.log("Data being sent to Supabase:", dataToUpdate);

      const { error } = await supabase
        .from("youtube_channels")
        .update(dataToUpdate)
        .eq("id", channel.id);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      // Update the channel in local state, but preserve the UI channel type
      setChannels(channels.map(c => {
        if (c.id === channel.id) {
          return {
            ...dataToUpdate,
            channel_type: uiChannelType // Keep the UI channel type for display
          };
        }
        return c;
      }));
      
      toast.success("Channel updated successfully");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to update channel");
    }
  };

  const handleLogout = () => {
    navigate("/admin/login");
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>

        <div className="flex gap-4 mb-6">
          <Button onClick={() => navigate("/admin/channels/new")}>
            <Plus className="mr-2" /> Add New Channel
          </Button>
          <CSVUploader onUploadSuccess={fetchChannels} />
        </div>

        <ChannelList
          channels={channels}
          onDelete={handleDelete}
          onSave={handleSave}
          onGenerateContent={generateContent}
          generatingContent={generatingContent}
          getChannelSize={getChannelSize}
          getGrowthRange={getGrowthRange}
          calculateUploadFrequency={calculateUploadFrequency}
          getUploadFrequencyCategory={getUploadFrequencyCategory}
          getUploadFrequencyLabel={getUploadFrequencyLabel}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
};

export default Dashboard;
