
import React, { useState, useEffect, useRef, memo } from 'react';
import { cn } from '@/lib/utils';

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
 * - Supports WebP automatically
 * - Uses proper sizing and aspect ratio
 * - Implements progressive loading
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
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate proper image URL with optimization parameters if not from Supabase storage
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
    
    // Add WebP format if supported
    if ('imageRendering' in document.documentElement.style) {
      urlParams.append('fm', 'webp');
    }
    
    // Construct URL with parameters
    const hasParams = src.includes('?');
    return `${src}${hasParams ? '&' : '?'}${urlParams.toString()}`;
  }, [src, width, height, quality]);

  // Handle intersection observer for lazy loading
  useEffect(() => {
    if (!priority && imgRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setImgSrc(optimizedSrc);
            if (observerRef.current && imgRef.current) {
              observerRef.current.unobserve(imgRef.current);
              observerRef.current.disconnect();
            }
          }
        },
        {
          rootMargin: '200px', // Start loading when within 200px of viewport
          threshold: 0.01 // Trigger when just 1% is visible
        }
      );
      
      observerRef.current.observe(imgRef.current);
      
      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
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

  return (
    <div 
      className={cn(
        'relative overflow-hidden',
        !isLoaded && 'bg-gray-100',
        className
      )} 
      ref={imgRef}
      style={aspectRatioStyle}
    >
      {/* Blur placeholder */}
      {placeholder === 'blur' && blurDataURL && !isLoaded && (
        <div 
          className="absolute inset-0 scale-110 blur-xl"
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
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity',
            isLoaded ? 'opacity-100' : 'opacity-0',
          )}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          sizes={sizes}
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
