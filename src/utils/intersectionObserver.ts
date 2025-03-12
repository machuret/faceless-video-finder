// Shared IntersectionObserver utility
// This improves performance by reusing observers across the application

// Store of all active observers, keyed by option string
const observers: Record<string, { 
  observer: IntersectionObserver; 
  elements: Map<Element, (entry: IntersectionObserverEntry) => void>;
}> = {};

// Convert options to a string key for caching
const getOptionsKey = (options?: IntersectionObserverInit): string => {
  if (!options) return 'default';
  return JSON.stringify({
    root: options.root ? 'custom' : null,
    rootMargin: options.rootMargin || '0px',
    threshold: options.threshold || 0,
  });
};

// Get or create an observer with given options
const getObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver => {
  const key = getOptionsKey(options);
  
  if (!observers[key]) {
    const observer = new IntersectionObserver(callback, options);
    observers[key] = {
      observer,
      elements: new Map()
    };
  }
  
  return observers[key].observer;
};

// Observe an element with a given options
export const observe = (
  element: Element,
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): void => {
  if (!element || typeof window === 'undefined') return;
  
  const key = getOptionsKey(options);
  
  if (!observers[key]) {
    observers[key] = {
      observer: new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          // Call the specific callback for this element
          const elementCallback = observers[key].elements.get(entry.target);
          if (elementCallback) {
            elementCallback(entry);
          }
        });
      }, options),
      elements: new Map()
    };
  }
  
  // Store the callback for this element
  observers[key].elements.set(element, callback);
  
  // Start observing
  observers[key].observer.observe(element);
};

// Stop observing an element
export const unobserve = (element: Element, optionsOverride?: IntersectionObserverInit): void => {
  if (!element || typeof window === 'undefined') return;
  
  // If options are provided, only unobserve from that specific observer
  if (optionsOverride) {
    const key = getOptionsKey(optionsOverride);
    if (observers[key]) {
      observers[key].observer.unobserve(element);
      observers[key].elements.delete(element);
    }
    return;
  }
  
  // Otherwise, unobserve from all observers
  Object.keys(observers).forEach(key => {
    if (observers[key].elements.has(element)) {
      observers[key].observer.unobserve(element);
      observers[key].elements.delete(element);
    }
  });
};

// Clean up all observers (useful for page transitions)
export const disconnectAll = (): void => {
  Object.keys(observers).forEach(key => {
    observers[key].observer.disconnect();
    observers[key].elements.clear();
  });
};
