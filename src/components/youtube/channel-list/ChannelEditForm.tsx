
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
  const handleRefreshStats = () => {
    setIsLoadingStats(true);
    // In a real implementation, this would fetch updated stats
    setTimeout(() => {
      setIsLoadingStats(false);
      toast.success("Stats refreshed successfully");
    }, 1000);
  };

  // Log the content of editForm for debugging
  console.log("Current editForm:", editForm);

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
