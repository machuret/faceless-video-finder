
import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  itemHeight?: number;
  windowSize?: number;
  containerClassName?: string;
  loadingElement?: React.ReactNode;
  emptyElement?: React.ReactNode;
}

function OptimizedList<T>({
  items,
  renderItem,
  keyExtractor,
  itemHeight = 300, // Default height for each item
  windowSize = 10, // Number of items to render before and after visible items
  containerClassName = '',
  loadingElement = <div className="py-8 text-center">Loading...</div>,
  emptyElement = <div className="py-8 text-center">No items found</div>
}: OptimizedListProps<T>) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: windowSize * 2 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  
  const { ref: observerRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  useEffect(() => {
    // Get container dimensions after it's mounted
    if (containerRef.current) {
      setContainerHeight(containerRef.current.offsetHeight);
    }
  }, [items.length]);

  useEffect(() => {
    if (!inView) return;
    
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const scrollTop = window.scrollY - container.offsetTop;
      if (scrollTop < 0) return;
      
      const visibleItemsStart = Math.max(0, Math.floor(scrollTop / itemHeight) - windowSize);
      const visibleItemsEnd = Math.min(
        items.length,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + windowSize
      );
      
      setVisibleRange({
        start: visibleItemsStart,
        end: visibleItemsEnd
      });
    };
    
    // Initial calculation
    handleScroll();
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [inView, containerHeight, itemHeight, items.length, windowSize]);

  // If there are no items, show empty state
  if (items.length === 0) {
    return <>{emptyElement}</>;
  }

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  const totalHeight = items.length * itemHeight;

  return (
    <div 
      ref={observerRef} 
      style={{ position: 'relative' }}
    >
      <div 
        ref={containerRef}
        className={containerClassName}
        style={{ height: `${totalHeight}px`, position: 'relative' }}
      >
        {visibleItems.map((item, relativeIndex) => {
          const absoluteIndex = visibleRange.start + relativeIndex;
          return (
            <div 
              key={keyExtractor(item, absoluteIndex)}
              style={{
                position: 'absolute',
                top: `${absoluteIndex * itemHeight}px`,
                width: '100%',
                height: `${itemHeight}px`
              }}
            >
              {renderItem(item, absoluteIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { OptimizedList };
