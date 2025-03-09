
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { niches } from "@/data/niches";

interface NicheSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const NicheSelector = ({ value, onChange }: NicheSelectorProps) => {
  console.log("NicheSelector - Current selected niche:", value);
  
  return (
    <div className="space-y-2">
      <Label htmlFor="niche">Niche</Label>
      <Select 
        value={value || ""} 
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a niche" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">-- Select Niche --</SelectItem>
          {niches.map((niche) => (
            <SelectItem key={niche} value={niche}>
              {niche}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default NicheSelector;
