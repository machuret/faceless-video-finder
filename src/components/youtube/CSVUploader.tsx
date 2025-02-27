
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Channel, ChannelCategory, ChannelType } from "@/types/youtube";

interface CSVUploaderProps {
  onUploadSuccess: () => Promise<void>;
}

// Define a type that matches Supabase's requirements
type RequiredChannelFields = {
  video_id: string;
  channel_title: string;
  channel_url: string;
  channel_category?: ChannelCategory;
  channel_type?: string; // Changed to string to be compatible with Supabase
  description?: string | null;
  screenshot_url?: string | null;
  total_subscribers?: number | null;
  total_views?: number | null;
  keywords?: string[] | null;
  country?: string | null;
  niche?: string | null;
  notes?: string | null;
  cpm?: number | null;
  potential_revenue?: number | null;
  revenue_per_video?: number | null;
  revenue_per_month?: number | null;
  uses_ai?: boolean | null;
};

export const CSVUploader = ({ onUploadSuccess }: CSVUploaderProps) => {
  const [uploading, setUploading] = useState(false);

  const downloadTemplate = () => {
    const csvHeader = "video_id,channel_title,channel_url,description,screenshot_url,total_subscribers,total_views,channel_category,channel_type,keywords,country,niche,notes,cpm,potential_revenue,revenue_per_video,revenue_per_month,uses_ai\n";
    const csvContent = csvHeader + "dQw4w9WgXcQ,Rick Astley,https://youtube.com/rickastley,Official Rick Astley channel,https://example.com/screenshot.jpg,12500000,2000000000,entertainment,compilation_montage,\"music,pop,80s\",UK,Music,Great engagement,5.50,75000,1500,45000,false";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "youtube_channels_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const text = await file.text();
      const rows = text.split('\n');
      const headers = rows[0].split(',');
      
      const validChannels: RequiredChannelFields[] = [];
      const skippedRows: number[] = [];

      rows.slice(1).forEach((row, index) => {
        if (!row.trim()) return;

        const values = row.split(',');
        const channel: Partial<RequiredChannelFields> = {};
        
        headers.forEach((header, i) => {
          let value = values[i]?.trim();
          if (value === undefined || value === '') return;
          
          const headerKey = header.trim() as keyof RequiredChannelFields;
          
          switch(headerKey) {
            case 'keywords':
              try {
                channel[headerKey] = JSON.parse(value);
              } catch {
                channel[headerKey] = value.split(',').map(k => k.trim());
              }
              break;
            case 'uses_ai':
              channel[headerKey] = value.toLowerCase() === 'true';
              break;
            case 'total_subscribers':
            case 'total_views':
            case 'cpm':
            case 'potential_revenue':
            case 'revenue_per_video':
            case 'revenue_per_month':
              channel[headerKey] = value ? parseFloat(value) : null;
              break;
            case 'channel_category':
              if (isValidChannelCategory(value)) {
                channel[headerKey] = value;
              }
              break;
            case 'channel_type':
              // Store as string, no validation needed as we're storing raw values now
              channel[headerKey] = value;
              break;
            default:
              // @ts-ignore - we know these are string fields
              channel[headerKey] = value;
          }
        });

        if (channel.video_id && channel.channel_title && channel.channel_url) {
          validChannels.push(channel as RequiredChannelFields);
        } else {
          skippedRows.push(index + 2); // Add 2 to account for 0-based index and header row
        }
      });

      if (validChannels.length === 0) {
        throw new Error('No valid channels found in the CSV file');
      }

      // Cast validChannels to any for Supabase insert to avoid type issues
      const { error } = await supabase
        .from('youtube_channels')
        .insert(validChannels as any);

      if (error) throw error;
      
      await onUploadSuccess();
      
      if (skippedRows.length > 0) {
        toast.warning(`Uploaded ${validChannels.length} channels. Skipped rows: ${skippedRows.join(', ')}`);
      } else {
        toast.success(`Successfully uploaded ${validChannels.length} channels`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload channels';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  // Type guard functions
  const isValidChannelCategory = (value: string): value is ChannelCategory => {
    return ["entertainment", "education", "gaming", "music", "news", "sports", "technology", "other"].includes(value);
  };

  return (
    <div className="flex gap-4">
      <Button
        variant="outline"
        onClick={downloadTemplate}
      >
        <Download className="mr-2" /> Download CSV Template
      </Button>
      <div className="relative">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        <Button
          variant="outline"
          disabled={uploading}
        >
          <Upload className="mr-2" />
          {uploading ? 'Uploading...' : 'Upload CSV'}
        </Button>
      </div>
    </div>
  );
};
