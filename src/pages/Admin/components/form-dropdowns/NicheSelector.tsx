
import React, { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define the niches array directly in this file to avoid import issues
// This is a temporary solution, eventually we'll fetch this from an API endpoint
const predefinedNiches = [
  "Affirmation", "AI Parody", "Animal", "Animation", "Archaeology", "ASMR", "Aviation",
  "Bad Neighborhood Tours", "Book Summaries", "Business", "Car", "Cash Stuffing",
  "Celebrity", "Comics", "Comedy/Funny", "Court Cases", "Crime", "Cruises",
  "Cryptocurrency", "Data Comparisons", "DIY", "Dinosaurs", "Documentary",
  "Documentary/List", "Drawing", "Drama", "Drones", "Economics", "Electric Cars",
  "Engineering", "Fighting", "Food", "Gaming", "Gaming History", "Gardening",
  "Geography", "Golfing", "Health", "History", "Home Gadgets", "Homework Help",
  "Investing", "Knitting", "Languages", "Life Hack", "List", "Lofi", "Lucid Dreaming",
  "Luxury", "Make Money", "Mindfulness", "Movie", "Movie Analysis", "Mystery", "Narcissism",
  "NASCAR", "News", "Nostalgia", "Ocean", "Painting Timelapse", "Paper Airplanes",
  "Personal Finance", "Philosophy", "Piano", "Planner", "Police Cam", "Politics",
  "Productivity", "Programming", "Psychology", "Real Estate", "Relationship",
  "Rollercoaster POV", "Scary", "Scary Story", "Science", "Scuba Diving",
  "Self Improvement", "Ships and Boat", "Spirituality", "Sports", "Tech", "Tours",
  "Travel", "Tutorials", "Vehicles", "Weird", "Woke Culture", "YouTube Growth"
];

interface NicheSelectorProps {
  selectedNiche: string | undefined;
  onSelect: (niche: string) => void;
}

const NicheSelector: React.FC<NicheSelectorProps> = ({ selectedNiche, onSelect }) => {
  // Filter out duplicates and sort alphabetically
  const uniqueNiches = useMemo(() => {
    return [...new Set(predefinedNiches)].sort();
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
