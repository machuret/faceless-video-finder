
import { toast } from "sonner";
import { fetchChannelData, formatChannelData, saveChannelToDatabase } from "../utils/channelDataUtils";
import { UploadResult } from "./useBulkChannelUpload";

export const useChannelProcessor = () => {
  /**
   * Process a single channel URL and save it to the database
   * Returns detailed result information
   */
  const processChannelUrl = async (url: string, index: number, totalCount: number): Promise<UploadResult> => {
    try {
      console.log(`Processing channel ${index + 1}/${totalCount}: ${url}`);
      
      // Step 1: Get channel data using the dedicated Edge Function
      const channelData = await fetchChannelData(url);
      
      if (!channelData || !channelData.success) {
        console.error(`Failed to fetch data for channel: ${url}`, channelData);
        toast.error(`Failed to fetch data for channel: ${url}`);
        return {
          url,
          channelTitle: "Unknown Channel",
          success: false,
          message: channelData?.error || "Failed to fetch channel data",
          isNew: false
        };
      }
      
      console.log(`Channel data received for ${url}:`, channelData);
      
      // Step 2: Format the channel data
      const formattedData = formatChannelData(channelData, url, index);
      
      // Step 3: Save the channel data to the database
      const saveResult = await saveChannelToDatabase(formattedData);
      
      if (saveResult.success) {
        console.log(`Successfully saved channel: ${channelData.title || url}`);
        return {
          url,
          channelTitle: channelData.title || url,
          success: true,
          message: saveResult.isNew ? "Channel added successfully" : "Channel updated successfully",
          isNew: saveResult.isNew
        };
      } else {
        console.error(`Failed to save channel to database: ${url}`);
        return {
          url,
          channelTitle: channelData.title || url,
          success: false,
          message: "Failed to save to database",
          isNew: false
        };
      }
    } catch (error) {
      console.error(`Error processing channel ${url}:`, error);
      toast.error(`Failed to process channel: ${url}`);
      return {
        url,
        channelTitle: "Unknown Channel",
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        isNew: false
      };
    }
  };

  return {
    processChannelUrl
  };
};
