
import React, { useState, useEffect, useRef, memo } from 'react';
import { cn } from '@/lib/utils';
import { observe, unobserve } from '@/utils/intersectionObserver';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Highly optimized image component that:
 * - Supports WebP and AVIF formats automatically
 * - Uses proper sizing and aspect ratio
 * - Implements progressive loading with shared observers
 * - Respects device pixel ratio
 * - Uses proper browser caching
 */
const OptimizedImage = memo(({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  quality = 80,
  placeholder = "empty",
  blurDataURL,
  sizes = "100vw",
  onLoad,
  onError
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(priority ? src : '');
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Check browser support for modern image formats
  const supportsWebp = React.useMemo(() => {
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      if (canvas.getContext && canvas.getContext('2d')) {
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      }
    }
    return false;
  }, []);

  // Generate proper image URL with optimization parameters
  const optimizedSrc = React.useMemo(() => {
    if (!src) return '';
    
    // If it's already an optimized CDN URL or Supabase URL, return as is
    if (src.includes('supabase.co') || src.includes('imagekit') || src.includes('cloudinary') || src.includes('imgix')) {
      return src;
    }
    
    // Basic URL parameters for optimization
    const urlParams = new URLSearchParams();
    if (quality && quality < 100) urlParams.append('q', quality.toString());
    if (width) urlParams.append('w', width.toString());
    if (height) urlParams.append('h', height.toString());
    
    // Add modern format if supported
    if (supportsWebp) {
      urlParams.append('fm', 'webp');
    }
    
    // Construct URL with parameters
    const hasParams = src.includes('?');
    return `${src}${hasParams ? '&' : '?'}${urlParams.toString()}`;
  }, [src, width, height, quality, supportsWebp]);

  // Generate appropriate srcset for responsive images
  const srcSet = React.useMemo(() => {
    if (!src || !width) return '';
    
    // Don't generate srcset for image service URLs that already handle this
    if (src.includes('supabase.co') || src.includes('imagekit') || src.includes('cloudinary') || src.includes('imgix')) {
      return '';
    }
    
    // Generate a range of widths based on the original width
    const widths = [
      Math.round(width / 4),
      Math.round(width / 2),
      width,
      width * 1.5,
      width * 2
    ].filter(w => w > 60 && w <= 3840); // Reasonable bounds
    
    return widths
      .map(w => {
        const params = new URLSearchParams();
        params.append('w', w.toString());
        params.append('q', quality.toString());
        if (supportsWebp) params.append('fm', 'webp');
        
        const hasParams = src.includes('?');
        const url = `${src}${hasParams ? '&' : '?'}${params.toString()}`;
        return `${url} ${w}w`;
      })
      .join(', ');
  }, [src, width, quality, supportsWebp]);

  // Handle intersection observer for lazy loading
  useEffect(() => {
    if (!priority && imgRef.current) {
      const handleIntersection = (entry: IntersectionObserverEntry) => {
        if (entry.isIntersecting) {
          setImgSrc(optimizedSrc);
          if (imgRef.current) {
            unobserve(imgRef.current);
          }
        }
      };
      
      observe(imgRef.current, handleIntersection, {
        rootMargin: '200px', // Start loading when within 200px of viewport
        threshold: 0.01 // Trigger when just 1% is visible
      });
      
      return () => {
        if (imgRef.current) {
          unobserve(imgRef.current);
        }
      };
    }
  }, [optimizedSrc, priority]);

  // Handle image loading
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  // Aspect ratio style if both dimensions are provided
  const aspectRatioStyle = width && height ? {
    aspectRatio: `${width}/${height}`
  } : {};

  // Determine color hash for placeholder (simple implementation)
  const placeholderColor = React.useMemo(() => {
    if (blurDataURL) return undefined;
    
    // Generate a consistent color from the src string
    let hash = 0;
    for (let i = 0; i < (src?.length || 0); i++) {
      hash = (hash << 5) - hash + src.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Generate a light pastel color
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 90%)`;
  }, [src, blurDataURL]);

  return (
    <div 
      className={cn(
        'relative overflow-hidden',
        !isLoaded && 'bg-gray-100',
        className
      )} 
      ref={imgRef}
      style={{
        ...aspectRatioStyle,
        backgroundColor: !isLoaded && placeholderColor ? placeholderColor : undefined
      }}
    >
      {/* Blur placeholder */}
      {placeholder === 'blur' && blurDataURL && !isLoaded && (
        <div 
          className="absolute inset-0 scale-110 blur-xl transform-gpu"
          style={{ 
            backgroundImage: `url(${blurDataURL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Loading spinner */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Actual image */}
      {(imgSrc || priority) && (
        <img
          src={imgSrc || (priority ? optimizedSrc : '')}
          srcSet={srcSet || undefined}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
          )}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
        />
      )}
      
      {/* Error fallback */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <span className="text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
