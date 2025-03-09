
import React from "react";
import TypeSelector from "../form-dropdowns/TypeSelector";
import CategorySelector from "../form-dropdowns/CategorySelector";
import CountrySelector from "../form-dropdowns/CountrySelector";
import NicheSelector from "../form-dropdowns/NicheSelector";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChannelFormData } from "@/types/forms";

interface ChannelTypeCategoriesProps {
  formData: ChannelFormData;
  handleFieldChange: (field: string, value: string) => void;
  handleBooleanFieldChange?: (field: string, value: boolean) => void;
}

const ChannelTypeCategories = ({ 
  formData, 
  handleFieldChange,
  handleBooleanFieldChange 
}: ChannelTypeCategoriesProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TypeSelector 
          value={formData.channel_type || ""} 
          onChange={(typeId) => handleFieldChange('channel_type', typeId)} 
        />
        
        <CategorySelector 
          value={formData.channel_category || "other"} 
          onChange={(category) => handleFieldChange('channel_category', category)} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NicheSelector
          value={formData.niche || ""}
          onChange={(niche) => handleFieldChange('niche', niche)}
        />
        
        <CountrySelector 
          selectedCountry={formData.country} 
          onSelect={(country) => handleFieldChange('country', country)} 
        />
      </div>
      
      <div className="flex items-center space-x-2 mt-4">
        <Switch 
          id="editor-verified"
          checked={formData.is_editor_verified || false}
          onCheckedChange={(checked) => handleBooleanFieldChange && handleBooleanFieldChange('is_editor_verified', checked)}
        />
        <Label htmlFor="editor-verified" className="cursor-pointer">
          Editor Verified
        </Label>
        <span className="text-xs text-gray-500 ml-2">
          Check this if the channel has been manually verified by an editor
        </span>
      </div>
    </>
  );
};

export default ChannelTypeCategories;
