
import { Channel } from "@/types/youtube";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/FileUpload";

interface ChannelBasicInfoProps {
  editForm: Channel;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onScreenshotChange: (url: string) => void;
}

export const ChannelBasicInfo = ({ 
  editForm, 
  onChange, 
  onScreenshotChange 
}: ChannelBasicInfoProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Channel Screenshot</label>
        <FileUpload
          onUploadComplete={onScreenshotChange}
          currentUrl={editForm?.screenshot_url || null}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Channel Title</label>
          <Input
            name="channel_title"
            value={editForm?.channel_title || ""}
            onChange={onChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Video ID</label>
          <Input
            name="video_id"
            value={editForm?.video_id || ""}
            onChange={onChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Channel URL</label>
          <Input
            name="channel_url"
            value={editForm?.channel_url || ""}
            onChange={onChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <Input
            type="date"
            name="start_date"
            value={editForm?.start_date || ""}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
};
