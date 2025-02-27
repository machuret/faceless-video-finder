
import { Channel } from "@/types/youtube";
import { Input } from "@/components/ui/input";
import { channelCategories, channelTypes, channelSizes, uploadFrequencies, countries } from "../constants";
import { niches } from "../constants/niches";
import { useState, useEffect } from "react";

interface ChannelCategoriesProps {
  editForm: Channel;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onTypeChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const ChannelCategories = ({ editForm, onChange, onTypeChange }: ChannelCategoriesProps) => {
  // Get the current UI channel type either from metadata or from channel_type if it's not "other"
  const getInitialChannelType = () => {
    if (editForm?.metadata?.ui_channel_type) {
      return editForm.metadata.ui_channel_type;
    }
    if (editForm?.channel_type && editForm.channel_type !== "other") {
      return editForm.channel_type;
    }
    return "other";
  };
  
  const [selectedType, setSelectedType] = useState<string | undefined>(getInitialChannelType());
  
  // Update selectedType when editForm changes
  useEffect(() => {
    setSelectedType(getInitialChannelType());
  }, [editForm]);
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedType(value);
    
    // If a custom handler is provided, use it - otherwise use the default onChange
    if (onTypeChange) {
      onTypeChange(e);
    } else {
      // Create a modified event to pass to parent component
      const modifiedEvent = {
        ...e,
        target: {
          ...e.target,
          name: e.target.name,
          value: value
        }
      };
      
      onChange(modifiedEvent);
    }
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
          <label className="block text-sm font-medium mb-1">Type of Channel</label>
          <select
            name="channel_type"
            value={selectedType || "other"}
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
