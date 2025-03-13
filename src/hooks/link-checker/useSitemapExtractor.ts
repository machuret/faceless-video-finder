
import { useCallback } from 'react';

export function useSitemapExtractor() {
  const extractAllPagesFromSitemap = useCallback(async (): Promise<string[]> => {
    try {
      // Attempt to fetch the sitemap.xml if it exists
      const sitemapResponse = await fetch('/sitemap.xml').catch(() => null);
      
      if (sitemapResponse && sitemapResponse.ok) {
        const sitemapText = await sitemapResponse.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(sitemapText, "text/xml");
        const urls = xmlDoc.getElementsByTagName("url");
        
        return Array.from(urls).map(url => {
          const loc = url.getElementsByTagName("loc")[0];
          return loc ? loc.textContent || "" : "";
        }).filter(url => url !== "");
      }
      
      // If no sitemap, return empty array
      return [];
    } catch (error) {
      console.error("Error fetching sitemap:", error);
      return [];
    }
  }, []);

  return { extractAllPagesFromSitemap };
}
