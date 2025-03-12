
// Shared IntersectionObserver service to reduce redundant observer instances
type ObserverCallback = (entry: IntersectionObserverEntry) => void;
type ObserverInstance = {
  observer: IntersectionObserver;
  elements: Map<Element, ObserverCallback[]>;
};

// Observer options with reasonable defaults
const defaultOptions: IntersectionObserverInit = {
  rootMargin: '200px',
  threshold: 0.01,
};

// Store observers by their option signature to reuse them
const observers = new Map<string, ObserverInstance>();

// Helper to generate a unique key for observer options
const getOptionsKey = (options: IntersectionObserverInit): string => {
  return `${options.rootMargin || '0px'}_${
    Array.isArray(options.threshold) 
      ? options.threshold.join('_') 
      : options.threshold || '0'
  }_${options.root ? 'custom' : 'window'}`;
};

// Get or create an observer with the given options
const getObserver = (options: IntersectionObserverInit = defaultOptions): ObserverInstance => {
  const key = getOptionsKey(options);
  
  if (!observers.has(key)) {
    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        const element = entry.target;
        const callbacks = observers.get(key)?.elements.get(element) || [];
        callbacks.forEach((cb) => cb(entry));
      });
    };
    
    const observer = new IntersectionObserver(callback, options);
    observers.set(key, {
      observer,
      elements: new Map(),
    });
  }
  
  return observers.get(key)!;
};

// Observe an element with the given callback
export const observe = (
  element: Element,
  callback: ObserverCallback,
  options: IntersectionObserverInit = defaultOptions
): void => {
  const instance = getObserver(options);
  
  if (!instance.elements.has(element)) {
    instance.elements.set(element, []);
    instance.observer.observe(element);
  }
  
  const callbacks = instance.elements.get(element)!;
  callbacks.push(callback);
};

// Unobserve an element
export const unobserve = (
  element: Element,
  callback?: ObserverCallback,
  options: IntersectionObserverInit = defaultOptions
): void => {
  const key = getOptionsKey(options);
  const instance = observers.get(key);
  
  if (!instance) return;
  
  if (callback) {
    // Remove specific callback
    const callbacks = instance.elements.get(element);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
      
      // If no more callbacks, remove the element entirely
      if (callbacks.length === 0) {
        instance.elements.delete(element);
        instance.observer.unobserve(element);
      }
    }
  } else {
    // Remove all callbacks for this element
    instance.elements.delete(element);
    instance.observer.unobserve(element);
  }
};

// Clean up all observers
export const disconnectAll = (): void => {
  observers.forEach((instance) => {
    instance.observer.disconnect();
  });
  observers.clear();
};
