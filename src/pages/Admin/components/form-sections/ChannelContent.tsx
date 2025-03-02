
import { Input } from "@/components/ui/input";
import { FormSection } from "./FormSection";
import AIContentGenerator from "./AIContentGenerator";
import { RichTextEditor } from "@/components/ui/rich-text-editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface ChannelContentProps {
  description: string;
  screenshotUrl: string;
  channelTitle: string;
  keywords: string[] | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onScreenshotChange: (url: string) => void;
  onFieldChange: (name: string, value: string) => void;
  onKeywordsChange: (keywords: string[]) => void;
}

const ChannelContent = ({
  description,
  screenshotUrl,
  channelTitle,
  keywords = [],
  onChange,
  onScreenshotChange,
  onFieldChange,
  onKeywordsChange
}: ChannelContentProps) => {
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [keywordsInput, setKeywordsInput] = useState(keywords?.join(', ') || '');
  
  const handleDescriptionChange = (name: string, value: string) => {
    console.log("Description change:", value);
    onFieldChange(name, value);
  };

  const handleDescriptionGenerated = (generatedDescription: string) => {
    onFieldChange("description", generatedDescription);
  };

  const handleScreenshotUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onScreenshotChange(e.target.value);
  };
  
  const handleKeywordsInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setKeywordsInput(e.target.value);
    // Split by commas and trim each keyword
    const keywordArray = e.target.value.split(',').map(keyword => keyword.trim()).filter(k => k !== '');
    onKeywordsChange(keywordArray);
  };
  
  const generateKeywords = async () => {
    if (!channelTitle) {
      toast.error('Please enter a channel title first');
      return;
    }
    
    setIsGeneratingKeywords(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-channel-keywords', {
        body: { 
          title: channelTitle, 
          description: description || '',
          category: ''  // Optional
        }
      });
      
      if (error) {
        console.error('Edge Function error:', error);
        throw error;
      }
      
      console.log("AI keyword generation response:", data);
      
      if (data?.keywords && Array.isArray(data.keywords)) {
        // Update the keywords input field
        setKeywordsInput(data.keywords.join(', '));
        // Update the form data
        onKeywordsChange(data.keywords);
        toast.success('Keywords generated successfully!');
      } else {
        console.error('No keywords in response:', data);
        throw new Error('No keywords were generated');
      }
    } catch (error) {
      console.error('Error generating keywords:', error);
      toast.error('Failed to generate keywords: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  return (
    <FormSection title="Channel Content">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Channel Screenshot URL</label>
          <Input
            name="screenshot_url"
            value={screenshotUrl}
            onChange={handleScreenshotUrlChange}
            placeholder="https://example.com/screenshot.jpg"
          />
          {screenshotUrl && (
            <div className="mt-2">
              <img
                src={screenshotUrl}
                alt="Channel Screenshot"
                className="max-h-40 rounded border"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium">Description</label>
            <div className="flex gap-2">
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                onClick={generateKeywords}
                disabled={isGeneratingKeywords}
                className="flex items-center gap-1"
              >
                <Sparkles className="h-4 w-4" />
                {isGeneratingKeywords ? "Generating Keywords..." : "Generate Keywords"}
              </Button>
              <AIContentGenerator
                channelTitle={channelTitle}
                description={description}
                onDescriptionGenerated={handleDescriptionGenerated}
              />
            </div>
          </div>
          <RichTextEditor
            id="description"
            name="description"
            label=""
            value={description || ""}
            onChange={handleDescriptionChange}
            placeholder="Enter channel description..."
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Keywords</label>
          <Textarea
            name="keywords"
            value={keywordsInput}
            onChange={handleKeywordsInputChange}
            placeholder="Enter keywords separated by commas..."
            className="w-full min-h-20"
          />
          <p className="text-xs text-gray-500">Enter keywords separated by commas (e.g. gaming, tutorials, educational)</p>
        </div>
      </div>
    </FormSection>
  );
};

export default ChannelContent;
