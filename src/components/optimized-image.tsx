
import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
  loading?: 'eager' | 'lazy';
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  fetchPriority = 'auto',
  loading = 'lazy',
  onLoad,
  onError,
  placeholder,
  blurDataURL
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Determine correct loading strategy
  const actualLoading = priority ? 'eager' : loading;
  const actualFetchPriority = priority ? 'high' : fetchPriority;

  // Handle load event
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  // Handle error event
  const handleError = () => {
    setError(true);
    if (onError) onError();
  };

  // If there's an error, show a placeholder
  if (error) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Image failed to load</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={actualLoading}
        fetchPriority={actualFetchPriority}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          objectFit: 'cover',
          transition: 'opacity 0.3s ease-in-out',
          willChange: 'opacity', // Hint to the browser for optimization
        }}
      />
    </div>
  );
};

export default OptimizedImage;
