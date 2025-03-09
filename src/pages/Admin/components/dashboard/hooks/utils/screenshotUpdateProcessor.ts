
import { useScreenshotUpdateController } from "./controllers/screenshotUpdateController";
import { useProgressState } from "./screenshotUpdateProgress";

export const useScreenshotUpdateProcessor = () => {
  const controller = useScreenshotUpdateController();
  
  return {
    ...controller,
  };
};
