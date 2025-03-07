
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

  const handleRefreshTopVideos = async () => {
    if (!channelUrl) {
      toast.error("Please provide a channel URL first");
      return;
    }

    setRefreshingVideos(true);
    toast.info("Refreshing top performing videos...");

    try {
      // Extract YouTube channel ID from URL
      const urlPattern = /(?:youtube\.com\/(?:channel\/|c\/|@))([\w-]+)/;
      const urlMatch = channelUrl.match(urlPattern);
      const youtubeChannelId = urlMatch ? urlMatch[1] : null;

      if (!youtubeChannelId) {
        throw new Error("Could not extract YouTube channel ID from URL");
      }

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
