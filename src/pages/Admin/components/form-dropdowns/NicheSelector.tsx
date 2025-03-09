
import React, { useState, useEffect, useMemo } from "react";
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
import { toast } from "sonner";

interface NicheSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const fetchNichesForSelector = async () => {
  try {
    // First try the edge function with timeout
    const fetchPromise = supabase.functions.invoke("get-niches");
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Edge function timeout")), 5000)
    );
    
    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
    
    if (error) {
      console.warn("Edge function error:", error);
      throw new Error(error.message);
    }
    
    if (data?.niches && Array.isArray(data.niches) && data.niches.length > 0) {
      return data.niches;
    }
    
    // Fallback to direct query with timeout
    const queryPromise = supabase
      .from('niches')
      .select('name')
      .order('name');
      
    const queryTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Database query timeout")), 5000)
    );
    
    const { data: nichesData, error: nichesError } = await Promise.race([queryPromise, queryTimeoutPromise]) as any;
      
    if (nichesError) {
      console.warn("Database query error:", nichesError);
      throw new Error(nichesError.message);
    }
    
    if (nichesData && nichesData.length > 0) {
      console.log("Retrieved niches from database:", nichesData.length);
      return nichesData.map(niche => niche.name);
    }
    
    console.log("No niches found, using default list");
    return defaultNiches;
  } catch (error) {
    console.error("Error fetching niches for selector:", error);
    return defaultNiches;
  }
};

const NicheSelector = ({ value, onChange }: NicheSelectorProps) => {
  // Ensure we have a string value to avoid React warnings
  const safeValue = value || "";
  
  const { data: nichesData, isLoading, isError, error } = useQuery({
    queryKey: ['niches-selector'],
    queryFn: fetchNichesForSelector,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    meta: {
      onError: (err: Error) => {
        console.error("Failed to fetch niches:", err);
        toast.error("Could not load niches. Using default list.");
      }
    }
  });
  
  // Sort niches alphabetically once, not on every render
  const sortedNiches = useMemo(() => {
    const niches = nichesData || defaultNiches;
    return [...niches].sort((a, b) => a.localeCompare(b));
  }, [nichesData]);
  
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
          {sortedNiches.map((niche) => (
            <SelectItem key={niche} value={niche}>
              {niche}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isError && (
        <p className="text-xs text-red-500 mt-1">
          Error loading niches: Using default list
        </p>
      )}
    </div>
  );
};

export default NicheSelector;
