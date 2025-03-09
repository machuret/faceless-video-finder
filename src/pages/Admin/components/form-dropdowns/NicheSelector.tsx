
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { niches as defaultNiches } from "@/data/niches";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NicheSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const fetchNichesForSelector = async () => {
  try {
    // First try the edge function
    const { data, error } = await supabase.functions.invoke("get-niches");
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (data && data.niches && Array.isArray(data.niches) && data.niches.length > 0) {
      return data.niches;
    }
    
    // Fallback to direct query
    const { data: nichesData, error: nichesError } = await supabase
      .from('niches')
      .select('name')
      .order('name');
      
    if (nichesError) {
      throw new Error(nichesError.message);
    }
    
    if (nichesData && nichesData.length > 0) {
      return nichesData.map(niche => niche.name);
    }
    
    // Fallback to default niches
    return defaultNiches;
  } catch (error) {
    console.error("Error fetching niches for selector:", error);
    return defaultNiches;
  }
};

const NicheSelector = ({ value, onChange }: NicheSelectorProps) => {
  // Ensure we have a string value to avoid React warnings
  const safeValue = value || "";
  
  const { data: nichesData, isLoading } = useQuery({
    queryKey: ['niches-selector'],
    queryFn: fetchNichesForSelector,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
  
  const niches = nichesData || defaultNiches;
  
  return (
    <div className="space-y-2">
      <Label htmlFor="niche">Niche</Label>
      <Select 
        value={safeValue} 
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={isLoading ? "Loading niches..." : "Select a niche"} />
        </SelectTrigger>
        <SelectContent>
          {/* Use a placeholder value that's not an empty string */}
          <SelectItem value="_none">-- Select Niche --</SelectItem>
          {niches.sort().map((niche) => (
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
