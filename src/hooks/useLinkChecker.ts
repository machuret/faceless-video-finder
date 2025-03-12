
import { useState, useCallback } from 'react';

type BrokenLink = {
  url: string;
  text: string;
  status: number;
  pageUrl?: string; // Add page URL to track where link was found
  error?: string;
};

export function useLinkChecker() {
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [brokenLinks, setBrokenLinks] = useState<BrokenLink[]>([]);
  const [checkedCount, setCheckedCount] = useState(0);
  const [totalLinks, setTotalLinks] = useState(0);
  const [pagesScanned, setPagesScanned] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isSiteScanning, setIsSiteScanning] = useState(false);

  const reset = useCallback(() => {
    setBrokenLinks([]);
    setProgress(0);
    setCheckedCount(0);
    setTotalLinks(0);
    setPagesScanned(0);
    setTotalPages(0);
    setIsChecking(false);
    setIsSiteScanning(false);
  }, []);

  const checkLink = useCallback(async (url: string, linkText: string, pageUrl?: string): Promise<BrokenLink | null> => {
    try {
      // Skip anchor links (they don't need external checking)
      if (url.startsWith('#')) {
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

  const scanPageLinks = useCallback(async () => {
    // Reset state
    reset();
    setIsChecking(true);

    try {
      // Get all links in the current page
      const linkElements = document.querySelectorAll('a[href]');
      const links = Array.from(linkElements);
      
      console.log(`Found ${links.length} links on the page to check`);
      setTotalLinks(links.length);

      if (links.length === 0) {
        setIsChecking(false);
        return;
      }

      const broken: BrokenLink[] = [];
      
      // Check links one by one
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const url = link.getAttribute('href') || '';
        const linkText = link.textContent || url;
        
        // Skip empty links
        if (!url) {
          setCheckedCount(i + 1);
          setProgress(Math.round(((i + 1) / links.length) * 100));
          continue;
        }
        
        console.log(`Checking link ${i+1}/${links.length}: ${url}`);
        const result = await checkLink(url, linkText);
        
        if (result) {
          console.log(`Found broken link: ${url} - Status: ${result.status}`);
          broken.push(result);
        }
        
        setCheckedCount(i + 1);
        setProgress(Math.round(((i + 1) / links.length) * 100));
      }

      console.log(`Link checking complete. Found ${broken.length} broken links`);
      setBrokenLinks(broken);
    } catch (error) {
      console.error('Error scanning links:', error);
    } finally {
      setIsChecking(false);
    }
  }, [checkLink, reset]);

  const scanSiteLinks = useCallback(async () => {
    // Reset state
    reset();
    setIsChecking(true);
    setIsSiteScanning(true);
    
    try {
      // Initial pages to scan (important site pages)
      const initialPages = [
        window.location.origin + '/',
        window.location.origin + '/admin/dashboard',
        window.location.origin + '/channel-types',
        window.location.origin + '/niches',
        window.location.origin + '/calculators',
      ];
      
      setTotalPages(initialPages.length);
      const visitedUrls = new Set<string>();
      const broken: BrokenLink[] = [];
      let totalLinksCount = 0;
      let checkedLinksCount = 0;
      
      // Process each page
      for (let i = 0; i < initialPages.length; i++) {
        const pageUrl = initialPages[i];
        if (visitedUrls.has(pageUrl)) continue;
        visitedUrls.add(pageUrl);
        
        try {
          console.log(`Scanning page ${i+1}/${initialPages.length}: ${pageUrl}`);
          
          // Fetch the page HTML
          const response = await fetch(pageUrl);
          const html = await response.text();
          
          // Create a DOM parser to extract links
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const linkElements = doc.querySelectorAll('a[href]');
          const links = Array.from(linkElements);
          
          console.log(`Found ${links.length} links on ${pageUrl}`);
          totalLinksCount += links.length;
          setTotalLinks(totalLinksCount);
          
          // Check each link on the current page
          for (let j = 0; j < links.length; j++) {
            const link = links[j];
            const url = link.getAttribute('href') || '';
            const linkText = link.textContent || url;
            
            // Skip empty links
            if (!url || url === '#' || url.startsWith('javascript:')) {
              checkedLinksCount++;
              continue;
            }
            
            // Check the link
            const result = await checkLink(url, linkText, pageUrl);
            
            if (result) {
              console.log(`Found broken link: ${url} on page ${pageUrl} - Status: ${result.status}`);
              broken.push(result);
            }
            
            checkedLinksCount++;
            setCheckedCount(checkedLinksCount);
            setProgress(Math.round((checkedLinksCount / totalLinksCount) * 100));
          }
        } catch (error) {
          console.error(`Error scanning page ${pageUrl}:`, error);
          broken.push({
            url: pageUrl,
            text: pageUrl,
            status: 0,
            error: error instanceof Error ? error.message : String(error),
          });
        }
        
        setPagesScanned(i + 1);
      }
      
      console.log(`Site-wide scan complete. Checked ${visitedUrls.size} pages, found ${broken.length} broken links`);
      setBrokenLinks(broken);
    } catch (error) {
      console.error('Error during site-wide scan:', error);
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
    pagesScanned,
    totalPages,
    isSiteScanning,
    scanPageLinks,
    scanSiteLinks,
    reset,
  };
}
