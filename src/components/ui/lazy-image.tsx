
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

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
 * Optimized LazyImage component with WebP support, proper caching
 * and performance improvements
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
  const [imgSrc, setImgSrc] = useState('');
  const [error, setError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Handle priority loading
  useEffect(() => {
    if (priority) {
      loadImage(src);
    }
  }, [priority, src]);

  // Setup IntersectionObserver with enhanced performance options
  useEffect(() => {
    if (!priority) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsInView(true);
            if (observerRef.current && imgRef.current) {
              observerRef.current.unobserve(imgRef.current);
            }
          }
        },
        { 
          rootMargin: '200px 0px', // Start loading when 200px from viewport
          threshold: 0.01 // Trigger when just 1% is visible
        }
      );
      
      if (imgRef.current && observerRef.current) {
        observerRef.current.observe(imgRef.current);
      }
      
      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }
  }, [priority]);

  // Load image when in view with optimized loading strategy
  useEffect(() => {
    if (isInView && !isLoaded && !priority) {
      loadImage(src);
    }
  }, [isInView, isLoaded, src, priority]);

  // Reset loading state when src changes with cleanup
  useEffect(() => {
    if (src !== imgSrc && !priority) {
      setIsLoaded(false);
      setError(false);
      setIsInView(false);
      
      if (imgRef.current && observerRef.current) {
        observerRef.current.observe(imgRef.current);
      }
    }
  }, [src, imgSrc, priority]);

  // Enhanced image loading function with caching and optimizations
  const loadImage = (imgSrc: string) => {
    if (!imgSrc) {
      handleImageError();
      return;
    }
    
    // Enhanced check for image formats
    const isWebpSupported = document.createElement('canvas')
      .toDataURL('image/webp')
      .indexOf('data:image/webp') === 0;
    
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
  
  return (
    <div 
      ref={imgRef} 
      className={cn('relative overflow-hidden', className)}
      style={{ 
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined
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
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="w-6 h-6 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Main image with optimization attributes */}
      {(priority || isInView || isLoaded) && (
        <img
          src={imgSrc || (priority ? src : undefined)}
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
