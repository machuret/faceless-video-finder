
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/FileUpload";
import { FormSection } from "./FormSection";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { RichTextEditor } from "@/components/ui/rich-text-editor/RichTextEditor";

interface ChannelContentProps {
  description: string;
  screenshotUrl: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScreenshotChange: (url: string) => void;
  onGenerateContent?: () => void;
  isGenerating?: boolean;
  onFieldChange: (name: string, value: string) => void;
}

const ChannelContent = ({ 
  description, 
  screenshotUrl, 
  onChange, 
  onScreenshotChange,
  onGenerateContent,
  isGenerating = false,
  onFieldChange
}: ChannelContentProps) => {
  return (
    <FormSection title="Content & Visuals">
      <div>
        <label className="block text-sm font-medium mb-1">Channel Screenshot</label>
        <FileUpload
          onUploadComplete={onScreenshotChange}
          currentUrl={screenshotUrl}
        />
        <p className="text-xs text-gray-500 mt-1">Upload a screenshot of the channel's homepage</p>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium">Channel Description</label>
          {onGenerateContent && (
            <Button 
              type="button" 
              size="sm" 
              variant="outline"
              onClick={onGenerateContent}
              disabled={isGenerating}
              className="flex items-center gap-1"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate with AI"}
            </Button>
          )}
        </div>
        <RichTextEditor
          id="description"
          name="description"
          label=""
          value={description}
          onChange={onFieldChange}
          placeholder="Enter channel description here..."
          className="w-full"
        />
        <p className="text-xs text-gray-500">This description will help categorize and search for the channel</p>
      </div>
    </FormSection>
  );
};

export default ChannelContent;
