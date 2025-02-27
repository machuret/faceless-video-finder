
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  currentUrl: string | null;
}

export const FileUpload = ({ onUploadComplete, currentUrl }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('channel-screenshots')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('channel-screenshots')
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);
      toast.success('Screenshot uploaded successfully');
    } catch (error) {
      toast.error('Error uploading screenshot');
      console.error('Error:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async () => {
    if (!currentUrl) return;

    try {
      const fileName = currentUrl.split('/').pop();
      if (!fileName) return;

      const { error } = await supabase.storage
        .from('channel-screenshots')
        .remove([fileName]);

      if (error) {
        throw error;
      }

      onUploadComplete('');
      toast.success('Screenshot removed successfully');
    } catch (error) {
      toast.error('Error removing screenshot');
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-4">
      {currentUrl && (
        <div className="relative">
          <img
            src={currentUrl}
            alt="Channel screenshot"
            className="w-full h-48 object-cover rounded-lg"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={removeFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex items-center justify-center">
        <label className="w-full">
          <input
            type="file"
            accept="image/*"
            onChange={uploadFile}
            disabled={uploading}
            className="hidden"
          />
          <Button
            variant="outline"
            className="w-full"
            disabled={uploading}
            asChild
          >
            <div>
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Screenshot'}
            </div>
          </Button>
        </label>
      </div>
    </div>
  );
};
