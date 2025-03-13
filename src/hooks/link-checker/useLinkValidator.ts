
import { useCallback } from 'react';
import { BrokenLink } from './types';

export function useLinkValidator() {
  const checkLink = useCallback(async (url: string, linkText: string, pageUrl?: string): Promise<BrokenLink | null> => {
    try {
      // Skip anchor links (they don't need external checking)
      if (url.startsWith('#')) {
        return null;
      }

      // Skip javascript: links
      if (url.startsWith('javascript:')) {
        return null;
      }

      // Skip mailto: links
      if (url.startsWith('mailto:')) {
        return null;
      }

      // Skip tel: links
      if (url.startsWith('tel:')) {
        return null;
      }

      // Convert relative URLs to absolute URLs
      const fullUrl = url.startsWith('/') 
        ? `${window.location.origin}${url}` 
        : url;

      // Use fetch to check if the link is valid
      const response = await fetch(fullUrl, { 
        method: 'HEAD', 
        redirect: 'manual',
        cache: 'no-store',
      }).catch(error => {
        console.error(`Network error fetching ${url}:`, error);
        return null;
      });

      if (!response) {
        return {
          url,
          text: linkText,
          pageUrl,
          status: 0,
          error: 'Network error or CORS issue'
        };
      }

      if (response.status >= 400) {
        return {
          url,
          text: linkText,
          pageUrl,
          status: response.status,
        };
      }

      // Check redirects as potential issues
      if (response.type === 'opaqueredirect') {
        return {
          url,
          text: linkText,
          pageUrl,
          status: 302,
          error: 'Redirect detected',
        };
      }

      return null;
    } catch (error) {
      console.error(`Error checking link ${url}:`, error);
      return {
        url,
        text: linkText,
        pageUrl,
        status: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, []);

  return { checkLink };
}
