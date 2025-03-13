
export type BrokenLink = {
  url: string;
  text: string;
  status: number;
  pageUrl?: string; // Add page URL to track where link was found
  error?: string;
};

export type ScannedPage = {
  url: string;
  linkCount: number;
  brokenCount: number;
  status: 'success' | 'error' | 'pending';
};

export type LinkCheckerState = {
  isChecking: boolean;
  progress: number;
  brokenLinks: BrokenLink[];
  checkedCount: number;
  totalLinks: number;
  pagesScanned: number;
  totalPages: number;
  isSiteScanning: boolean;
  scannedPages: ScannedPage[];
};

export type LinkCheckerActions = {
  scanPageLinks: () => Promise<void>;
  scanSiteLinks: () => Promise<void>;
  reset: () => void;
};

export type LinkCheckerResult = LinkCheckerState & LinkCheckerActions;
