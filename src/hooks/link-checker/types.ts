
export interface BrokenLink {
  url: string;
  text: string;
  pageUrl: string;
  status: number;
  statusText: string;
  source: string;
  error?: string; // Add error property that was being used
}

export interface ValidatedLink {
  url: string;
  text: string;
  pageUrl: string;
  isValid: boolean;
  status?: number;
  statusText?: string;
  source?: string;
}

export interface ScannedPage {
  url: string;
  brokenLinks: BrokenLink[];
  totalLinks: number;
  scanned: boolean;
  linkCount?: number; // Add these properties used in ScannedPagesAccordion
  brokenCount?: number;
  status?: string; // Add status property used in component
}

export interface PageScannerState {
  validationResults: BrokenLink[];
  isValidating: boolean;
}

export interface SiteScannerState {
  scannedPages: ScannedPage[];
  pagesScanned: number;
  totalPages: number;
  brokenLinks: BrokenLink[];
  totalLinks: number;
  checkedLinks: number;
  isSiteScanning: boolean;
}

// Add the missing LinkCheckerState interface
export interface LinkCheckerState {
  validationResults: BrokenLink[];
  isValidating: boolean;
  isChecking: boolean;
  brokenLinks: BrokenLink[];
  progress: number;
  checkedCount: number;
  totalLinks: number;
  scannedPages?: ScannedPage[];
  pagesScanned?: number;
  totalPages?: number;
  isSiteScanning?: boolean;
  checkedLinks?: number;
}
