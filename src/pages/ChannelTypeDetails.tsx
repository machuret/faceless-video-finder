
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { channelTypes } from "@/components/youtube/channel-list/constants";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Channel } from "@/types/youtube";
import { ChannelList } from "@/components/youtube/ChannelList";
import { formatDate, getChannelSize, getGrowthRange, calculateUploadFrequency, getUploadFrequencyCategory, getUploadFrequencyLabel } from "@/utils/channelUtils";
import MainNavbar from "@/components/MainNavbar";
import { toast } from "sonner";

const ChannelTypeDetails = () => {
  const { typeId } = useParams<{ typeId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [generatingContent, setGeneratingContent] = useState(false);
  
  const typeInfo = channelTypes.find(type => type.id === typeId);
  
  useEffect(() => {
    if (!typeId) return;
    
    const fetchChannelsByType = async () => {
      setLoading(true);
      try {
        console.log("Fetching channels of type:", typeId);
        // Using any type here because we're dealing with a mismatch between 
        // our TypeScript types and the database schema
        const { data, error } = await supabase
          .from("youtube_channels")
          .select("*")
          .eq("channel_type", typeId as any);
          
        if (error) throw error;
        
        console.log("Fetched channels:", data);
        // Cast the data to ensure it matches the Channel type
        setChannels(data as unknown as Channel[]);
      } catch (error) {
        console.error("Error fetching channels by type:", error);
        toast.error("Error fetching channels");
      } finally {
        setLoading(false);
      }
    };
    
    fetchChannelsByType();
  }, [typeId]);
  
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("youtube_channels")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      setChannels(prevChannels => prevChannels.filter(channel => channel.id !== id));
      toast.success("Channel deleted successfully");
    } catch (error) {
      console.error("Error deleting channel:", error);
      toast.error("Failed to delete channel");
    }
  };
  
  const handleSave = async (updatedChannel: Channel) => {
    try {
      console.log("Saving updated channel:", updatedChannel);
      
      // Prepare the data for update
      const dataToUpdate = {
        ...updatedChannel,
        // Convert string values to numbers where needed
        total_views: updatedChannel.total_views ? Number(updatedChannel.total_views) : null,
        total_subscribers: updatedChannel.total_subscribers ? Number(updatedChannel.total_subscribers) : null,
        video_count: updatedChannel.video_count ? Number(updatedChannel.video_count) : null,
        cpm: updatedChannel.cpm ? Number(updatedChannel.cpm) : null,
      };
      
      // Remove properties that don't exist in the database
      delete dataToUpdate.videoStats;
      
      const { error } = await supabase
        .from("youtube_channels")
        .update(dataToUpdate)
        .eq("id", updatedChannel.id);
        
      if (error) {
        console.error("Error updating channel:", error);
        throw error;
      }
      
      setChannels(prevChannels => 
        prevChannels.map(channel => 
          channel.id === updatedChannel.id ? updatedChannel : channel
        )
      );
      
      toast.success("Channel updated successfully");
    } catch (error) {
      console.error("Error updating channel:", error);
      toast.error("Failed to update channel");
    }
  };
  
  const handleGenerateContent = async (channel: Channel) => {
    setGeneratingContent(true);
    try {
      console.log("Generating content for channel:", channel.id);
      
      const { data, error } = await supabase.functions.invoke('generate-channel-content', {
        body: { channelTitle: channel.channel_title }
      });
      
      if (error) throw error;
      
      if (!data || !data.description) {
        throw new Error("Failed to generate valid content");
      }
      
      // Update the channel description in the database
      const { error: updateError } = await supabase
        .from("youtube_channels")
        .update({ description: data.description })
        .eq("id", channel.id);
        
      if (updateError) throw updateError;
      
      // Update the description in our local state
      setChannels(prevChannels => 
        prevChannels.map(c => 
          c.id === channel.id ? { ...c, description: data.description } : c
        )
      );
      
      toast.success("Content generated successfully");
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content");
    } finally {
      setGeneratingContent(false);
    }
  };
  
  if (!typeInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-6">
            <h1 className="font-crimson text-2xl font-bold mb-4">Channel Type Not Found</h1>
            <p className="font-lato">The requested channel type does not exist.</p>
            <Button 
              variant="outline" 
              className="mt-4 font-montserrat"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          className="mb-4 font-montserrat"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <Card className="p-6 mb-6">
          <h1 className="font-crimson text-2xl font-bold mb-2">{typeInfo.label}</h1>
          <p className="font-lato text-gray-600 mb-4">{typeInfo.description}</p>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-montserrat font-medium mb-2">Typical Production</h3>
            <p className="font-lato">{typeInfo.production}</p>
          </div>
          
          <div className="mt-4">
            <h3 className="font-montserrat font-medium mb-2">Examples</h3>
            <p className="font-lato">{typeInfo.example}</p>
          </div>
        </Card>
        
        <h2 className="font-crimson text-xl font-semibold mb-4">Channels of this type</h2>
        
        {loading ? (
          <div className="text-center py-8 font-lato">Loading channels...</div>
        ) : channels.length > 0 ? (
          <ChannelList 
            channels={channels}
            onDelete={handleDelete}
            onSave={handleSave}
            onGenerateContent={handleGenerateContent}
            generatingContent={generatingContent}
            getChannelSize={getChannelSize}
            getGrowthRange={getGrowthRange}
            calculateUploadFrequency={calculateUploadFrequency}
            getUploadFrequencyCategory={getUploadFrequencyCategory}
            getUploadFrequencyLabel={getUploadFrequencyLabel}
            formatDate={formatDate}
          />
        ) : (
          <Card className="p-6">
            <p className="font-lato">No channels found for this type.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChannelTypeDetails;
