
import { useState, useEffect } from "react";
import { Channel, VideoStats } from "@/types/youtube";
import { Button } from "@/components/ui/button";
import { ChannelBasicInfo } from "./form-sections/ChannelBasicInfo";
import { ChannelStatsForm } from "./form-sections/ChannelStats"; 
import { ChannelVideoStats } from "./form-sections/ChannelVideoStats";
import { ChannelCategories } from "./form-sections/ChannelCategories";
import { ChannelDescription } from "./form-sections/ChannelDescription";
import { KeywordsInput } from "./KeywordsInput";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ChannelEditFormProps {
  editForm: Channel;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export const ChannelEditForm = ({ 
  editForm, 
  onChange, 
  onSave, 
  onCancel,
  isSaving = false
}: ChannelEditFormProps) => {
  const [keywords, setKeywords] = useState<string[]>(editForm.keywords || []);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [videoStats, setVideoStats] = useState<VideoStats[]>(editForm.videoStats || []);
  
  // Force update keywords when editForm changes
  useEffect(() => {
    setKeywords(editForm.keywords || []);
  }, [editForm.keywords]);

  // Update videoStats when editForm.videoStats changes
  useEffect(() => {
    if (editForm.videoStats) {
      setVideoStats(editForm.videoStats);
    }
  }, [editForm.videoStats]);

  const handleKeywordsChange = (newKeywords: string[]) => {
    setKeywords(newKeywords);
    // Create a custom update function to handle complex updates like arrays
    const updateFormValue = {
      target: {
        name: "keywords",
        value: newKeywords
      }
    };
    // Use type assertion to handle the custom event format
    onChange(updateFormValue as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  // Handler for screenshot changes
  const handleScreenshotChange = (url: string) => {
    const updateFormValue = {
      target: {
        name: "screenshot_url",
        value: url
      }
    };
    // Use type assertion to handle the custom event format
    onChange(updateFormValue as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  // Handler for channel type changes
  const handleChannelTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Get the selected channel type (from ui_channel_type field)
    const channelType = e.target.value;
    console.log(`Channel type selected: ${channelType}`);
    
    // We need to update both the channel_type field and the metadata.ui_channel_type
    // First, let's handle the metadata update
    let updatedMetadata = { ...(editForm.metadata || {}) };
    updatedMetadata.ui_channel_type = channelType;
    
    // Update the metadata
    const metadataUpdateValue = {
      target: {
        name: "metadata",
        value: updatedMetadata
      }
    };
    onChange(metadataUpdateValue as unknown as React.ChangeEvent<HTMLInputElement>);
    
    // Now also update the channel_type for backwards compatibility
    // This will be mapped to the correct database enum value in the service
    const channelTypeUpdateValue = {
      target: {
        name: "channel_type",
        value: channelType
      }
    };
    onChange(channelTypeUpdateValue as unknown as React.ChangeEvent<HTMLInputElement>);
    
    console.log("Updated channel type to:", channelType);
    console.log("Updated metadata:", updatedMetadata);
  };

  // Refresh video stats handler
  const handleRefreshStats = async () => {
    setIsLoadingStats(true);
    try {
      // Log the channel ID and video_id
      console.log("Refreshing video stats for channel ID:", editForm.id);
      console.log("Video ID for fetching:", editForm.video_id);
      
      if (!editForm.id || !editForm.video_id) {
        throw new Error("Missing channel ID or video ID");
      }
      
      // First, try to fetch existing video stats
      const { data: existingStats, error: fetchError } = await supabase
        .from('youtube_video_stats')
        .select('*')
        .eq('channel_id', editForm.id);
        
      if (fetchError) {
        console.error("Error fetching existing stats:", fetchError);
      } else {
        console.log("Found existing stats:", existingStats?.length || 0);
      }
      
      // Call the Edge Function to refresh the stats
      const response = await fetch(`https://dhbuaffdzhjzsqjfkesg.supabase.co/functions/v1/fetch-youtube-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession() ? (await supabase.auth.getSession()).data.session?.access_token : ''}`
        },
        body: JSON.stringify({
          videoId: editForm.video_id,
          channelId: editForm.id
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from fetch-youtube-data:", errorText);
        throw new Error(`Failed to refresh stats: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Stats refreshed successfully:", data);
      
      // Fetch the updated stats
      const { data: updatedStats, error: updatedError } = await supabase
        .from('youtube_video_stats')
        .select('*')
        .eq('channel_id', editForm.id);
      
      if (updatedError) {
        console.error("Error fetching updated stats:", updatedError);
        throw new Error("Failed to fetch updated video statistics");
      }
      
      console.log("Fetched updated stats:", updatedStats);
      
      if (updatedStats && updatedStats.length > 0) {
        // Update local state with the fresh data
        setVideoStats(updatedStats as VideoStats[]);
        
        // Also update the editForm with the new stats
        const mockEvent = {
          target: {
            name: "videoStats",
            value: updatedStats
          }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(mockEvent);
        
        toast.success(`Successfully refreshed stats for ${updatedStats.length} videos`);
      } else {
        toast.warning("No video statistics were found or updated");
      }
    } catch (error) {
      console.error("Error refreshing stats:", error);
      toast.error(error instanceof Error ? error.message : "Failed to refresh stats");
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Debug function to check current form state
  const debugFormState = () => {
    console.log("Current editForm state:", editForm);
    console.log("Channel type:", editForm.channel_type);
    console.log("Metadata:", editForm.metadata);
    
    // Display a toast with metadata info
    if (editForm.metadata) {
      toast.info(`Current metadata: ${JSON.stringify(editForm.metadata)}`);
    } else {
      toast.info("No metadata in current form");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Edit Channel: {editForm.channel_title}</h3>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={debugFormState}>
            Debug
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-12">
        {/* Basic Info Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <ChannelBasicInfo 
            editForm={editForm} 
            onChange={onChange} 
            onScreenshotChange={handleScreenshotChange} 
          />
        </div>

        <Separator />
        
        {/* Categories Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Categories & Classification</h3>
          <ChannelCategories 
            editForm={editForm} 
            onChange={onChange} 
            onTypeChange={handleChannelTypeChange}
          />
        </div>

        <Separator />
        
        {/* Stats Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Channel Statistics</h3>
          <ChannelStatsForm editForm={editForm} onChange={onChange} />
        </div>

        <Separator />
        
        {/* Description Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Description & Notes</h3>
          <ChannelDescription editForm={editForm} onChange={onChange} />
        </div>

        <Separator />
        
        {/* Keywords Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Keywords</h3>
          <KeywordsInput 
            keywords={keywords} 
            onChange={handleKeywordsChange} 
            channelTitle={editForm.channel_title || ""}
            description={editForm.description || ""}
            category={editForm.channel_category || ""}
          />
        </div>

        <Separator />
        
        {/* Videos Section */}
        <div>
          <ChannelVideoStats 
            videoStats={videoStats} 
            isLoading={isLoadingStats} 
            onRefresh={handleRefreshStats} 
          />
        </div>
      </div>

      <div className="flex justify-end mt-8 pt-4 border-t">
        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
