
import { useState, useCallback } from 'react';
import { BrokenLink, ValidatedLink } from './types';

export const usePageScanner = (linkValidator: {
  validateLink: (link: string, linkText: string, pageUrl: string) => Promise<BrokenLink | null>;
  validateLinks: (links: { url: string; text: string; pageUrl: string }[]) => Promise<BrokenLink[]>;
  isValidating: boolean;
  validationResults: BrokenLink[];
  clearResults: () => void;
}) => {
  const [isScanning, setIsScanning] = useState(false);

  // Scan links on a single page
  const scanPageLinks = useCallback(async (url: string, links: { url: string; text: string }[]) => {
    setIsScanning(true);
    
    try {
      // Map links to the format expected by validateLinks
      const linksToValidate = links.map(link => ({
        url: link.url,
        text: link.text,
        pageUrl: url
      }));
      
      // Validate all links
      const brokenLinks = await linkValidator.validateLinks(linksToValidate);
      
      // Return found broken links along with the count of total links
      return {
        url,
        brokenLinks,
        totalLinks: links.length
      };
    } catch (error) {
      console.error(`Error scanning page ${url}:`, error);
      return {
        url,
        brokenLinks: [],
        totalLinks: links.length,
        error: error.message
      };
    } finally {
      setIsScanning(false);
    }
  }, [linkValidator]);

  return {
    scanPageLinks,
    isScanning
  };
};
