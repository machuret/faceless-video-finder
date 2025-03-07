
import { useState } from "react";
import { useInView } from "react-intersection-observer";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
}

const LazyImage = ({ src, alt, className, onError }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={ref} className={`relative ${className || ""}`}>
      {inView ? (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
          )}
          <img
            src={src}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              if (onError) onError();
            }}
          />
        </>
      ) : (
        <div className="w-full h-full bg-gray-200"></div>
      )}
    </div>
  );
};

export default LazyImage;
