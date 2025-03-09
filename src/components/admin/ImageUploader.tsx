
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, X, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ImageUploaderProps {
  imageUrl: string | null;
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete?: () => void;
  className?: string;
  maxFileSizeMB?: number;
}

export const ImageUploader = ({
  imageUrl,
  uploading,
  onUpload,
  onDelete,
  className = "",
  maxFileSizeMB = 5 // Default max size 5MB
}: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [compressingProgress, setCompressingProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSizeMB) {
      setFileError(`File size exceeds ${maxFileSizeMB}MB limit. Compressing...`);
      await compressAndUploadImage(file, e);
      return;
    }
    
    // Check file type
    setFileError(null);
    onUpload(e);
  };
  
  const compressAndUploadImage = async (file: File, originalEvent: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsCompressing(true);
      
      // Create new compressed event to pass to the original handler
      const dataTransfer = new DataTransfer();
      
      // Convert to WebP for better compression if browser supports it
      if (file.type.startsWith('image/')) {
        const img = new Image();
        const imgLoaded = new Promise<void>((resolve) => {
          img.onload = () => resolve();
        });
        
        img.src = URL.createObjectURL(file);
        await imgLoaded;
        
        // Create a canvas to compress the image
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Scale down if image is too large (max dimension 1600px)
        const maxDimension = 1600;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height *= maxDimension / width;
            width = maxDimension;
          } else {
            width *= maxDimension / height;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not get 2D context");
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress the image with different quality settings based on original size
        let quality = 0.8; // Default quality
        const fileSizeMB = file.size / (1024 * 1024);
        
        if (fileSizeMB > 10) quality = 0.6;
        else if (fileSizeMB > 5) quality = 0.7;
        
        // Use WebP if supported (most modern browsers)
        const mimeType = 'image/webp';
        
        // Get the compressed image
        setCompressingProgress(50);
        const compressedBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else resolve(file); // Fallback to original file if conversion fails
          }, mimeType, quality);
        });
        
        setCompressingProgress(80);
        
        // Create a new file from the compressed blob
        const compressedFile = new File(
          [compressedBlob],
          file.name.replace(/\.[^/.]+$/, '.webp'), // Replace extension with .webp
          { type: mimeType }
        );
        
        console.log(`Original size: ${(file.size / 1024).toFixed(2)}KB, Compressed size: ${(compressedFile.size / 1024).toFixed(2)}KB`);
        
        dataTransfer.items.add(compressedFile);
        
        // Create a new event with the compressed file
        const newFiles = dataTransfer.files;
        const newEvent = {
          ...originalEvent,
          target: {
            ...originalEvent.target,
            files: newFiles
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        setCompressingProgress(100);
        setFileError(`Compressed from ${(file.size / (1024 * 1024)).toFixed(2)}MB to ${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB`);
        
        // Upload the compressed file
        setTimeout(() => {
          onUpload(newEvent);
          setFileError(null);
          setIsCompressing(false);
          setCompressingProgress(0);
        }, 500);
      } else {
        // Not an image, proceed with original file
        setIsCompressing(false);
        setFileError(null);
        onUpload(originalEvent);
      }
    } catch (err) {
      console.error("Error compressing image:", err);
      setFileError("Error compressing image. Uploading original...");
      onUpload(originalEvent);
      setIsCompressing(false);
    }
  };

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
      
      {fileError && (
        <div className="text-sm text-amber-600 mb-2">{fileError}</div>
      )}
      
      {isCompressing && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Compressing image...</span>
            <span>{compressingProgress}%</span>
          </div>
          <Progress value={compressingProgress} className="h-1" />
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || isCompressing}
          className="flex items-center gap-1"
        >
          {uploading ? (
            <>
              <Upload className="h-4 w-4 animate-pulse" />
              Uploading...
            </>
          ) : isCompressing ? (
            <>
              <Upload className="h-4 w-4 animate-spin" />
              Compressing...
            </>
          ) : (
            <>
              <ImageIcon className="h-4 w-4" />
              {imageUrl ? "Change Image" : "Upload Image"}
            </>
          )}
        </Button>
        
        {imageUrl && onDelete && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={uploading || isCompressing}
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
      <div className="text-xs text-gray-500">
        Supported formats: JPG, PNG, GIF, WebP. Max size: {maxFileSizeMB}MB (larger files will be compressed)
      </div>
    </div>
  );
};
