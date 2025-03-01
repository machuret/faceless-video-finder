
import { Input } from "@/components/ui/input";
import { FormSection } from "./FormSection";
import AIContentGenerator from "./AIContentGenerator";
import { RichTextEditor } from "@/components/ui/rich-text-editor/RichTextEditor";

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
  const handleDescriptionChange = (name: string, value: string) => {
    onFieldChange(name, value);
  };

  const handleDescriptionGenerated = (generatedDescription: string) => {
    onFieldChange("description", generatedDescription);
  };

  const handleScreenshotUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onScreenshotChange(e.target.value);
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
            value={description || ""}
            onChange={handleDescriptionChange}
            placeholder="Enter channel description..."
            className="w-full"
          />
        </div>
      </div>
    </FormSection>
  );
};

export default ChannelContent;
