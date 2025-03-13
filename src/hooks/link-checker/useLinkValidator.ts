
import { useState, useEffect, useCallback } from 'react';
import { BrokenLink } from './types';

export const useLinkValidator = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<BrokenLink[]>([]);

  // Clear validation results
  const clearResults = useCallback(() => {
    setValidationResults([]);
  }, []);

  // Validate a single link
  const validateLink = useCallback(async (link: string, linkText: string, pageUrl: string): Promise<BrokenLink | null> => {
    try {
      setIsValidating(true);
      
      // Handle mailto links
      if (link.startsWith('mailto:')) {
        return null;
      }
      
      // Handle telephone links
      if (link.startsWith('tel:')) {
        return null;
      }
      
      // Skip javascript: links
      if (link.startsWith('javascript:')) {
        return null;
      }
      
      // Skip anchor links (internal page navigation)
      if (link.startsWith('#')) {
        return null;
      }

      // Try fetching the URL
      try {
        const response = await fetch(link, { method: 'HEAD', redirect: 'follow' });
        
        // Return null for successful status codes
        if (response.ok) {
          return null;
        }
        
        return {
          url: link,
          text: linkText,
          pageUrl,
          status: response.status,
          error: `HTTP error: ${response.status} ${response.statusText}`,
          source: pageUrl,
          statusText: response.statusText
        };
      } catch (networkError) {
        // Handle network errors
        return {
          url: link,
          text: linkText,
          pageUrl,
          status: 0,
          error: networkError?.toString() || 'Network error',
          source: pageUrl,
          statusText: 'Network Error'
        };
      }
    } catch (error) {
      console.error('Error validating link:', error);
      return {
        url: link,
        text: linkText,
        pageUrl,
        status: 0,
        error: error?.toString() || 'Unknown error',
        source: pageUrl,
        statusText: 'Unknown Error'
      };
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Validate multiple links
  const validateLinks = useCallback(async (links: Array<{ url: string, text: string, pageUrl: string }>) => {
    setIsValidating(true);
    setValidationResults([]);
    
    try {
      const results = await Promise.all(
        links.map(link => validateLink(link.url, link.text, link.pageUrl))
      );
      
      // Filter out null results (successful validations) and set the broken links
      const brokenLinks = results.filter(result => result !== null) as BrokenLink[];
      setValidationResults(brokenLinks);
      
      return brokenLinks;
    } catch (error) {
      console.error('Error validating links:', error);
      return [];
    } finally {
      setIsValidating(false);
    }
  }, [validateLink]);

  return {
    isValidating,
    validationResults,
    validateLink,
    validateLinks,
    clearResults
  };
};
