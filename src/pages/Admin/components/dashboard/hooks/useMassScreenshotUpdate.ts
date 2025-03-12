
import { useScreenshotUpdateProcessor } from "./utils/screenshotUpdateProcessor";

// This is just a simple wrapper around the processor
export const useMassScreenshotUpdate = () => {
  return useScreenshotUpdateProcessor();
};
