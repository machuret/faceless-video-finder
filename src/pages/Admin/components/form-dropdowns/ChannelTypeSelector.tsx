
import React, { useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface ChannelTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

interface ChannelType {
  id: string;
  label: string;
  description?: string;
}

const defaultChannelTypes: ChannelType[] = [
  { id: "educational", label: "Educational" },
  { id: "entertainment", label: "Entertainment" },
  { id: "vlog", label: "Vlog" },
  { id: "gaming", label: "Gaming" },
  { id: "comedy", label: "Comedy" },
  { id: "howto", label: "How-to & DIY" },
  { id: "music", label: "Music" },
  { id: "sports", label: "Sports" },
  { id: "technology", label: "Technology" },
  { id: "fashion", label: "Fashion & Beauty" },
  { id: "food", label: "Food & Cooking" },
  { id: "travel", label: "Travel" },
  { id: "news", label: "News & Politics" },
  { id: "other", label: "Other" }
];

const fetchChannelTypes = async (): Promise<ChannelType[]> => {
  try {
    // Try edge function with timeout
    const fetchPromise = supabase.functions.invoke("get-channel-types");
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Edge function timeout")), 5000)
    );
    
    try {
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      if (error) {
        console.warn("Edge function error:", error);
        throw new Error(error.message);
      }
      
      if (data?.channelTypes && Array.isArray(data.channelTypes) && data.channelTypes.length > 0) {
        console.log("Retrieved channel types from edge function:", data.channelTypes.length);
        return data.channelTypes;
      }
    } catch (err) {
      console.warn("Edge function failed, falling back to direct query:", err);
    }
    
    // Fallback to direct query
    const { data, error } = await supabase
      .from('channel_types')
      .select('id, label, description')
      .order('label');
      
    if (error) {
      console.warn("Database query error:", error);
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log("Retrieved channel types from database:", data.length);
      return data;
    }
    
    console.log("No channel types found, using default list");
    return defaultChannelTypes;
  } catch (error) {
    console.error("Error fetching channel types:", error);
    return defaultChannelTypes;
  }
};

const ChannelTypeSelector = ({ value, onChange }: ChannelTypeSelectorProps) => {
  // Ensure we have a valid value
  const safeValue = value || "";
  
  const { data: channelTypes, isLoading, isError } = useQuery({
    queryKey: ['channel-types'],
    queryFn: fetchChannelTypes,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    meta: {
      onError: (err: Error) => {
        console.error("Failed to fetch channel types:", err);
        toast.error("Could not load channel types. Using default list.");
      }
    }
  });
  
  // Sort channel types alphabetically
  const sortedTypes = useMemo(() => {
    const types = channelTypes || defaultChannelTypes;
    return [...types].sort((a, b) => a.label.localeCompare(b.label));
  }, [channelTypes]);
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Channel Type</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <Label htmlFor="channel_type">Channel Type</Label>
      <Select 
        value={safeValue} 
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a channel type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">-- Select Type --</SelectItem>
          {sortedTypes.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isError && (
        <p className="text-xs text-red-500 mt-1">
          Error loading channel types: Using default list
        </p>
      )}
    </div>
  );
};

export default ChannelTypeSelector;
