
import React from "react";
import TypeSelector from "../form-dropdowns/TypeSelector";
import CategorySelector from "../form-dropdowns/CategorySelector";
import CountrySelector from "../form-dropdowns/CountrySelector";
import { ChannelFormData } from "@/types/forms";

interface ChannelTypeCategoriesProps {
  formData: ChannelFormData;
  handleFieldChange: (field: string, value: string) => void;
}

const ChannelTypeCategories = ({ 
  formData, 
  handleFieldChange 
}: ChannelTypeCategoriesProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TypeSelector 
          selectedType={formData.channel_type} 
          onSelect={(typeId) => handleFieldChange('channel_type', typeId)} 
          channelTitle={formData.channel_title}
          description={formData.description}
        />
        
        <CategorySelector 
          selectedCategory={formData.channel_category} 
          onSelect={(category) => handleFieldChange('channel_category', category)} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CountrySelector 
          selectedCountry={formData.country} 
          onSelect={(country) => handleFieldChange('country', country)} 
        />
      </div>
    </>
  );
};

export default ChannelTypeCategories;
