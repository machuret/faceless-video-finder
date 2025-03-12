
/**
 * Utility functions for image optimization
 */

/**
 * Generate a low quality image URL for placeholders
 * This scales down the image and reduces quality significantly
 */
export function generateLowQualityPlaceholder(url: string, width: number = 20): string {
  if (!url) return '';
  
  // Return empty string for non-HTTP URLs
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return '';
  }
  
  // Don't modify if it's a data URL
  if (url.startsWith('data:')) {
    return url;
  }
  
  // For URLs that support quality parameters (Supabase, Cloudinary, etc.)
  if (url.includes('supabase.co')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&quality=10`;
  }
  
  // For other URLs, add standard parameters
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}w=${width}&q=10`;
}

/**
 * Calculate the dominant color from an image URL (client-side)
 * Returns a promise that resolves to a CSS color string
 */
export function getDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      // Create a small canvas to sample the color
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve('#f3f4f6'); // Default gray if canvas isn't supported
        return;
      }
      
      // Draw at a small size to average out colors
      canvas.width = 1;
      canvas.height = 1;
      
      ctx.drawImage(img, 0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      
      // Return as CSS color
      resolve(`rgb(${r}, ${g}, ${b})`);
    };
    
    img.onerror = () => {
      resolve('#f3f4f6'); // Default gray on error
    };
    
    // Load the image with cache busting for cross-origin issues
    img.src = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}_cb=${Date.now()}`;
  });
}

/**
 * Check if WebP is supported in the current browser
 */
export function isWebpSupported(): boolean {
  if (typeof document === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
}

/**
 * Generate appropriate image formats based on browser support
 */
export function getOptimalImageFormat(): string {
  if (typeof window !== 'undefined') {
    // Check AVIF support first (most efficient format)
    if (window.hasImageFormat?.avif) {
      return 'avif';
    }
    
    // Then check WebP
    if (isWebpSupported()) {
      return 'webp';
    }
  }
  
  // Fallback to traditional formats
  return 'jpg';
}
