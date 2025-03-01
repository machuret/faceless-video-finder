
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/FileUpload";
import { FormSection } from "./FormSection";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface ChannelContentProps {
  description: string;
  screenshotUrl: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScreenshotChange: (url: string) => void;
  onGenerateContent?: () => void;
  isGenerating?: boolean;
}

const ChannelContent = ({ 
  description, 
  screenshotUrl, 
  onChange, 
  onScreenshotChange,
  onGenerateContent,
  isGenerating = false
}: ChannelContentProps) => {
  return (
    <FormSection title="Content & Visuals">
      <div>
        <label className="block text-sm font-medium mb-1">Channel Screenshot</label>
        <FileUpload
          onUploadComplete={onScreenshotChange}
          currentUrl={screenshotUrl}
        />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium">Description</label>
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
              {isGenerating ? "Generating..." : "Generate Description"}
            </Button>
          )}
        </div>
        <Input
          name="description"
          placeholder="Description"
          value={description}
          onChange={onChange}
          className="mt-1"
        />
      </div>
    </FormSection>
  );
};

export default ChannelContent;
