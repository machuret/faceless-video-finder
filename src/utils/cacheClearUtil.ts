
import { clearCache } from "./cacheUtils";

export function clearAllCaches() {
  // Clear all caches
  clearCache();
  
  // Clear any non-cache storage items if needed
  // Add any additional cache clearing logic here
  
  console.log("All caches cleared successfully");
  return true;
}
