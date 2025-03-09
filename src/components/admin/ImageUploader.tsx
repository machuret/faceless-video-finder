
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, X } from "lucide-react";

interface ImageUploaderProps {
  imageUrl: string | null;
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete?: () => void;
  className?: string;
}

export const ImageUploader = ({
  imageUrl,
  uploading,
  onUpload,
  onDelete,
  className = ""
}: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`space-y-3 ${className}`}>
      {imageUrl && (
        <div className="relative w-full max-w-xs">
          <img 
            src={imageUrl} 
            alt="Uploaded image"
            className="rounded-md object-cover h-48 w-full" 
          />
        </div>
      )}
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1"
        >
          <ImageIcon className="h-4 w-4" />
          {uploading ? "Uploading..." : imageUrl ? "Change Image" : "Upload Image"}
        </Button>
        {imageUrl && onDelete && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={uploading}
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};
