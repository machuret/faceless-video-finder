
import { Channel } from "@/types/youtube";
import { Button } from "@/components/ui/button";
import { KeywordsInput } from "./KeywordsInput";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Import section components
import { ChannelBasicInfo } from "./form-sections/ChannelBasicInfo";
import { ChannelStatsForm } from "./form-sections/ChannelStats";
import { ChannelCategories } from "./form-sections/ChannelCategories";
import { ChannelDescription } from "./form-sections/ChannelDescription";
import { ChannelVideoStats } from "./form-sections/ChannelVideoStats";

interface ChannelEditFormProps {
  editForm: Channel;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ChannelEditForm = ({ editForm, onChange, onSave, onCancel }: ChannelEditFormProps) => {
  const { data: videoStats, isLoading: isLoadingStats, refetch: refetchStats } = useQuery({
    queryKey: ["video-stats", editForm.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_video_stats")
        .select("*")
        .eq("channel_id", editForm.id);
      
      if (error) throw error;
      return data;
    },
  });

  const handleScreenshotChange = (url: string) => {
    onChange({
      target: {
        name: 'screenshot_url',
        value: url
      }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleKeywordsChange = (keywords: string[]) => {
    onChange({
      target: {
        name: 'keywords',
        value: keywords
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  const handleRefreshStats = async () => {
    try {
      const { error } = await supabase.functions.invoke('fetch-youtube-data', {
        body: { url: editForm.channel_url }
      });

      if (error) throw error;
      
      await refetchStats();
      toast.success('Video stats refreshed successfully');
    } catch (error) {
      console.error('Error refreshing stats:', error);
      toast.error('Failed to refresh video stats');
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Info Section */}
      <ChannelBasicInfo 
        editForm={editForm}
        onChange={onChange}
        onScreenshotChange={handleScreenshotChange}
      />
      
      {/* Channel Statistics Section */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Channel Statistics</h3>
        <ChannelStatsForm editForm={editForm} onChange={onChange} />
      </div>

      {/* Channel Categories Section */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Channel Categories</h3>
        <ChannelCategories editForm={editForm} onChange={onChange} />
      </div>

      {/* Keywords Section */}
      <KeywordsInput 
        keywords={editForm?.keywords || []}
        onChange={handleKeywordsChange}
        channelTitle={editForm?.channel_title || ''}
        description={editForm?.description || ''}
        category={editForm?.channel_category || 'other'}
      />

      {/* Description Section */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Description</h3>
        <ChannelDescription editForm={editForm} onChange={onChange} />
      </div>

      {/* Video Stats Section */}
      <ChannelVideoStats 
        videoStats={videoStats || null}
        isLoading={isLoadingStats}
        onRefresh={handleRefreshStats}
      />

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={onSave}>Save</Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
