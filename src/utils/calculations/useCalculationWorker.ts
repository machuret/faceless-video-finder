
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook to manage a Web Worker for complex calculations
 */
export function useCalculationWorker() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  // Initialize worker
  useEffect(() => {
    // Only create the worker in browser environment
    if (typeof window !== 'undefined') {
      try {
        // Create a URL for the worker script
        const workerUrl = URL.createObjectURL(
          new Blob(
            [`importScripts('${window.location.origin}/src/utils/calculations/calculationWorker.ts');`], 
            { type: 'application/javascript' }
          )
        );
        
        // Create worker
        workerRef.current = new Worker(workerUrl);
        
        // Set up message handler
        workerRef.current.onmessage = (e) => {
          const { type, data, message } = e.data;
          
          if (type === 'error') {
            setError(message);
            setIsCalculating(false);
          } else {
            setResult(data);
            setError(null);
            setIsCalculating(false);
          }
        };
        
        // Handle worker errors
        workerRef.current.onerror = (e) => {
          setError(e.message || 'Worker error');
          setIsCalculating(false);
        };
      } catch (err) {
        console.error('Failed to create web worker:', err);
        setError('Failed to initialize calculation worker');
      }
    }
    
    // Clean up
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Function to run calculations
  const calculate = useCallback(<T>(type: string, data: any): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        // Fallback calculation if worker failed to initialize
        try {
          console.warn('Worker not available, calculating on main thread');
          let result;
          
          switch (type) {
            case 'calculateChannelRevenue':
              result = calculateFallback(data);
              break;
              
            case 'calculateViewsProjection':
              result = projectionFallback(data);
              break;
              
            case 'calculateGrowthRate':
              result = growthRateFallback(data);
              break;
              
            default:
              throw new Error(`Unknown calculation type: ${type}`);
          }
          
          setResult(result);
          setIsCalculating(false);
          resolve(result as T);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Calculation error');
          setIsCalculating(false);
          reject(err);
        }
        return;
      }
      
      try {
        setIsCalculating(true);
        setError(null);
        
        // One-time message handler for this calculation
        const messageHandler = (e: MessageEvent) => {
          const { type: responseType, data: responseData, message } = e.data;
          
          if (responseType === 'error') {
            setError(message);
            setIsCalculating(false);
            workerRef.current?.removeEventListener('message', messageHandler);
            reject(new Error(message));
          } else if (responseType === `${type.replace('calculate', '').toLowerCase()}Result`) {
            setResult(responseData);
            setIsCalculating(false);
            workerRef.current?.removeEventListener('message', messageHandler);
            resolve(responseData as T);
          }
        };
        
        // Add temporary message handler
        workerRef.current.addEventListener('message', messageHandler);
        
        // Send calculation request to worker
        workerRef.current.postMessage({ type, data });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send calculation to worker');
        setIsCalculating(false);
        reject(err);
      }
    });
  }, []);

  // Simplified fallback functions if worker fails
  const calculateFallback = (data: any) => {
    const { views, cpm = 2.0, monetizedViewsPercentage = 0.7 } = data;
    const revenue = (views * monetizedViewsPercentage * cpm) / 1000;
    return {
      totalRevenue: revenue,
      monthlyRevenue: revenue / 12,
      perVideoRevenue: revenue / 10
    };
  };
  
  const projectionFallback = (data: any) => {
    const { currentViews, growthRate, months } = data;
    let projected = currentViews;
    for (let i = 0; i < months; i++) {
      projected *= (1 + (growthRate / 100));
    }
    return { totalProjectedViews: Math.round(projected) };
  };
  
  const growthRateFallback = (data: any) => {
    const { viewsData } = data;
    if (viewsData.length < 2) return { error: 'Not enough data' };
    
    const first = viewsData[0].views;
    const last = viewsData[viewsData.length - 1].views;
    return {
      totalViewsGrowthRate: (((last - first) / first) * 100).toFixed(2)
    };
  };

  return {
    result,
    error,
    isCalculating,
    calculate
  };
}
