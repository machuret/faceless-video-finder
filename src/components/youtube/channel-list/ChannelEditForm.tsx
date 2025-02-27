
import { Channel } from "@/types/youtube";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/FileUpload";
import { KeywordsInput } from "./KeywordsInput";
import { channelCategories, channelTypes, channelSizes, uploadFrequencies } from "./constants";

interface ChannelEditFormProps {
  editForm: Channel;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ChannelEditForm = ({ editForm, onChange, onSave, onCancel }: ChannelEditFormProps) => {
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

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Channel Screenshot</label>
        <FileUpload
          onUploadComplete={handleScreenshotChange}
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
          <label className="block text-sm font-medium mb-1">Total Subscribers</label>
          <Input
            type="number"
            name="total_subscribers"
            value={editForm?.total_subscribers || ""}
            onChange={onChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Total Views</label>
          <Input
            type="number"
            name="total_views"
            value={editForm?.total_views || ""}
            onChange={onChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Video Count</label>
          <Input
            type="number"
            name="video_count"
            value={editForm?.video_count || ""}
            onChange={onChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CPM</label>
          <Input
            type="number"
            name="cpm"
            value={editForm?.cpm || ""}
            onChange={onChange}
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Revenue per Video</label>
          <Input
            type="number"
            name="revenue_per_video"
            value={editForm?.revenue_per_video || ""}
            onChange={onChange}
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Monthly Revenue</label>
          <Input
            type="number"
            name="revenue_per_month"
            value={editForm?.revenue_per_month || ""}
            onChange={onChange}
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="channel_category"
            value={editForm?.channel_category || "other"}
            onChange={onChange}
            className="w-full p-2 border rounded"
          >
            {channelCategories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            name="channel_type"
            value={editForm?.channel_type || "other"}
            onChange={onChange}
            className="w-full p-2 border rounded"
          >
            {channelTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Channel Size</label>
          <select
            name="channel_size"
            value={editForm?.channel_size || "small"}
            onChange={onChange}
            className="w-full p-2 border rounded"
          >
            {channelSizes.map(size => (
              <option key={size} value={size}>
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Upload Frequency</label>
          <select
            name="upload_frequency"
            value={editForm?.upload_frequency || "medium"}
            onChange={onChange}
            className="w-full p-2 border rounded"
          >
            {uploadFrequencies.map(frequency => (
              <option key={frequency} value={frequency}>
                {frequency.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Country</label>
          <Input
            name="country"
            value={editForm?.country || ""}
            onChange={onChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Niche</label>
          <Input
            name="niche"
            value={editForm?.niche || ""}
            onChange={onChange}
          />
        </div>
      </div>

      <KeywordsInput 
        keywords={editForm?.keywords || []}
        onChange={handleKeywordsChange}
        channelTitle={editForm?.channel_title || ''}
        description={editForm?.description || ''}
        category={editForm?.channel_category || 'other'}
      />

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={editForm?.description || ""}
          onChange={onChange}
          className="w-full p-2 border rounded min-h-[100px]"
          rows={4}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          name="notes"
          value={editForm?.notes || ""}
          onChange={onChange}
          className="w-full p-2 border rounded min-h-[100px]"
          rows={4}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={onSave}>Save</Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
