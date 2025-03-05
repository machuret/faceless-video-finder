
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface UploadButtonProps {
  uploading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadButton = ({ uploading, onChange }: UploadButtonProps) => {
  return (
    <div className="relative">
      <Input
        type="file"
        id="screenshot_file"
        accept="image/*"
        onChange={onChange}
        className="hidden"
        disabled={uploading}
      />
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={() => document.getElementById('screenshot_file')?.click()}
        disabled={uploading}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        {uploading ? "Uploading..." : "Upload Screenshot"}
      </Button>
    </div>
  );
};

export default UploadButton;
