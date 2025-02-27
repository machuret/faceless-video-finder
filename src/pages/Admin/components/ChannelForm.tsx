
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/FileUpload";

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
}

interface ChannelFormProps {
  formData: ChannelFormData;
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onScreenshotChange: (url: string) => void;
}

const ChannelForm = ({ formData, loading, onChange, onSubmit, onScreenshotChange }: ChannelFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Channel Screenshot</label>
        <FileUpload
          onUploadComplete={onScreenshotChange}
          currentUrl={formData.screenshot_url}
        />
      </div>
      <div>
        <Input
          name="video_id"
          placeholder="Channel ID"
          value={formData.video_id}
          onChange={onChange}
          required
        />
      </div>
      <div>
        <Input
          name="channel_title"
          placeholder="Channel Title"
          value={formData.channel_title}
          onChange={onChange}
          required
        />
      </div>
      <div>
        <Input
          name="channel_url"
          placeholder="Channel URL"
          value={formData.channel_url}
          onChange={onChange}
          required
        />
      </div>
      <div>
        <Input
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={onChange}
        />
      </div>
      <div>
        <Input
          name="start_date"
          placeholder="Start Date"
          type="date"
          value={formData.start_date}
          onChange={onChange}
        />
      </div>
      <div>
        <Input
          name="total_subscribers"
          placeholder="Total Subscribers"
          type="number"
          value={formData.total_subscribers}
          onChange={onChange}
        />
      </div>
      <div>
        <Input
          name="total_views"
          placeholder="Total Views"
          type="number"
          value={formData.total_views}
          onChange={onChange}
        />
      </div>
      <div>
        <Input
          name="video_count"
          placeholder="Number of Videos"
          type="number"
          value={formData.video_count}
          onChange={onChange}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Adding Channel..." : "Add Channel"}
      </Button>
    </form>
  );
};

export default ChannelForm;
