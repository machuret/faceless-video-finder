
import { Button } from "@/components/ui/button";
import ChannelIdentity from "./form-sections/ChannelIdentity";
import ChannelStats from "./form-sections/ChannelStats";
import ChannelContent from "./form-sections/ChannelContent";
import RevenueDetails from "./form-sections/RevenueDetails";

export interface ChannelFormData {
  video_id: string;
  channel_title: string;
  channel_url: string;
  description: string;
  screenshot_url: string;
  total_subscribers: string;
  total_views: string;
  start_date: string;
  video_count: string;
  cpm: string;
}

interface ChannelFormProps {
  formData: ChannelFormData;
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onScreenshotChange: (url: string) => void;
}

const ChannelForm = ({ formData, loading, onChange, onSubmit, onScreenshotChange }: ChannelFormProps) => {
  const isEditMode = !!formData.video_id && !!formData.channel_title;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <ChannelContent
        description={formData.description}
        screenshotUrl={formData.screenshot_url}
        onChange={onChange}
        onScreenshotChange={onScreenshotChange}
      />

      <ChannelIdentity
        videoId={formData.video_id}
        channelTitle={formData.channel_title}
        channelUrl={formData.channel_url}
        onChange={onChange}
      />

      <ChannelStats
        totalSubscribers={formData.total_subscribers}
        totalViews={formData.total_views}
        videoCount={formData.video_count}
        startDate={formData.start_date}
        onChange={onChange}
      />

      <RevenueDetails
        cpm={formData.cpm}
        onChange={onChange}
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (isEditMode ? "Updating Channel..." : "Adding Channel...") : (isEditMode ? "Update Channel" : "Add Channel")}
      </Button>
    </form>
  );
};

export default ChannelForm;
