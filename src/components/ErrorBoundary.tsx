
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    
    // Check if it's a module loading error
    const isLoadingError = 
      error.message && (
        error.message.includes("Failed to fetch dynamically imported module") ||
        error.message.includes("Loading chunk") ||
        error.message.includes("Loading CSS chunk") ||
        error.message.includes("Network error")
      );
    
    if (isLoadingError) {
      console.warn("Module loading error detected. Will attempt to reload the page in 3 seconds.");
      
      // Force clear the browser cache for this page and then reload
      setTimeout(() => {
        // Try to clear the cache for the page
        if ('caches' in window) {
          caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
              caches.delete(cacheName);
            });
          });
        }
        
        // Hard reload the page
        window.location.reload();
      }, 3000);
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isLoadingError = this.state.error?.message?.includes("Failed to fetch dynamically imported module") || 
                            this.state.error?.message?.includes("Loading chunk");

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            {isLoadingError && (
              <p className="text-blue-600 mb-4">
                Attempting to reload the page in a moment...
              </p>
            )}
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/";
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Homepage
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
