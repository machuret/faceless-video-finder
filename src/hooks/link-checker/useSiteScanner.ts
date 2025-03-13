
import { useState, useCallback } from 'react';
import { BrokenLink, ScannedPage } from './types';
import { useLinkValidator } from './useLinkValidator';
import { useSitemapExtractor } from './useSitemapExtractor';

export const useSiteScanner = () => {
  const [isSiteScanning, setIsSiteScanning] = useState(false);
  const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [pagesScanned, setPagesScanned] = useState(0);
  const [brokenLinks, setBrokenLinks] = useState<BrokenLink[]>([]);
  const [totalLinks, setTotalLinks] = useState(0);
  const [checkedLinks, setCheckedLinks] = useState(0);
  
  const { validateLinks } = useLinkValidator();
  const { extractSitemapUrls } = useSitemapExtractor();
  
  const resetScan = useCallback(() => {
    setIsSiteScanning(false);
    setScannedPages([]);
    setTotalPages(0);
    setPagesScanned(0);
    setBrokenLinks([]);
    setTotalLinks(0);
    setCheckedLinks(0);
  }, []);
  
  const extractLinksFromPage = useCallback(async (url: string) => {
    try {
      // Fetch the page HTML
      const response = await fetch(url);
      const html = await response.text();
      
      // Create a DOM parser and parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Get all links
      const links = Array.from(doc.querySelectorAll('a[href]'));
      
      return links.map(link => {
        const href = link.getAttribute('href') || '';
        let absoluteUrl = href;
        
        // Convert relative URLs to absolute
        if (!href.startsWith('http') && !href.startsWith('mailto:') && 
            !href.startsWith('tel:') && !href.startsWith('#') && 
            !href.startsWith('javascript:')) {
          
          try {
            absoluteUrl = new URL(href, url).href;
          } catch (e) {
            console.warn(`Could not convert to absolute URL: ${href}`);
            return null;
          }
        }
        
        return {
          url: absoluteUrl,
          text: link.textContent || '',
          pageUrl: url
        };
      }).filter(link => link !== null && link.url.startsWith('http'));
    } catch (error) {
      console.error(`Error extracting links from ${url}:`, error);
      return [];
    }
  }, []);
  
  const scanSite = useCallback(async (domain: string) => {
    try {
      setIsSiteScanning(true);
      resetScan();
      
      // Extract sitemap URLs
      const sitemapUrl = `${domain.replace(/\/$/, '')}/sitemap.xml`;
      const pageUrls = await extractSitemapUrls(sitemapUrl);
      
      if (pageUrls.length === 0) {
        console.warn('No URLs found in sitemap, scanning homepage only');
        pageUrls.push(domain);
      }
      
      setTotalPages(pageUrls.length);
      
      // Track all links to avoid duplicates
      const allLinks: Array<{ url: string, text: string, pageUrl: string }> = [];
      const scannedUrls: string[] = [];
      
      // Scan each page in the sitemap
      for (const pageUrl of pageUrls) {
        try {
          if (scannedUrls.includes(pageUrl)) continue;
          scannedUrls.push(pageUrl);
          
          // Create a pending entry for this page
          setScannedPages(prev => [
            ...prev, 
            { url: pageUrl, linkCount: 0, brokenCount: 0, status: 'pending' }
          ]);
          
          // Extract links from the page
          const links = await extractLinksFromPage(pageUrl);
          
          // Remove duplicates within this page
          const uniqueLinks = links.filter((link, index, self) => 
            self.findIndex(l => l?.url === link?.url) === index
          );
          
          // Add links to our overall collection
          allLinks.push(...uniqueLinks);
          
          // Update the scanned page to success status
          setScannedPages(prev => 
            prev.map(page => 
              page.url === pageUrl 
                ? { ...page, linkCount: uniqueLinks.length, status: 'success' } 
                : page
            )
          );
          
          setPagesScanned(prev => prev + 1);
        } catch (error) {
          console.error(`Error scanning page ${pageUrl}:`, error);
          
          // Update the scanned page to error status
          setScannedPages(prev => 
            prev.map(page => 
              page.url === pageUrl 
                ? { ...page, status: 'error' } 
                : page
            )
          );
          
          setPagesScanned(prev => prev + 1);
        }
      }
      
      // De-duplicate all links across all pages
      const uniqueAllLinks = allLinks.filter((link, index, self) => 
        self.findIndex(l => l.url === link.url) === index
      );
      
      setTotalLinks(uniqueAllLinks.length);
      
      // Validate all links in batches to avoid overwhelming the browser
      const BATCH_SIZE = 10;
      const totalBatches = Math.ceil(uniqueAllLinks.length / BATCH_SIZE);
      let collectedBrokenLinks: BrokenLink[] = [];
      
      for (let i = 0; i < totalBatches; i++) {
        const batch = uniqueAllLinks.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
        const brokenBatch = await validateLinks(batch);
        
        collectedBrokenLinks = [...collectedBrokenLinks, ...brokenBatch];
        setBrokenLinks(collectedBrokenLinks);
        setCheckedLinks((i + 1) * BATCH_SIZE > uniqueAllLinks.length ? uniqueAllLinks.length : (i + 1) * BATCH_SIZE);
        
        // Update broken links count for each page
        for (const brokenLink of brokenBatch) {
          setScannedPages(prev => 
            prev.map(page => 
              page.url === brokenLink.source 
                ? { ...page, brokenCount: page.brokenCount + 1 } 
                : page
            )
          );
        }
      }
      
    } catch (error) {
      console.error('Error scanning site:', error);
    } finally {
      setIsSiteScanning(false);
    }
  }, [extractLinksFromPage, extractSitemapUrls, resetScan, validateLinks]);
  
  return {
    isSiteScanning,
    scannedPages,
    totalPages,
    pagesScanned,
    brokenLinks,
    totalLinks,
    checkedLinks,
    scanSite,
    resetScan
  };
};
