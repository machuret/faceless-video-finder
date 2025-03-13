
import { useState, useCallback } from 'react';

export const useSitemapExtractor = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  
  // Extract all pages from a sitemap
  const extractAllPagesFromSitemap = useCallback(async (domain: string): Promise<string[]> => {
    setIsExtracting(true);
    
    try {
      // Try to fetch the sitemap.xml
      const sitemapUrl = `${domain}/sitemap.xml`;
      const response = await fetch(sitemapUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      
      // Parse XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");
      
      // Extract URLs from the sitemap
      const urls: string[] = [];
      const locationNodes = xmlDoc.getElementsByTagName('loc');
      
      for (let i = 0; i < locationNodes.length; i++) {
        const url = locationNodes[i].textContent;
        if (url) {
          urls.push(url);
        }
      }
      
      return urls;
    } catch (error) {
      console.error("Error extracting sitemap URLs:", error);
      
      // If sitemap.xml fails, return the domain as a fallback
      return [domain];
    } finally {
      setIsExtracting(false);
    }
  }, []);
  
  return {
    extractAllPagesFromSitemap,
    isExtracting
  };
};
