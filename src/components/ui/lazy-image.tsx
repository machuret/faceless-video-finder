
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { observe, unobserve } from '@/utils/intersectionObserver';

export interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  onError?: () => void;
  priority?: boolean;
  lowQualityUrl?: string;
  width?: number;
  height?: number;
}

/**
 * Optimized LazyImage component with WebP support, proper caching,
 * and performance improvements using shared IntersectionObserver
 */
const LazyImage = ({ 
  src, 
  alt, 
  className, 
  fallback = '/placeholder.svg', 
  onError,
  priority = false,
  lowQualityUrl,
  width,
  height
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(priority ? src : '');
  const [error, setError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  
  // Check WebP support
  const supportsWebp = React.useMemo(() => {
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      if (canvas.getContext && canvas.getContext('2d')) {
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      }
    }
    return false;
  }, []);
  
  // Generate optimized source with proper format
  const optimizedSrc = React.useMemo(() => {
    if (!src) return '';
    
    // If already contains optimization params or is from a CDN, use as is
    if (src.includes('supabase.co') || src.includes('imagekit') || 
        src.includes('cloudinary') || src.includes('imgix')) {
      return src;
    }
    
    // Add optimization parameters
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (supportsWebp) params.append('fm', 'webp');
    
    const hasParams = src.includes('?');
    return `${src}${hasParams ? '&' : '?'}${params.toString()}`;
  }, [src, width, height, supportsWebp]);
  
  // Handle priority loading
  useEffect(() => {
    if (priority) {
      loadImage(optimizedSrc);
    }
  }, [priority, optimizedSrc]);

  // Setup IntersectionObserver with enhanced performance options
  useEffect(() => {
    if (!priority && imgRef.current) {
      const handleIntersection = (entry: IntersectionObserverEntry) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (imgRef.current) {
            unobserve(imgRef.current);
          }
        }
      };
      
      observe(imgRef.current, handleIntersection, { 
        rootMargin: '200px 0px', // Start loading when 200px from viewport 
        threshold: 0.01 // Trigger when just 1% is visible
      });
      
      return () => {
        if (imgRef.current) {
          unobserve(imgRef.current);
        }
      };
    }
  }, [priority]);

  // Load image when in view with optimized loading strategy
  useEffect(() => {
    if (isInView && !isLoaded && !priority) {
      loadImage(optimizedSrc);
    }
  }, [isInView, isLoaded, optimizedSrc, priority]);

  // Reset loading state when src changes with cleanup
  useEffect(() => {
    if (src !== imgSrc && !priority) {
      setIsLoaded(false);
      setError(false);
      setIsInView(false);
    }
  }, [src, imgSrc, priority]);

  // Enhanced image loading function with caching and optimizations
  const loadImage = (imgSrc: string) => {
    if (!imgSrc) {
      handleImageError();
      return;
    }
    
    // Check if image is in browser cache
    const cachedImage = new Image();
    
    // Set width/height if provided to help with layout stability
    if (width) cachedImage.width = width;
    if (height) cachedImage.height = height;
    
    cachedImage.src = imgSrc;
    
    if (cachedImage.complete) {
      // Image is in cache, load immediately
      setImgSrc(imgSrc);
      setIsLoaded(true);
    } else {
      // Load image with improved event handling
      cachedImage.onload = () => {
        setImgSrc(imgSrc);
        setIsLoaded(true);
      };
      
      cachedImage.onerror = () => {
        handleImageError();
      };
    }
  };

  const handleImageError = () => {
    setError(true);
    if (fallback) {
      setImgSrc(fallback);
      setIsLoaded(true);
    }
    if (onError) {
      onError();
    }
  };
  
  // Generate consistent color hash for placeholder
  const placeholderColor = React.useMemo(() => {
    if (lowQualityUrl) return undefined;
    
    // Generate a consistent color from the src string
    let hash = 0;
    for (let i = 0; i < (src?.length || 0); i++) {
      hash = (hash << 5) - hash + src.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Generate a light pastel color
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 90%)`;
  }, [src, lowQualityUrl]);
  
  return (
    <div 
      ref={imgRef} 
      className={cn('relative overflow-hidden', className)}
      style={{ 
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
        backgroundColor: !isLoaded && placeholderColor ? placeholderColor : undefined
      }}
    >
      {/* Low quality image placeholder for better UX */}
      {lowQualityUrl && !isLoaded && (
        <img
          src={lowQualityUrl}
          alt={alt}
          className="w-full h-full object-cover absolute inset-0 blur-sm"
          aria-hidden="true"
          width={width}
          height={height}
        />
      )}
      
      {/* Optimized loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent animate-pulse">
          <div className="w-6 h-6 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Main image with optimization attributes */}
      {(priority || isInView || isLoaded) && (
        <img
          src={imgSrc || (priority ? optimizedSrc : undefined)}
          alt={alt}
          className={cn(
            'w-full h-auto transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onError={handleImageError}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          width={width}
          height={height}
          fetchPriority={priority ? "high" : "auto"}
        />
      )}
    </div>
  );
};

export default LazyImage;
