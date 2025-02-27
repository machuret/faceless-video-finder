
import { useState, useEffect } from "react";
import { Channel } from "@/types/youtube";
import { Button } from "@/components/ui/button";
import { ChannelBasicInfo } from "./form-sections/ChannelBasicInfo";
import { ChannelStatsForm } from "./form-sections/ChannelStats"; 
import { ChannelVideoStats } from "./form-sections/ChannelVideoStats";
import { ChannelCategories } from "./form-sections/ChannelCategories";
import { ChannelDescription } from "./form-sections/ChannelDescription";
import { KeywordsInput } from "./KeywordsInput";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface ChannelEditFormProps {
  editForm: Channel;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ChannelEditForm = ({ editForm, onChange, onSave, onCancel }: ChannelEditFormProps) => {
  const [keywords, setKeywords] = useState<string[]>(editForm.keywords || []);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Force update keywords when editForm changes
  useEffect(() => {
    setKeywords(editForm.keywords || []);
  }, [editForm.keywords]);

  const handleKeywordsChange = (newKeywords: string[]) => {
    setKeywords(newKeywords);
    // Create a mock event to update the parent form state
    const mockEvent = {
      target: {
        name: "keywords",
        value: newKeywords
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(mockEvent);
  };

  // Handler for screenshot changes
  const handleScreenshotChange = (url: string) => {
    const mockEvent = {
      target: {
        name: "screenshot_url",
        value: url
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(mockEvent);
  };

  // Refresh video stats handler
  const handleRefreshStats = async () => {
    setIsLoadingStats(true);
    try {
      // Log the channel ID
      console.log("Refreshing video stats for channel ID:", editForm.id);
      
      const response = await fetch(`https://dhbuaffdzhjzsqjfkesg.supabase.co/functions/v1/fetch-youtube-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: editForm.video_id,
          channelId: editForm.id
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to refresh stats: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Stats refreshed successfully:", data);
      toast.success("Stats refreshed successfully");
      
      // Force refresh the page to show the updated stats
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing stats:", error);
      toast.error(error instanceof Error ? error.message : "Failed to refresh stats");
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Log the content of editForm for debugging
  console.log("Current editForm:", editForm);
  // Specifically log video stats for debugging
  console.log("Video stats in form:", editForm.videoStats);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Edit Channel: {editForm.channel_title}</h3>
        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onSave}>Save Changes</Button>
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
          <ChannelCategories editForm={editForm} onChange={onChange} />
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
          <h3 className="text-lg font-semibold mb-4">Video Statistics</h3>
          <ChannelVideoStats 
            videoStats={editForm.videoStats || []} 
            isLoading={isLoadingStats} 
            onRefresh={handleRefreshStats} 
          />
        </div>
      </div>

      <div className="flex justify-end mt-8 pt-4 border-t">
        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};
