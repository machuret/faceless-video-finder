
import React, { Component, ErrorInfo } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error,
      retryCount: 0 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Clear cached data in case data corruption is the cause
    this.clearCaches();
  }

  clearCaches = (): void => {
    try {
      // Clear application cache
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            console.log(`Clearing cache: ${cacheName}`);
            caches.delete(cacheName);
          });
        });
      }
      
      // Clear specific localStorage items that might be causing issues
      // Only clear cache-related items, not user settings
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('cache') || key.includes('temp') || key.includes('data'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        console.log(`Clearing localStorage item: ${key}`);
        localStorage.removeItem(key);
      });
      
      console.log('Caches cleared successfully');
    } catch (e) {
      console.error('Error clearing caches:', e);
    }
  }

  handleRetry = (): void => {
    const { retryCount } = this.state;
    
    // Clear any cached data before retrying
    this.clearCaches();
    
    // Reset the error state to trigger a re-render
    this.setState({
      hasError: false,
      error: null,
      retryCount: retryCount + 1
    });
    
    // Reload the current component without refreshing the whole page
    // This is useful for data fetching errors
    window.location.reload();
    
    toast.success('Retrying...');
  }

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-6 bg-red-50 border border-red-100 rounded-lg text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Something went wrong</h2>
          <p className="text-red-700 mb-4 max-w-md">
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <Button 
            onClick={this.handleRetry}
            variant="outline"
            className="flex items-center gap-2 bg-white hover:bg-red-50"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
