
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface UploadButtonProps {
  uploading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadButton = ({ uploading, onChange }: UploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    // File input will be cleared in the parent component after processing
  };
  
  return (
    <div className="relative">
      <Input
        ref={fileInputRef}
        type="file"
        id="screenshot_file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        disabled={uploading}
      />
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={handleClick}
        disabled={uploading}
        className="flex items-center gap-2"
        type="button" // Explicitly set type to button to prevent form submission
      >
        <Upload className="h-4 w-4" />
        {uploading ? "Uploading..." : "Upload Screenshot"}
      </Button>
    </div>
  );
};

export default UploadButton;
