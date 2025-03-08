
import { supabase } from "@/integrations/supabase/client";
import { ChannelCategory, DatabaseChannelType } from "@/types/youtube";
import { channelCategories } from "@/components/youtube/channel-list/constants/categories";
import { toast } from "sonner";

// Ensure the channel category is a valid enum value
export const getValidChannelCategory = (category?: string): ChannelCategory => {
  if (!category || !channelCategories.includes(category as ChannelCategory)) {
    return "entertainment";
  }
  return category as ChannelCategory;
};

// Ensure the channel type is a valid enum value
export const getValidChannelType = (type?: string): DatabaseChannelType => {
  const validTypes: DatabaseChannelType[] = ["creator", "brand", "media", "other"];
  if (!type || !validTypes.includes(type as DatabaseChannelType)) {
    return "creator";
  }
  return type as DatabaseChannelType;
};

// Format channel data for database insertion
export const formatChannelData = (channelData: any, url: string, index: number) => {
  if (!channelData || !channelData.channelName) {
    // Extract a channel name from the URL for better UX
    const channelNameMatch = url.match(/\/@([^\/\?]+)/);
    const channelName = channelNameMatch ? channelNameMatch[1] : "Unknown Channel";
    
    // Create minimal channel data with proper types
    return {
      video_id: `manual-${Date.now()}-${index}`,
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
  }
  
  // Format the Apify data for our database with proper types
  return {
    video_id: channelData.channelId || `manual-${Date.now()}-${index}`,
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
};

// Save channel data to the database
export const saveChannelToDatabase = async (channelData: any) => {
  try {
    // First check if channel already exists
    const { data: existingChannel, error: queryError } = await supabase
      .from("youtube_channels")
      .select("id")
      .eq("channel_url", channelData.channel_url)
      .maybeSingle();
      
    if (queryError) {
      throw new Error(`Error checking existing channel: ${queryError.message}`);
    }
    
    let result;
    
    if (existingChannel) {
      // Update existing channel
      result = await supabase
        .from("youtube_channels")
        .update({
          ...channelData,
          channel_category: channelData.channel_category as ChannelCategory,
          channel_type: channelData.channel_type as DatabaseChannelType
        })
        .eq("id", existingChannel.id);
        
      if (result.error) {
        throw new Error(`Error updating channel: ${result.error.message}`);
      }
      
      toast.success(`Updated channel: ${channelData.channel_title}`);
      return true;
    } else {
      // Insert new channel
      result = await supabase
        .from("youtube_channels")
        .insert({
          ...channelData,
          channel_category: channelData.channel_category as ChannelCategory,
          channel_type: channelData.channel_type as DatabaseChannelType
        });
        
      if (result.error) {
        throw new Error(`Error creating channel: ${result.error.message}`);
      }
      
      toast.success(`Added channel: ${channelData.channel_title}`);
      return true;
    }
  } catch (error) {
    console.error(`Error saving channel to database:`, error);
    toast.error(`Failed to save channel: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
};

// Fetch channel data from the API
export const fetchChannelData = async (url: string) => {
  try {
    const { data: channelData, error: fetchError } = await supabase.functions.invoke('fetch-channel-stats-apify', {
      body: { channelUrl: url }
    });
    
    if (fetchError) {
      console.error(`Error fetching data for ${url}:`, fetchError);
      throw new Error(`Failed to fetch data: ${fetchError.message}`);
    }
    
    console.log("Channel data received:", channelData);
    return channelData;
  } catch (error) {
    console.error(`Error fetching channel data for ${url}:`, error);
    throw new Error(`API request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};
