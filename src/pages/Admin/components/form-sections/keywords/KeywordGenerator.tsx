
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface KeywordGeneratorProps {
  channelTitle: string;
  description: string;
  category: string;
  onKeywordsGenerated: (keywords: string[]) => void;
}

const KeywordGenerator = ({
  channelTitle,
  description,
  category,
  onKeywordsGenerated
}: KeywordGeneratorProps) => {
  const [loading, setLoading] = useState(false);

  const generateKeywords = async () => {
    if (!channelTitle) {
      toast.error("Channel title is required to generate keywords");
      return;
    }

    setLoading(true);
    toast.info("Generating keywords...");

    try {
      console.log("Calling generate-channel-keywords with:", {
        title: channelTitle,
        description,
        category
      });

      const { data, error } = await supabase.functions.invoke('generate-channel-keywords', {
        body: {
          title: channelTitle,
          description,
          category
        }
      });

      console.log("Response from generate-channel-keywords:", data);

      if (error) {
        throw error;
      }

      if (!data || !data.keywords || !Array.isArray(data.keywords)) {
        throw new Error("Invalid response format from keyword generator");
      }

      onKeywordsGenerated(data.keywords);
      toast.success("Keywords generated successfully!");
    } catch (err) {
      console.error("Error generating keywords:", err);
      toast.error(`Failed to generate keywords: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={generateKeywords}
      disabled={loading || !channelTitle}
      size="sm"
      className="flex items-center gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {loading ? "Generating..." : "Generate Keywords"}
    </Button>
  );
};

export default KeywordGenerator;
