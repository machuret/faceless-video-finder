
import { clearAllCache } from './cacheUtils';

/**
 * Clears all application caches - both localStorage and service worker
 * @returns Promise that resolves when cache clearing is complete
 */
export async function clearAllCaches(): Promise<{success: boolean, message: string}> {
  try {
    // Clear localStorage cache
    clearAllCache();
    
    // Clear service worker cache if available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      return new Promise((resolve) => {
        // Create a message channel
        const messageChannel = new MessageChannel();
        
        // Handler for message back from service worker
        messageChannel.port1.onmessage = (event) => {
          if (event.data?.status === 'success') {
            resolve({success: true, message: 'All caches cleared successfully'});
          } else {
            resolve({success: false, message: event.data?.message || 'Failed to clear service worker cache'});
          }
        };
        
        // Send message to service worker to clear cache
        navigator.serviceWorker.controller.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
        
        // Set timeout for response
        setTimeout(() => {
          resolve({success: true, message: 'LocalStorage cache cleared, service worker may not have responded'});
        }, 1000);
      });
    }
    
    return {success: true, message: 'LocalStorage cache cleared (no service worker active)'};
  } catch (error) {
    console.error('Error clearing caches:', error);
    return {success: false, message: error instanceof Error ? error.message : 'Unknown error clearing caches'};
  }
}
