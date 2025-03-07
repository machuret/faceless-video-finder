
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
}

const LazyImage = ({ 
  src, 
  alt, 
  className, 
  onError 
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState('');

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImgSrc(src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      if (onError) {
        onError();
      }
    };
  }, [src, onError]);

  return (
    <div className={cn('relative', className)}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
          <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
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
            if (onError) {
              onError();
            }
          }}
        />
      )}
    </div>
  );
};

export default LazyImage;
