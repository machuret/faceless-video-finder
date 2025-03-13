
export interface BrokenLink {
  url: string;
  text: string;
  pageUrl: string;
  status: number;
  statusText: string; // Add this missing property
  source: string;   // Add this missing property
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
