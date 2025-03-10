
import { useState, useCallback } from 'react';

type BrokenLink = {
  url: string;
  text: string;
  status: number;
  error?: string;
};

export function useLinkChecker() {
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [brokenLinks, setBrokenLinks] = useState<BrokenLink[]>([]);
  const [checkedCount, setCheckedCount] = useState(0);
  const [totalLinks, setTotalLinks] = useState(0);

  const reset = useCallback(() => {
    setBrokenLinks([]);
    setProgress(0);
    setCheckedCount(0);
    setTotalLinks(0);
    setIsChecking(false);
  }, []);

  const checkLink = useCallback(async (url: string, linkText: string): Promise<BrokenLink | null> => {
    try {
      // Only check internal links
      if (!url.startsWith('/') && !url.includes(window.location.hostname)) {
        return null;
      }

      // Convert relative URLs to absolute URLs
      const fullUrl = url.startsWith('/') 
        ? `${window.location.origin}${url}` 
        : url;

      // Use fetch to check if the link is valid
      const response = await fetch(fullUrl, { 
        method: 'HEAD', 
        // Don't follow redirects to catch them as potential issues
        redirect: 'manual',
        // Cache busting to ensure we're testing the current state
        cache: 'no-store',
      });

      if (response.status >= 400) {
        return {
          url,
          text: linkText,
          status: response.status,
        };
      }

      // Check redirects as potential issues
      if (response.type === 'opaqueredirect') {
        return {
          url,
          text: linkText,
          status: 302,
          error: 'Redirect detected',
        };
      }

      return null;
    } catch (error) {
      // Network errors or CORS issues
      console.error(`Error checking link ${url}:`, error);
      return {
        url,
        text: linkText,
        status: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, []);

  const scanPageLinks = useCallback(async () => {
    // Reset state
    reset();
    setIsChecking(true);

    try {
      // Get all links in the current page
      const linkElements = document.querySelectorAll('a[href]');
      const links = Array.from(linkElements).filter(link => {
        const href = link.getAttribute('href');
        // Only check internal links - either relative or same domain
        return href && (
          href.startsWith('/') || 
          href.includes(window.location.hostname)
        );
      });

      setTotalLinks(links.length);

      if (links.length === 0) {
        setIsChecking(false);
        return;
      }

      const broken: BrokenLink[] = [];
      
      // Check links one by one to avoid overloading the browser
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const url = link.getAttribute('href') || '';
        const linkText = link.textContent || url;
        
        const result = await checkLink(url, linkText);
        
        if (result) {
          broken.push(result);
        }
        
        setCheckedCount(i + 1);
        setProgress(Math.round(((i + 1) / links.length) * 100));
      }

      setBrokenLinks(broken);
    } catch (error) {
      console.error('Error scanning links:', error);
    } finally {
      setIsChecking(false);
    }
  }, [checkLink, reset]);

  return {
    isChecking,
    progress,
    brokenLinks,
    checkedCount,
    totalLinks,
    scanPageLinks,
    reset,
  };
}
