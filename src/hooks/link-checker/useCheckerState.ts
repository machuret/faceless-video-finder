
import { useState, useCallback } from 'react';
import { BrokenLink, LinkCheckerState, ScannedPage } from './types';

export function useCheckerState(): [LinkCheckerState, {
  setIsChecking: (value: boolean) => void;
  setProgress: (value: number) => void;
  setBrokenLinks: (links: BrokenLink[]) => void;
  setCheckedCount: (value: number) => void;
  setTotalLinks: (value: number) => void;
  setPagesScanned: (value: number) => void;
  setTotalPages: (value: number) => void;
  setIsSiteScanning: (value: boolean) => void;
  setScannedPages: (pages: ScannedPage[]) => void;
  resetState: () => void;
}] {
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [brokenLinks, setBrokenLinks] = useState<BrokenLink[]>([]);
  const [checkedCount, setCheckedCount] = useState(0);
  const [totalLinks, setTotalLinks] = useState(0);
  const [pagesScanned, setPagesScanned] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isSiteScanning, setIsSiteScanning] = useState(false);
  const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);

  const resetState = useCallback(() => {
    setBrokenLinks([]);
    setProgress(0);
    setCheckedCount(0);
    setTotalLinks(0);
    setPagesScanned(0);
    setTotalPages(0);
    setIsChecking(false);
    setIsSiteScanning(false);
    setScannedPages([]);
  }, []);

  return [
    {
      isChecking,
      progress,
      brokenLinks,
      checkedCount,
      totalLinks,
      pagesScanned,
      totalPages,
      isSiteScanning,
      scannedPages
    },
    {
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
    }
  ];
}
