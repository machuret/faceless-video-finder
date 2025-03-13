
import { useCallback } from 'react';
import { useCheckerState } from './link-checker/useCheckerState';
import { usePageScanner } from './link-checker/usePageScanner';
import { useSiteScanner } from './link-checker/useSiteScanner';
import { LinkCheckerResult } from './link-checker/types';

export function useLinkChecker(): LinkCheckerResult {
  const [state, {
    setIsChecking,
    setProgress,
    setBrokenLinks,
    setCheckedCount,
    setTotalLinks,
    setPagesScanned,
    setTotalPages,
    setIsSiteScanning,
    setScannedPages,
    resetState
  }] = useCheckerState();
  
  const { scanPageLinks: scanPage } = usePageScanner();
  const { scanSiteLinks: scanSite } = useSiteScanner();

  const scanPageLinks = useCallback(async () => {
    // Reset state
    resetState();
    await scanPage(
      setIsChecking,
      setTotalLinks,
      setCheckedCount,
      setProgress,
      setBrokenLinks
    );
  }, [resetState, scanPage, setIsChecking, setTotalLinks, setCheckedCount, setProgress, setBrokenLinks]);

  const scanSiteLinks = useCallback(async () => {
    // Reset state
    resetState();
    await scanSite(
      setIsChecking,
      setIsSiteScanning,
      setTotalPages,
      setPagesScanned,
      setTotalLinks,
      setCheckedCount,
      setProgress,
      setScannedPages,
      setBrokenLinks
    );
  }, [
    resetState,
    scanSite,
    setIsChecking,
    setIsSiteScanning,
    setTotalPages,
    setPagesScanned,
    setTotalLinks, 
    setCheckedCount,
    setProgress,
    setScannedPages,
    setBrokenLinks
  ]);

  return {
    ...state,
    scanPageLinks,
    scanSiteLinks,
    reset: resetState
  };
}
