
import { useCallback } from 'react';
import { useLinkValidator } from './useLinkValidator';
import { BrokenLink } from './types';

export function usePageScanner() {
  const { checkLink } = useLinkValidator();

  const scanPageLinks = useCallback(async (
    setIsChecking: (value: boolean) => void,
    setTotalLinks: (value: number) => void,
    setCheckedCount: (value: number) => void,
    setProgress: (value: number) => void,
    setBrokenLinks: (links: BrokenLink[]) => void
  ) => {
    // Reset state is handled by caller
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
  }, [checkLink]);

  return { scanPageLinks };
}
