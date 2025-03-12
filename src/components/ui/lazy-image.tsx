
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

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
 * LazyImage component that efficiently loads images only when they are close
 * to entering the viewport using IntersectionObserver
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
  
  // Setup IntersectionObserver to detect when image is near viewport
  useEffect(() => {
    if (!priority && imgRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsInView(true);
            setImgSrc(src);
            observer.disconnect();
          }
        },
        { rootMargin: '200px 0px' } // Start loading when image is 200px from viewport
      );
      
      observer.observe(imgRef.current);
      
      return () => {
        observer.disconnect();
      };
    }
  }, [priority, src]);

  // Reset loading state when src changes
  useEffect(() => {
    if (src !== imgSrc && !priority) {
      setIsLoaded(false);
      setError(false);
      setIsInView(false);
    }
  }, [src, imgSrc, priority]);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    setError(true);
    if (fallback) {
      setImgSrc(fallback);
    }
    if (onError) {
      onError();
    }
  };
  
  // Generate a consistent placeholder color based on src
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
      {/* Low quality image placeholder */}
      {lowQualityUrl && !isLoaded && (
        <img
          src={lowQualityUrl}
          alt={alt}
          className="w-full h-full object-cover absolute inset-0 blur-sm"
          aria-hidden="true"
        />
      )}
      
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent">
          <Skeleton className="w-full h-full opacity-50" />
        </div>
      )}
      
      {/* Main image */}
      {(priority || isInView || isLoaded) && (
        <img
          src={imgSrc}
          alt={alt}
          className={cn(
            'w-full h-auto transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={priority ? "eager" : "lazy"}
          width={width}
          height={height}
          // Fix fetchPriority attribute error by using proper lowercase attribute
          fetchpriority={priority ? "high" : "auto"}
        />
      )}
    </div>
  );
};

export default LazyImage;
