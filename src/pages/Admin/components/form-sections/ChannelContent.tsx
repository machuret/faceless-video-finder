
import { FileUpload } from "@/components/FileUpload";
import { FormSection } from "./FormSection";
import { RichTextEditor } from "@/components/ui/rich-text-editor/RichTextEditor";
import AIContentGenerator from "./AIContentGenerator";

interface ChannelContentProps {
  description: string;
  screenshotUrl: string;
  channelTitle: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScreenshotChange: (url: string) => void;
  onFieldChange: (name: string, value: string) => void;
}

const ChannelContent = ({ 
  description, 
  screenshotUrl,
  channelTitle,
  onChange, 
  onScreenshotChange,
  onFieldChange
}: ChannelContentProps) => {
  const handleDescriptionGenerated = (generatedDescription: string) => {
    onFieldChange("description", generatedDescription);
  };

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
          <AIContentGenerator 
            channelTitle={channelTitle}
            description={description}
            onDescriptionGenerated={handleDescriptionGenerated}
          />
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
