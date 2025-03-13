
import { useState, useCallback } from 'react';
import { BrokenLink, ScannedPage } from './types';

export const useSiteScanner = (
  pageScanner: {
    scanPageLinks: (url: string, links: { url: string; text: string }[]) => Promise<{ url: string; brokenLinks: BrokenLink[]; totalLinks: number }>;
    isScanning: boolean;
  },
  sitemapExtractor: {
    extractAllPagesFromSitemap: (domain: string) => Promise<string[]>;
    isExtracting: boolean;
  }
) => {
  const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);
  const [pagesScanned, setPagesScanned] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [brokenLinks, setBrokenLinks] = useState<BrokenLink[]>([]);
  const [totalLinks, setTotalLinks] = useState(0);
  const [checkedLinks, setCheckedLinks] = useState(0);
  const [isSiteScanning, setIsSiteScanning] = useState(false);
  
  // Reset scan state
  const resetScan = useCallback(() => {
    setScannedPages([]);
    setPagesScanned(0);
    setTotalPages(0);
    setBrokenLinks([]);
    setTotalLinks(0);
    setCheckedLinks(0);
  }, []);
  
  // Extract all links from a page
  const extractLinksFromPage = useCallback(async (url: string): Promise<{ url: string; text: string }[]> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Get all links
      const links: { url: string; text: string }[] = [];
      const anchorElements = doc.querySelectorAll('a[href]');
      
      anchorElements.forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          // Convert relative URLs to absolute
          const absoluteUrl = new URL(href, url).href;
          links.push({
            url: absoluteUrl,
            text: anchor.textContent?.trim() || absoluteUrl
          });
        }
      });
      
      return links;
    } catch (error) {
      console.error(`Error extracting links from ${url}:`, error);
      return [];
    }
  }, []);
  
  // Scan a site for broken links
  const scanSite = useCallback(async (domain: string) => {
    resetScan();
    setIsSiteScanning(true);
    
    try {
      // Get all pages from sitemap
      const urls = await sitemapExtractor.extractAllPagesFromSitemap(domain);
      setTotalPages(urls.length);
      
      // Initialize scannedPages with the URLs from the sitemap
      setScannedPages(urls.map(url => ({
        url,
        brokenLinks: [],
        totalLinks: 0,
        scanned: false
      })));
      
      // Scan each page in parallel, but limit concurrency
      const concurrencyLimit = 3;
      const results: ScannedPage[] = [];
      
      for (let i = 0; i < urls.length; i += concurrencyLimit) {
        const batch = urls.slice(i, i + concurrencyLimit);
        
        // Process batch in parallel
        const batchPromises = batch.map(async (url) => {
          // Extract links from the page
          const links = await extractLinksFromPage(url);
          
          // Scan the page for broken links
          const result = await pageScanner.scanPageLinks(url, links);
          
          // Update total links count
          setTotalLinks(prevTotal => prevTotal + result.totalLinks);
          setCheckedLinks(prevChecked => prevChecked + result.totalLinks);
          
          // Update broken links array
          setBrokenLinks(prevLinks => [...prevLinks, ...result.brokenLinks]);
          
          // Update the scanned page
          const scannedPage: ScannedPage = {
            url,
            brokenLinks: result.brokenLinks,
            totalLinks: result.totalLinks,
            scanned: true
          };
          
          // Update pages scanned count
          setPagesScanned(prevScanned => prevScanned + 1);
          
          // Update the scannedPages array
          setScannedPages(prevPages => 
            prevPages.map(page => 
              page.url === url ? scannedPage : page
            )
          );
          
          return scannedPage;
        });
        
        // Wait for all pages in this batch to be scanned
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }
      
      return results;
    } catch (error) {
      console.error("Error scanning site:", error);
      throw error;
    } finally {
      setIsSiteScanning(false);
    }
  }, [resetScan, sitemapExtractor, pageScanner, extractLinksFromPage]);
  
  return {
    scanSite,
    isSiteScanning,
    scannedPages,
    totalPages,
    pagesScanned,
    brokenLinks,
    totalLinks,
    checkedLinks,
    resetScan
  };
};
