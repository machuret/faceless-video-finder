
import React, { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { niches as defaultNiches } from "@/data/niches";

interface NicheSelectorProps {
  selectedNiche: string | undefined;
  onSelect: (niche: string) => void;
}

const NicheSelector: React.FC<NicheSelectorProps> = ({ selectedNiche, onSelect }) => {
  // Filter out duplicates and sort alphabetically
  const uniqueNiches = useMemo(() => {
    return [...new Set(defaultNiches)].sort();
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor="niche-selector">Channel Niche</Label>
      <Select value={selectedNiche || ""} onValueChange={onSelect}>
        <SelectTrigger id="niche-selector" className="w-full">
          <SelectValue placeholder="Select a niche" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <SelectItem value="">Select a niche</SelectItem>
          {uniqueNiches.map((niche) => (
            <SelectItem key={niche} value={niche}>
              {niche}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-500">
        Select the specific niche that best describes this channel's content
      </p>
    </div>
  );
};

export default NicheSelector;
