
import { useCallback } from 'react';
import { useLinkValidator } from './useLinkValidator';
import { useSitemapExtractor } from './useSitemapExtractor';
import { BrokenLink, ScannedPage } from './types';

export function useSiteScanner() {
  const { checkLink } = useLinkValidator();
  const { extractAllPagesFromSitemap } = useSitemapExtractor();

  const scanSiteLinks = useCallback(async (
    setIsChecking: (value: boolean) => void,
    setIsSiteScanning: (value: boolean) => void,
    setTotalPages: (value: number) => void,
    setPagesScanned: (value: number) => void,
    setTotalLinks: (value: number) => void,
    setCheckedCount: (value: number) => void,
    setProgress: (value: number) => void,
    setScannedPages: (pages: ScannedPage[]) => void,
    setBrokenLinks: (links: BrokenLink[]) => void
  ) => {
    // Reset state is handled by caller
    setIsChecking(true);
    setIsSiteScanning(true);
    
    try {
      // Get pages from sitemap first
      const sitemapPages = await extractAllPagesFromSitemap();
      
      // Initial pages to scan (important site pages)
      const initialPages = [
        window.location.origin + '/',
        window.location.origin + '/admin/dashboard',
        window.location.origin + '/admin/channel-types',
        window.location.origin + '/admin/manage-niches',
        window.location.origin + '/admin/manage-faceless-ideas',
        window.location.origin + '/channel-types',
        window.location.origin + '/niches',
        window.location.origin + '/calculators',
        window.location.origin + '/channels',
        window.location.origin + '/faceless-ideas',
        window.location.origin + '/about-us',
        window.location.origin + '/how-it-works',
        window.location.origin + '/training',
        window.location.origin + '/contact-us',
        ...sitemapPages
      ];
      
      // Remove duplicates
      const uniquePages = Array.from(new Set(initialPages));
      setTotalPages(uniquePages.length);
      
      const visitedUrls = new Set<string>();
      const broken: BrokenLink[] = [];
      let totalLinksCount = 0;
      let checkedLinksCount = 0;
      const scannedPagesData: ScannedPage[] = [];
      
      // Process each page
      for (let i = 0; i < uniquePages.length; i++) {
        const pageUrl = uniquePages[i];
        if (visitedUrls.has(pageUrl)) continue;
        visitedUrls.add(pageUrl);
        
        const pageResult: ScannedPage = {
          url: pageUrl,
          linkCount: 0,
          brokenCount: 0,
          status: 'pending'
        };
        
        try {
          console.log(`Scanning page ${i+1}/${uniquePages.length}: ${pageUrl}`);
          
          // Fetch the page HTML
          const response = await fetch(pageUrl, { cache: 'no-store' });
          
          if (!response.ok) {
            pageResult.status = 'error';
            scannedPagesData.push(pageResult);
            continue;
          }
          
          const html = await response.text();
          
          // Create a DOM parser to extract links
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const linkElements = doc.querySelectorAll('a[href]');
          const links = Array.from(linkElements);
          
          pageResult.linkCount = links.length;
          console.log(`Found ${links.length} links on ${pageUrl}`);
          totalLinksCount += links.length;
          setTotalLinks(totalLinksCount);
          
          let pageBrokenCount = 0;
          
          // Check each link on the current page
          for (let j = 0; j < links.length; j++) {
            const link = links[j];
            const url = link.getAttribute('href') || '';
            const linkText = link.textContent || url;
            
            // Skip empty links, anchors, and javascript links
            if (!url || url === '#' || url.startsWith('javascript:') || 
                url.startsWith('mailto:') || url.startsWith('tel:')) {
              checkedLinksCount++;
              continue;
            }
            
            // Skip non-http links (like mailto: or tel:)
            if (!url.startsWith('http') && !url.startsWith('/')) {
              checkedLinksCount++;
              continue;
            }
            
            // Check the link
            const result = await checkLink(url, linkText, pageUrl);
            
            if (result) {
              console.log(`Found broken link: ${url} on page ${pageUrl} - Status: ${result.status}`);
              broken.push(result);
              pageBrokenCount++;
            }
            
            checkedLinksCount++;
            setCheckedCount(checkedLinksCount);
            setProgress(Math.round((checkedLinksCount / totalLinksCount) * 100));
          }
          
          pageResult.brokenCount = pageBrokenCount;
          pageResult.status = 'success';
        } catch (error) {
          console.error(`Error scanning page ${pageUrl}:`, error);
          pageResult.status = 'error';
          broken.push({
            url: pageUrl,
            text: pageUrl,
            status: 0,
            error: error instanceof Error ? error.message : String(error),
          });
        }
        
        scannedPagesData.push(pageResult);
        setScannedPages([...scannedPagesData]);
        setPagesScanned(i + 1);
      }
      
      console.log(`Site-wide scan complete. Checked ${visitedUrls.size} pages with ${totalLinksCount} links, found ${broken.length} broken links`);
      setBrokenLinks(broken);
    } catch (error) {
      console.error('Error during site-wide scan:', error);
    } finally {
      setIsChecking(false);
    }
  }, [checkLink, extractAllPagesFromSitemap]);

  return { scanSiteLinks };
}
