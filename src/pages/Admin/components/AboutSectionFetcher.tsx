
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AboutSectionFetcherProps {
  channelUrl: string;
  onAboutReceived: (about: string) => void;
  disabled?: boolean;
}

const AboutSectionFetcher = ({ channelUrl, onAboutReceived, disabled = false }: AboutSectionFetcherProps) => {
  const [loading, setLoading] = useState(false);

  const fetchAbout = async () => {
    if (!channelUrl) {
      toast.error("Please enter a channel URL first");
      return;
    }

    setLoading(true);
    toast.info("Fetching channel's about section...");

    try {
      const { data, error } = await supabase.functions.invoke('fetch-channel-stats', {
        body: { 
          channelUrl,
          fetchDescriptionOnly: true
        }
      });

      if (error) {
        console.error("Error fetching about section:", error);
        throw new Error(`Failed to fetch about section: ${error.message}`);
      }

      if (!data || !data.success) {
        throw new Error(data?.error || "Failed to fetch channel about section");
      }

      console.log("About section received:", data);
      
      // Extract the description from the response
      const description = data.description || "";
      
      // Call the callback function with the description
      onAboutReceived(description);
      toast.success("Channel about section updated successfully");
    } catch (err) {
      console.error("Error in fetch about flow:", err);
      toast.error(err instanceof Error ? err.message : "Unknown error fetching about section");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      type="button" 
      variant="outline" 
      size="sm" 
      onClick={fetchAbout}
      disabled={loading || disabled || !channelUrl}
      className="flex items-center gap-1"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
      Fetch About
    </Button>
  );
};

export default AboutSectionFetcher;
