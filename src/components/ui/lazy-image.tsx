
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  onError?: () => void;
}

const LazyImage = ({ 
  src, 
  alt, 
  className, 
  fallback = '/placeholder.svg', 
  onError 
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset states when src changes
    setIsLoaded(false);
    setError(false);
    
    if (!src) {
      setError(true);
      setImgSrc(fallback);
      setIsLoaded(true);
      return;
    }

    // Use browser's IntersectionObserver to load image only when in viewport
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          setImgSrc(src);
          setIsLoaded(true);
          setError(false);
        };
        img.onerror = () => {
          setError(true);
          if (fallback) {
            setImgSrc(fallback);
            setIsLoaded(true);
          }
          if (onError) {
            onError();
          }
        };
        observer.disconnect();
      }
    }, { rootMargin: '200px' }); // Load images when they're 200px from viewport

    const container = document.createElement('div');
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [src, fallback, onError]);

  return (
    <div className={cn('relative', className)}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
          <div className="w-6 h-6 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
        </div>
      )}
      {imgSrc && (
        <img
          src={imgSrc}
          alt={alt}
          className={cn(
            'w-full h-auto rounded-md transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onError={() => {
            if (!error && fallback) {
              setImgSrc(fallback);
              setError(true);
            }
            if (onError) {
              onError();
            }
          }}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default LazyImage;
