
import { useMemo } from 'react';
import { usePageScanner } from './link-checker/usePageScanner';
import { useSiteScanner } from './link-checker/useSiteScanner';
import { useSitemapExtractor } from './link-checker/useSitemapExtractor';
import { useLinkValidator } from './link-checker/useLinkValidator';

export const useLinkChecker = () => {
  // Get link validation functionality
  const linkValidator = useLinkValidator();
  
  // Get page scanner functionality
  const pageScanner = usePageScanner(linkValidator);
  
  // Get sitemap extractor functionality
  const sitemapExtractor = useSitemapExtractor();
  
  // Get site scanner functionality
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
    scanPageLinks: pageScanner.scanPageLinks,
    
    // Site scanning
    scanSite: siteScanner.scanSite,
    isSiteScanning: siteScanner.isSiteScanning,
    scannedPages: siteScanner.scannedPages,
    totalPages: siteScanner.totalPages,
    pagesScanned: siteScanner.pagesScanned,
    brokenLinks: siteScanner.brokenLinks,
    totalLinks: siteScanner.totalLinks,
    checkedLinks: siteScanner.checkedLinks,
    resetScan: siteScanner.resetScan,
    
    // Sitemap extraction
    extractSitemapUrls: sitemapExtractor.extractAllPagesFromSitemap
  }), [
    linkValidator, 
    pageScanner, 
    siteScanner, 
    sitemapExtractor
  ]);
};
