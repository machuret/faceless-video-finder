
import { Channel, ChannelCategory, ChannelType, ChannelSize, UploadFrequency } from "@/types/youtube";
import { Input } from "@/components/ui/input";
import { channelCategories, channelTypes, channelSizes, uploadFrequencies, countries } from "../constants";

interface ChannelCategoriesProps {
  editForm: Channel;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const ChannelCategories = ({ editForm, onChange }: ChannelCategoriesProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <select
          name="country"
          value={editForm?.country || ""}
          onChange={onChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Select a country</option>
          {countries.map(country => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
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
  );
};
