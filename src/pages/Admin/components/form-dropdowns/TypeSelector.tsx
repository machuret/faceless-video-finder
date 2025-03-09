
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { channelTypes } from "@/components/youtube/channel-list/constants/channelTypes";

interface TypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const TypeSelector = ({ value, onChange }: TypeSelectorProps) => {
  // Ensure we have a string value to avoid React warnings
  const safeValue = value || "";
  
  return (
    <div className="space-y-2">
      <Label htmlFor="channel_type">Channel Type</Label>
      <Select 
        value={safeValue}
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">-- Select Type --</SelectItem>
          {channelTypes.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TypeSelector;
