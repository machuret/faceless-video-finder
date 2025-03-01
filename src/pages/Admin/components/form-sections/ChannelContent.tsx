
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/FileUpload";
import { FormSection } from "./FormSection";

interface ChannelContentProps {
  description: string;
  screenshotUrl: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScreenshotChange: (url: string) => void;
}

const ChannelContent = ({ 
  description, 
  screenshotUrl, 
  onChange, 
  onScreenshotChange 
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
      <div>
        <Input
          name="description"
          placeholder="Description"
          value={description}
          onChange={onChange}
        />
      </div>
    </FormSection>
  );
};

export default ChannelContent;
