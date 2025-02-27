
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
        const { data, error } = await supabase
          .from("youtube_channels")
          .select("*")
          .eq("channel_type", typeId);
          
        if (error) throw error;
        
        // Cast the data to ensure it matches the Channel type
        setChannels(data as unknown as Channel[]);
      } catch (error) {
        console.error("Error fetching channels by type:", error);
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
    } catch (error) {
      console.error("Error deleting channel:", error);
    }
  };
  
  const handleSave = async (updatedChannel: Channel) => {
    try {
      const dataToUpdate = {
        ...updatedChannel,
        // When sending to Supabase, ensure we're sending the correct type
        channel_type: updatedChannel.channel_type as string
      };
      
      const { error } = await supabase
        .from("youtube_channels")
        .update(dataToUpdate)
        .eq("id", updatedChannel.id);
        
      if (error) throw error;
      
      setChannels(prevChannels => 
        prevChannels.map(channel => 
          channel.id === updatedChannel.id ? updatedChannel : channel
        )
      );
    } catch (error) {
      console.error("Error updating channel:", error);
    }
  };
  
  const handleGenerateContent = async (channel: Channel) => {
    setGeneratingContent(true);
    try {
      // Implementation for generating content would go here
      console.log("Generating content for channel:", channel.id);
      // Placeholder timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setGeneratingContent(false);
    }
  };
  
  if (!typeInfo) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Channel Type Not Found</h1>
          <p>The requested channel type does not exist.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <Button 
        variant="outline" 
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      <Card className="p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{typeInfo.label}</h1>
        <p className="text-gray-600 mb-4">{typeInfo.description}</p>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Typical Production</h3>
          <p>{typeInfo.production}</p>
        </div>
        
        <div className="mt-4">
          <h3 className="font-medium mb-2">Examples</h3>
          <p>{typeInfo.example}</p>
        </div>
      </Card>
      
      <h2 className="text-xl font-semibold mb-4">Channels of this type</h2>
      
      {loading ? (
        <div>Loading channels...</div>
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
          <p>No channels found for this type.</p>
        </Card>
      )}
    </div>
  );
};

export default ChannelTypeDetails;
