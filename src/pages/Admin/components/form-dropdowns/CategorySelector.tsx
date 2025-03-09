
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { channelCategories } from "@/components/youtube/channel-list/constants/categories";

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const CategorySelector = ({ value, onChange }: CategorySelectorProps) => {
  // Ensure we have a valid default value
  const safeValue = value || "other";
  
  return (
    <div className="space-y-2">
      <Label htmlFor="channel_category">Category</Label>
      <Select 
        value={safeValue}
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {channelCategories.map((category) => (
            <SelectItem key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategorySelector;
