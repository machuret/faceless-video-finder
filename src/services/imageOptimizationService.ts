
/**
 * Image Optimization Service
 * 
 * Provides utilities for optimizing and transforming images across the application
 */

// Check if WebP is supported in the browser
export const isWebPSupported = (): boolean => {
  if (typeof document === 'undefined') return false;
  
  try {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  } catch (e) {
    return false;
  }
};

// Check if AVIF is supported (more efficient than WebP)
export const isAVIFSupported = (): boolean => {
  if (typeof document === 'undefined') return false;
  
  const img = new Image();
  img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  return img.complete;
};

// Get the best supported format
export const getBestImageFormat = (): string => {
  if (isAVIFSupported()) return 'avif';
  if (isWebPSupported()) return 'webp';
  return 'jpeg';
};

// Generate an optimized image URL with appropriate parameters
export const getOptimizedImageUrl = (
  url: string, 
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}
): string => {
  if (!url) return '';
  
  // Don't modify Supabase Storage URLs
  if (url.includes('supabase.co/storage')) return url;
  
  const { width, height, quality = 80, format } = options;
  
  // Use the best format if not specified
  const bestFormat = format || getBestImageFormat();
  
  // Build URL parameters
  const params = new URLSearchParams();
  
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  if (quality && quality < 100) params.append('q', quality.toString());
  if (bestFormat !== 'jpeg') params.append('fm', bestFormat);
  
  // Add parameters to URL
  const separator = url.includes('?') ? '&' : '?';
  
  if (params.toString()) {
    return `${url}${separator}${params.toString()}`;
  }
  
  return url;
};

// Generate a low-quality placeholder URL
export const getLowQualityPlaceholder = (url: string, width = 20): string => {
  if (!url) return '';
  if (url.includes('supabase.co/storage')) return url;
  
  return getOptimizedImageUrl(url, {
    width,
    quality: 20,
    format: getBestImageFormat(),
  });
};

// Get image dimensions based on a URL
export const getImageDimensions = (url: string): Promise<{width: number, height: number}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = reject;
    img.src = url;
  });
};

// Calculate the appropriate srcSet for responsive images
export const generateSrcSet = (url: string, sizes: number[] = [640, 768, 1024, 1280]): string => {
  if (!url) return '';
  if (url.includes('supabase.co/storage')) return '';
  
  return sizes.map(size => {
    const optimizedUrl = getOptimizedImageUrl(url, {
      width: size,
      format: getBestImageFormat(),
    });
    return `${optimizedUrl} ${size}w`;
  }).join(', ');
};

export default {
  isWebPSupported,
  isAVIFSupported,
  getBestImageFormat,
  getOptimizedImageUrl,
  getLowQualityPlaceholder,
  getImageDimensions,
  generateSrcSet
};
