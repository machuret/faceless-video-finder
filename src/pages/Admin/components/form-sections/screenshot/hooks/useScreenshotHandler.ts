
import { useScreenshotUpload } from "./useScreenshotUpload";
import { useScreenshotDelete } from "./useScreenshotDelete";

interface UseScreenshotHandlerProps {
  channelId: string | undefined;
  onScreenshotChange: (url: string) => void;
}

export const useScreenshotHandler = ({
  channelId,
  onScreenshotChange
}: UseScreenshotHandlerProps) => {
  const { uploading, handleFileUpload } = useScreenshotUpload({
    channelId,
    onScreenshotChange
  });
  
  const { handleDeleteScreenshot } = useScreenshotDelete({
    channelId,
    onScreenshotChange
  });
  
  return {
    uploading,
    handleFileUpload,
    handleDeleteScreenshot
  };
};
