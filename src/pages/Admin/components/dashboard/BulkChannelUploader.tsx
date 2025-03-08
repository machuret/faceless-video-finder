
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChannelCategory, DatabaseChannelType } from "@/types/youtube";
import { channelCategories } from "@/components/youtube/channel-list/constants/categories";

const BulkChannelUploader = () => {
  const [urls, setUrls] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentChannel, setCurrentChannel] = useState<string>("");
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  const handleUrlsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUrls(e.target.value);
  };
  
  // Ensure the channel category is a valid enum value
  const getValidChannelCategory = (category?: string): ChannelCategory => {
    if (!category || !channelCategories.includes(category as ChannelCategory)) {
      return "entertainment";
    }
    return category as ChannelCategory;
  };
  
  // Ensure the channel type is a valid enum value
  const getValidChannelType = (type?: string): DatabaseChannelType => {
    const validTypes: DatabaseChannelType[] = ["creator", "brand", "media", "other"];
    if (!type || !validTypes.includes(type as DatabaseChannelType)) {
      return "creator";
    }
    return type as DatabaseChannelType;
  };
  
  const startBulkUpload = async () => {
    // Parse URLs, one per line
    const channelUrls = urls
      .split("\n")
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    if (channelUrls.length === 0) {
      toast.error("Please enter at least one YouTube channel URL");
      return;
    }
    
    if (channelUrls.length > 10) {
      toast.warning("You can only upload up to 10 channels at once. Only the first 10 will be processed.");
    }
    
    const urlsToProcess = channelUrls.slice(0, 10);
    setTotalCount(urlsToProcess.length);
    setProcessedCount(0);
    setProgress(0);
    setIsProcessing(true);
    
    toast.info(`Starting bulk upload of ${urlsToProcess.length} channels. This may take a while.`);
    
    // Process each URL individually using the Edge Function
    for (let i = 0; i < urlsToProcess.length; i++) {
      const url = urlsToProcess[i];
      setCurrentChannel(url);
      
      try {
        console.log(`Processing channel ${i + 1}/${urlsToProcess.length}: ${url}`);
        
        // Step 1: Get channel data using the dedicated Edge Function
        const { data: channelData, error: fetchError } = await supabase.functions.invoke('fetch-channel-stats-apify', {
          body: { channelUrl: url }
        });
        
        if (fetchError) {
          console.error(`Error fetching data for ${url}:`, fetchError);
          toast.error(`Failed to fetch data for ${url}: ${fetchError.message}`);
          continue;
        }
        
        console.log("Channel data received:", channelData);
        
        if (!channelData || !channelData.channelName) {
          console.warn(`Insufficient data received for ${url}`);
          toast.warning(`Couldn't fetch complete data for ${url}. Saving with minimal info.`);
          
          // Extract a channel name from the URL for better UX
          const channelNameMatch = url.match(/\/@([^\/\?]+)/);
          const channelName = channelNameMatch ? channelNameMatch[1] : "Unknown Channel";
          
          // Create minimal channel data with proper types
          const minimalData = {
            video_id: `manual-${Date.now()}-${i}`,
            channel_title: channelName,
            channel_url: url,
            description: "",
            total_subscribers: 0,
            total_views: 0,
            start_date: new Date().toISOString().split('T')[0],
            video_count: 0,
            cpm: 4,
            channel_type: "other" as DatabaseChannelType,
            country: "US",
            channel_category: "entertainment" as ChannelCategory,
            notes: `Added via bulk upload. Original URL: ${url}`,
            keywords: [],
            metadata: {
              ui_channel_type: "other",
              is_manual_entry: true
            }
          };
          
          // Insert the minimal channel
          const { error: insertError } = await supabase
            .from("youtube_channels")
            .insert(minimalData);
          
          if (insertError) {
            throw new Error(`Error saving channel: ${insertError.message}`);
          }
          
          toast.success(`Saved minimal data for channel: ${channelName}`);
        } else {
          // Format the Apify data for our database with proper types
          const formattedData = {
            video_id: channelData.channelId || `manual-${Date.now()}-${i}`,
            channel_title: channelData.channelName || "Unknown Channel",
            channel_url: channelData.channelUrl || url,
            description: channelData.channelDescription || "",
            total_subscribers: parseInt(channelData.numberOfSubscribers || "0"),
            total_views: parseInt(channelData.channelTotalViews || "0"),
            start_date: channelData.channelJoinedDate ? 
              new Date(channelData.channelJoinedDate).toISOString().split('T')[0] : 
              new Date().toISOString().split('T')[0],
            video_count: parseInt(channelData.channelTotalVideos || "0"),
            cpm: 4,
            channel_type: getValidChannelType("creator"),
            country: channelData.channelLocation || "US",
            channel_category: getValidChannelCategory("entertainment"),
            notes: `Added via bulk upload. Original URL: ${url}`,
            keywords: [],
            metadata: {
              ui_channel_type: "creator",
              is_manual_entry: false
            }
          };
          
          // First check if channel already exists
          const { data: existingChannel, error: queryError } = await supabase
            .from("youtube_channels")
            .select("id")
            .eq("channel_url", formattedData.channel_url)
            .maybeSingle();
            
          if (queryError) {
            throw new Error(`Error checking existing channel: ${queryError.message}`);
          }
          
          let result;
          
          if (existingChannel) {
            // Update existing channel
            result = await supabase
              .from("youtube_channels")
              .update(formattedData)
              .eq("id", existingChannel.id);
              
            if (result.error) {
              throw new Error(`Error updating channel: ${result.error.message}`);
            }
            
            toast.success(`Updated channel: ${formattedData.channel_title}`);
          } else {
            // Insert new channel
            result = await supabase
              .from("youtube_channels")
              .insert(formattedData);
              
            if (result.error) {
              throw new Error(`Error creating channel: ${result.error.message}`);
            }
            
            toast.success(`Added channel: ${formattedData.channel_title}`);
          }
        }
        
        setProcessedCount(i + 1);
        setProgress(Math.floor(((i + 1) / urlsToProcess.length) * 100));
        
      } catch (error) {
        console.error(`Error processing channel ${url}:`, error);
        toast.error(`Failed to process channel: ${url}`);
      }
      
      // Add a small delay between requests to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    toast.success(`Completed processing ${processedCount} out of ${urlsToProcess.length} channels`);
    setIsProcessing(false);
    setUrls("");
  };
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Bulk Channel Uploader</h2>
      <p className="text-gray-600 mb-4">
        Enter up to 10 YouTube channel URLs (one per line) to add them in bulk. 
        We'll automatically fetch channel data for each URL.
      </p>
      
      <Textarea
        placeholder="Enter YouTube channel URLs (one per line)
e.g., https://www.youtube.com/@example
https://www.youtube.com/@another"
        value={urls}
        onChange={handleUrlsChange}
        rows={5}
        disabled={isProcessing}
        className="mb-4"
      />
      
      {isProcessing && (
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span>Progress: {processedCount} of {totalCount} channels</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 mb-2" />
          <p className="text-sm text-gray-500 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Currently processing: {currentChannel}
          </p>
        </div>
      )}
      
      <Button 
        onClick={startBulkUpload} 
        disabled={isProcessing || !urls.trim()}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Upload className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          "Bulk Upload Channels"
        )}
      </Button>
    </Card>
  );
};

export default BulkChannelUploader;
