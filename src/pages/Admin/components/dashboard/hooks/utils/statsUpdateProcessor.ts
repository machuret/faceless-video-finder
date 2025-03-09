
import { useProgressState } from "./statsUpdateProgress";
import { useStatsUpdateController } from "./controllers/statsUpdateController";

export const useStatsUpdateProcessor = () => {
  // Get progress state management
  const progressManager = useProgressState();
  
  // Use our controller with progress management
  const controller = useStatsUpdateController(progressManager);
  
  return {
    ...controller,
    ...progressManager.state
  };
};
