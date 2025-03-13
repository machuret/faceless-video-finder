
import { useMemo } from 'react';
import { usePageScanner } from './link-checker/usePageScanner';
import { useSiteScanner } from './link-checker/useSiteScanner';
import { useSitemapExtractor } from './link-checker/useSitemapExtractor';
import { useLinkValidator } from './link-checker/useLinkValidator';
import { BrokenLink } from './link-checker/types';

export const useLinkChecker = () => {
  // Get link validation functionality
  const linkValidator = useLinkValidator();
  
  // Get page scanner functionality
  const pageScanner = usePageScanner(linkValidator);
  
  // Get sitemap extractor functionality
  const sitemapExtractor = useSitemapExtractor();
  
  // Get site scanner functionality - pass the domain parameter through
  const siteScanner = useSiteScanner(pageScanner, sitemapExtractor);
  
  // Combine all functionality
  return useMemo(() => ({
    // Link validation
    validateLink: linkValidator.validateLink,
    validateLinks: linkValidator.validateLinks,
    validationResults: linkValidator.validationResults,
    isValidating: linkValidator.isValidating,
    clearResults: linkValidator.clearResults,
    
    // Page scanning
    scanPageLinks: () => pageScanner.scanPageLinks(window.location.href, extractLinksFromCurrentPage()),
    
    // Site scanning
    scanSite: (domain = window.location.origin) => siteScanner.scanSite(domain),
    isSiteScanning: siteScanner.isSiteScanning,
    scannedPages: siteScanner.scannedPages,
    totalPages: siteScanner.totalPages,
    pagesScanned: siteScanner.pagesScanned,
    brokenLinks: siteScanner.brokenLinks,
    totalLinks: siteScanner.totalLinks,
    checkedLinks: siteScanner.checkedLinks,
    resetScan: siteScanner.resetScan,
    
    // Sitemap extraction
    extractSitemapUrls: (domain: string) => sitemapExtractor.extractAllPagesFromSitemap(domain),
    
    // Add missing properties
    isChecking: pageScanner.isScanning || linkValidator.isValidating,
    progress: siteScanner.checkedLinks > 0 && siteScanner.totalLinks > 0 
      ? (siteScanner.checkedLinks / siteScanner.totalLinks) * 100 
      : 0,
    checkedCount: siteScanner.checkedLinks || 0,
    
    // Add reset method
    reset: () => {
      linkValidator.clearResults();
      siteScanner.resetScan();
    }
  }), [
    linkValidator, 
    pageScanner, 
    siteScanner, 
    sitemapExtractor
  ]);
};

// Helper function to extract links from the current page
function extractLinksFromCurrentPage() {
  const links: { url: string; text: string }[] = [];
  const anchors = document.querySelectorAll('a[href]');
  
  anchors.forEach((anchor) => {
    const href = anchor.getAttribute('href');
    if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
      // Convert relative URLs to absolute
      const absoluteUrl = new URL(href, window.location.href).href;
      links.push({
        url: absoluteUrl,
        text: anchor.textContent?.trim() || absoluteUrl
      });
    }
  });
  
  return links;
}
