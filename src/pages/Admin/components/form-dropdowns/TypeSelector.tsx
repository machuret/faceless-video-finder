
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

interface TypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

interface ChannelType {
  id: string;
  label: string;
  description?: string;
}

/**
 * Fetches channel types with optimized error handling and caching
 */
const fetchChannelTypes = async (): Promise<ChannelType[]> => {
  try {
    console.log("Fetching channel types for selector");
    
    // First try the edge function with proper timeout
    const fetchPromise = supabase.functions.invoke("get-channel-types");
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Edge function timeout")), 4000)
    );
    
    try {
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      if (error) {
        console.warn("Edge function error:", error);
        throw new Error(error.message);
      }
      
      if (data?.channelTypes && Array.isArray(data.channelTypes) && data.channelTypes.length > 0) {
        console.log(`Retrieved ${data.channelTypes.length} channel types`);
        return data.channelTypes;
      }
    } catch (err) {
      console.warn("Edge function failed, falling back to direct query:", err);
    }
    
    // Fallback to direct query with timeout
    const queryPromise = supabase
      .from('channel_types')
      .select('id, label, description')
      .order('label');
      
    const queryTimeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Database query timeout")), 4000)
    );
    
    const { data, error } = await Promise.race([queryPromise, queryTimeoutPromise]) as any;
      
    if (error) {
      console.warn("Database query error:", error);
      throw new Error(error.message);
    }
    
    if (data && data.length > 0) {
      console.log("Retrieved channel types from database:", data.length);
      return data as ChannelType[];
    }
    
    console.log("No channel types found, using default list");
    return [
      { id: "creator", label: "Creator" },
      { id: "brand", label: "Brand" },
      { id: "media", label: "Media" },
      { id: "other", label: "Other" }
    ];
  } catch (error) {
    console.error("Error fetching channel types:", error);
    return [
      { id: "creator", label: "Creator" },
      { id: "brand", label: "Brand" },
      { id: "media", label: "Media" },
      { id: "other", label: "Other" }
    ];
  }
};

const TypeSelector: React.FC<TypeSelectorProps> = ({ value, onChange }) => {
  // Ensure we have a string value to avoid React warnings
  const safeValue = value || "";
  
  const { data: channelTypes, isLoading, isError } = useQuery({
    queryKey: ['channel-types'],
    queryFn: fetchChannelTypes,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    meta: {
      onError: (err: Error) => {
        console.error("Failed to fetch channel types:", err);
        toast.error("Could not load channel types. Using default list.");
      }
    }
  });
  
  // Sort channel types alphabetically once, not on every render
  const sortedChannelTypes = useMemo(() => {
    const types = channelTypes || [];
    return [...types].sort((a, b) => a.label.localeCompare(b.label));
  }, [channelTypes]);
  
  return (
    <div className="space-y-2">
      <Label htmlFor="channel_type">Channel Type</Label>
      <Select 
        value={safeValue}
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={isLoading ? "Loading types..." : "Select a type"} />
        </SelectTrigger>
        <SelectContent>
          {/* Use a placeholder value that's not an empty string */}
          <SelectItem value="_none">-- Select Type --</SelectItem>
          {sortedChannelTypes.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isError && (
        <p className="text-xs text-red-500 mt-1">
          Error loading types: Using default list
        </p>
      )}
    </div>
  );
};

export default TypeSelector;
