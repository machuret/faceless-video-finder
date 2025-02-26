
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Channel, ChannelCategory, ChannelType } from "@/types/youtube";

interface CSVUploaderProps {
  onUploadSuccess: () => Promise<void>;
}

export const CSVUploader = ({ onUploadSuccess }: CSVUploaderProps) => {
  const [uploading, setUploading] = useState(false);

  const downloadTemplate = () => {
    const csvHeader = "video_id,channel_title,channel_url,description,screenshot_url,total_subscribers,total_views,channel_category,channel_type,keywords,country,niche,notes,cpm,potential_revenue,revenue_per_video,revenue_per_month,uses_ai\n";
    const csvContent = csvHeader + "dQw4w9WgXcQ,Rick Astley,https://youtube.com/rickastley,Official Rick Astley channel,https://example.com/screenshot.jpg,12500000,2000000000,entertainment,entertainment,\"music,pop,80s\",UK,Music,Great engagement,5.50,75000,1500,45000,false";
    
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
      const channels = rows.slice(1).filter(row => row.trim()).map(row => {
        const values = row.split(',');
        const channel: Partial<Channel> = {};
        
        headers.forEach((header, index) => {
          let value = values[index]?.trim();
          if (value === undefined || value === '') return;
          
          const headerKey = header.trim() as keyof Channel;
          
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
              channel[headerKey] = value as ChannelCategory;
              break;
            case 'channel_type':
              channel[headerKey] = value as ChannelType;
              break;
            default:
              channel[headerKey] = value;
          }
        });

        // Ensure required fields are present
        if (!channel.channel_title || !channel.channel_url || !channel.video_id) {
          throw new Error('Missing required fields');
        }

        return channel as Required<Pick<Channel, 'channel_title' | 'channel_url' | 'video_id'>> & Partial<Channel>;
      });

      const { error } = await supabase
        .from('youtube_channels')
        .insert(channels);

      if (error) throw error;
      
      await onUploadSuccess();
      toast.success(`Successfully uploaded ${channels.length} channels`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload channels. Please check your CSV format.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
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
