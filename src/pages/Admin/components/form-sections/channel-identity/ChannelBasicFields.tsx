
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChannelBasicFieldsProps {
  channelTitle: string;
  channelUrl: string;
  description: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  channelId?: string;
}

const ChannelBasicFields = ({
  channelTitle,
  channelUrl,
  description,
  handleChange,
  channelId
}: ChannelBasicFieldsProps) => {
  const [refreshingVideos, setRefreshingVideos] = React.useState(false);

  const extractYoutubeChannelId = (url: string) => {
    if (!url) return null;
    
    // Comprehensive set of patterns to match YouTube channel IDs
    const patterns = [
      /youtube\.com\/channel\/(UC[\w-]{22})/i,         // youtube.com/channel/UC...
      /youtube\.com\/c\/(UC[\w-]{22})/i,               // youtube.com/c/UC...
      /youtube\.com\/@[\w-]+\/(UC[\w-]{22})/i,         // youtube.com/@username/UC...
      /youtube\.com\/(UC[\w-]{22})/i,                  // youtube.com/UC...
      /(UC[\w-]{22})/i                                 // Any UC... pattern
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const id = match[1];
        // Ensure proper capitalization (UC at the start)
        return id.startsWith('uc') ? 'UC' + id.substring(2) : id;
      }
    }
    
    // Special case for @username URLs - we need to fetch the channel ID
    if (url.includes('@') || url.includes('/c/')) {
      return 'fetch-needed';
    }
    
    return null;
  };

  const handleRefreshTopVideos = async () => {
    if (!channelUrl) {
      toast.error("Please provide a channel URL first");
      return;
    }

    setRefreshingVideos(true);
    toast.info("Analyzing channel URL to find YouTube ID...");

    try {
      // First try to extract YouTube channel ID directly from URL
      let youtubeChannelId = extractYoutubeChannelId(channelUrl);
      
      // If we couldn't extract an ID but the URL looks like a channel
      if (youtubeChannelId === 'fetch-needed') {
        toast.info("Looking up channel ID from username...");
        
        // Call the API to convert username to channel ID
        const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
          body: { url: channelUrl }
        });
        
        if (error) throw error;
        
        if (data?.basicInfo?.channelId) {
          youtubeChannelId = data.basicInfo.channelId;
          console.log("Got channel ID from API:", youtubeChannelId);
        } else {
          throw new Error("Could not find channel ID from username");
        }
      }
      
      if (!youtubeChannelId) {
        throw new Error("Could not extract YouTube channel ID from URL");
      }

      toast.info(`Using channel ID: ${youtubeChannelId}`);

      const { data, error } = await supabase.functions.invoke('fetch-top-videos', {
        body: { channelId: youtubeChannelId }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success("Top performing videos have been refreshed");
    } catch (error) {
      console.error("Error refreshing top videos:", error);
      toast.error(error instanceof Error ? error.message : "Failed to refresh top videos");
    } finally {
      setRefreshingVideos(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="channel_title">Channel Title</Label>
          <Input
            type="text"
            id="channel_title"
            name="channel_title"
            value={channelTitle}
            onChange={handleChange}
            placeholder="Enter channel title"
            required
          />
        </div>
        <div>
          <div className="flex flex-col">
            <Label htmlFor="channel_url">Channel URL</Label>
            <div className="flex items-center gap-2">
              <Input
                type="url"
                id="channel_url"
                name="channel_url"
                value={channelUrl}
                onChange={handleChange}
                placeholder="Enter channel URL"
                required
              />
              {channelId && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Refresh top performing videos"
                  disabled={refreshingVideos || !channelUrl}
                  onClick={handleRefreshTopVideos}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshingVideos ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1">
          <Label htmlFor="description">About</Label>
        </div>
        <Textarea
          id="description"
          name="description"
          value={description || ""}
          onChange={handleChange}
          placeholder="Enter channel about information"
          rows={3}
        />
      </div>
    </>
  );
};

export default ChannelBasicFields;
