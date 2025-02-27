import { Channel, ChannelCategory, ChannelType, ChannelSize, UploadFrequency } from "@/types/youtube";
import { Input } from "@/components/ui/input";
import { channelCategories, channelTypes, channelSizes, uploadFrequencies, countries } from "../constants";
import { niches } from "../constants/niches";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ChannelCategoriesProps {
  editForm: Channel;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const ChannelCategories = ({ editForm, onChange }: ChannelCategoriesProps) => {
  const [selectedType, setSelectedType] = useState<ChannelType | null>(editForm?.channel_type || null);
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ChannelType;
    setSelectedType(value);
    onChange(e);
  };

  const selectedTypeInfo = channelTypes.find(type => type.id === selectedType);

  return (
    <div className="space-y-6">
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
          <label className="block text-sm font-medium mb-1">Type of Faceless</label>
          <select
            name="channel_type"
            value={editForm?.channel_type || "other"}
            onChange={handleTypeChange}
            className="w-full p-2 border rounded"
          >
            {channelTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.label}
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
          <select
            name="niche"
            value={editForm?.niche || ""}
            onChange={onChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a niche</option>
            {niches.map(niche => (
              <option key={niche} value={niche}>
                {niche}
              </option>
            ))}
          </select>
          {editForm?.niche && !niches.includes(editForm.niche) && (
            <Input
              name="niche"
              value={editForm.niche}
              onChange={onChange}
              className="mt-2"
              placeholder="Custom niche"
            />
          )}
        </div>
      </div>

      {selectedTypeInfo && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-lg mb-2">{selectedTypeInfo.label}</h4>
          <div className="space-y-2">
            <p className="text-sm"><span className="font-medium">What it is:</span> {selectedTypeInfo.description}</p>
            <p className="text-sm"><span className="font-medium">Typical Production:</span> {selectedTypeInfo.production}</p>
            <p className="text-sm"><span className="font-medium">Example:</span> {selectedTypeInfo.example}</p>
          </div>
        </div>
      )}
    </div>
  );
};
