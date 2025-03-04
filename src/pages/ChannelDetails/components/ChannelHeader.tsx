
import { Globe, BarChart, Bookmark, Upload, Camera } from "lucide-react";
import { Channel } from "@/types/youtube";
import { channelTypes } from "@/components/youtube/channel-list/constants";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChannelHeaderProps {
  channel: Channel;
}

const ChannelHeader = ({ channel }: ChannelHeaderProps) => {
  const [takingScreenshot, setTakingScreenshot] = useState(false);
  
  // Get channel type label
  const getChannelTypeLabel = (typeId: string | undefined) => {
    if (!typeId) return 'N/A';
    const foundType = channelTypes.find(type => type.id === typeId);
    return foundType ? foundType.label : typeId;
  };
  
  // Format upload frequency to be more readable
  const formatUploadFrequency = (frequency: string | undefined) => {
    if (!frequency) return 'N/A';
    return frequency
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Handle taking a screenshot of the channel
  const handleTakeScreenshot = async () => {
    if (!channel.channel_url) {
      toast.error("Channel URL is required to take a screenshot");
      return;
    }
    
    setTakingScreenshot(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('take-channel-screenshot', {
        body: {
          channelUrl: channel.channel_url,
          channelId: channel.id
        }
      });
      
      if (error) {
        console.error("Error taking screenshot:", error);
        toast.error("Failed to take channel screenshot");
        return;
      }
      
      if (data.success) {
        toast.success("Channel screenshot taken successfully!");
        // Reload the page to show the updated screenshot
        window.location.reload();
      } else {
        toast.error(data.message || "Failed to take channel screenshot");
      }
    } catch (err) {
      console.error("Error invoking screenshot function:", err);
      toast.error("An error occurred while taking the screenshot");
    } finally {
      setTakingScreenshot(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-2">{channel.channel_title}</h1>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleTakeScreenshot}
            disabled={takingScreenshot}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            {takingScreenshot ? "Taking Screenshot..." : "Take Screenshot"}
          </Button>
        </div>
        {channel.niche && (
          <div className="inline-block px-3 py-1 bg-blue-500 bg-opacity-30 rounded-full text-sm font-medium">
            {channel.niche}
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Channel Information</h2>
            
            <div className="space-y-4">
              {channel.description && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-gray-700">{channel.description}</p>
                </div>
              )}
              
              {channel.channel_url && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Channel URL</h3>
                  <a 
                    href={channel.channel_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <Youtube className="h-4 w-4 mr-2" />
                    Visit YouTube Channel
                  </a>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {channel.channel_type && (
                  <div className="border rounded-md p-3">
                    <h4 className="text-sm text-gray-500 mb-1">Channel Type</h4>
                    <div className="flex items-center">
                      <BarChart className="h-4 w-4 text-blue-600 mr-2" />
                      <span>{getChannelTypeLabel(channel.metadata?.ui_channel_type || channel.channel_type.toString())}</span>
                    </div>
                  </div>
                )}
                
                {channel.channel_category && (
                  <div className="border rounded-md p-3">
                    <h4 className="text-sm text-gray-500 mb-1">Category</h4>
                    <div className="flex items-center">
                      <Bookmark className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="capitalize">{channel.channel_category}</span>
                    </div>
                  </div>
                )}
                
                {channel.country && (
                  <div className="border rounded-md p-3">
                    <h4 className="text-sm text-gray-500 mb-1">Country</h4>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-blue-600 mr-2" />
                      <span>{channel.country}</span>
                    </div>
                  </div>
                )}
                
                {channel.upload_frequency && (
                  <div className="border rounded-md p-3">
                    <h4 className="text-sm text-gray-500 mb-1">Upload Frequency</h4>
                    <div className="flex items-center">
                      <Upload className="h-4 w-4 text-blue-600 mr-2" />
                      <span>{formatUploadFrequency(channel.upload_frequency)}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {channel.keywords && channel.keywords.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {channel.keywords.map((keyword, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <ChannelStats channel={channel} />
        </div>
      </div>
    </div>
  );
};

// Need to import here due to cyclic dependency if we try to import at the top
import { Youtube } from "lucide-react";
import ChannelStats from "./ChannelStats";

export default ChannelHeader;
