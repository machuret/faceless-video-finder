
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface UploadButtonProps {
  uploading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

const UploadButton = ({ uploading, onChange, inputRef }: UploadButtonProps) => {
  return (
    <Button
      variant="secondary"
      size="sm"
      className="flex items-center gap-2 relative"
      disabled={uploading}
      type="button"
    >
      <Upload className="h-4 w-4" />
      {uploading ? "Uploading..." : "Upload"}
      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={onChange}
        disabled={uploading}
        ref={inputRef}
      />
    </Button>
  );
};

export default UploadButton;
