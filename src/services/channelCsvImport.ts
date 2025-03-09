
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Papa from 'papaparse';

interface ChannelCsvRow {
  channel_name: string;
  channel_url: string;
  starting_date: string;
  niche: string;
  [key: string]: string; // For any additional fields
}

interface ImportResult {
  success: number;
  failed: number;
  duplicates: number;
  errors: string[];
}

/**
 * Normalize YouTube channel URL to a standard format
 */
const normalizeChannelUrl = (url: string): string => {
  url = url.trim();
  
  // Handle various YouTube URL formats
  if (url.includes('youtube.com/')) {
    // Extract the channel ID or handle
    const channelIdMatch = url.match(/youtube\.com\/channel\/([^\/\s?&]+)/i);
    const handleMatch = url.match(/youtube\.com\/@([^\/\s?&]+)/i);
    
    if (channelIdMatch && channelIdMatch[1]) {
      return `https://www.youtube.com/channel/${channelIdMatch[1]}`;
    } else if (handleMatch && handleMatch[1]) {
      return `https://www.youtube.com/@${handleMatch[1]}`;
    }
  }
  
  // If it's already a clean format or we couldn't parse it, return as is
  return url;
};

/**
 * Check if a channel with the given URL already exists in the database
 */
const checkDuplicateUrl = async (channelUrl: string): Promise<boolean> => {
  const normalizedUrl = normalizeChannelUrl(channelUrl);
  
  const { data, error } = await supabase
    .from("youtube_channels")
    .select("id")
    .eq("channel_url", normalizedUrl)
    .maybeSingle();
  
  if (error) {
    console.error("Error checking for duplicate URL:", error);
    throw error;
  }
  
  return !!data;
};

/**
 * Parse and validate a single CSV row
 */
const validateRow = (row: ChannelCsvRow, rowIndex: number): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!row.channel_name || row.channel_name.trim() === '') {
    errors.push(`Row ${rowIndex}: Channel name is required`);
  }
  
  if (!row.channel_url || row.channel_url.trim() === '') {
    errors.push(`Row ${rowIndex}: Channel URL is required`);
  } else if (!row.channel_url.includes('youtube.com/')) {
    errors.push(`Row ${rowIndex}: Invalid YouTube channel URL format`);
  }
  
  // Starting date validation (optional field)
  if (row.starting_date && !/^\d{4}-\d{2}-\d{2}$/.test(row.starting_date)) {
    errors.push(`Row ${rowIndex}: Starting date should be in YYYY-MM-DD format`);
  }
  
  return { 
    valid: errors.length === 0,
    errors 
  };
};

/**
 * Convert CSV row to database format
 */
const rowToChannelData = (row: ChannelCsvRow) => {
  return {
    channel_title: row.channel_name.trim(),
    channel_url: normalizeChannelUrl(row.channel_url),
    start_date: row.starting_date || null,
    niche: row.niche?.trim() || null,
    video_id: `csv-import-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    channel_type: "creator",
    channel_category: "entertainment",
    metadata: {
      ui_channel_type: "creator",
      is_manual_entry: true,
      import_source: "csv"
    },
    notes: `Imported via CSV on ${new Date().toISOString().split('T')[0]}`
  };
};

/**
 * Process a CSV file containing YouTube channel data
 */
export const processCsvImport = async (csvContent: string): Promise<ImportResult> => {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    duplicates: 0,
    errors: []
  };
  
  return new Promise((resolve) => {
    Papa.parse<ChannelCsvRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().trim().replace(/\s+/g, '_'),
      complete: async ({ data }) => {
        console.log(`Processing ${data.length} CSV rows`);
        
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const rowNum = i + 2; // +2 for 1-based indexing and header row
          
          try {
            // Validate row data
            const { valid, errors } = validateRow(row, rowNum);
            if (!valid) {
              result.errors.push(...errors);
              result.failed++;
              continue;
            }
            
            // Check for duplicates
            const isDuplicate = await checkDuplicateUrl(row.channel_url);
            if (isDuplicate) {
              result.duplicates++;
              console.log(`Skipping duplicate channel URL: ${row.channel_url}`);
              continue;
            }
            
            // Convert row to channel data and insert
            const channelData = rowToChannelData(row);
            
            const { error } = await supabase
              .from("youtube_channels")
              .insert(channelData);
            
            if (error) {
              console.error(`Error inserting row ${rowNum}:`, error);
              result.errors.push(`Row ${rowNum}: Database error - ${error.message}`);
              result.failed++;
            } else {
              result.success++;
            }
          } catch (error) {
            console.error(`Error processing row ${rowNum}:`, error);
            result.errors.push(`Row ${rowNum}: ${error instanceof Error ? error.message : String(error)}`);
            result.failed++;
          }
        }
        
        console.log("CSV import complete:", result);
        resolve(result);
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        result.errors.push(`CSV parsing error: ${error.message}`);
        result.failed = 1;
        resolve(result);
      }
    });
  });
};

/**
 * Generate a sample CSV template
 */
export const generateCsvTemplate = (): string => {
  const headers = ['channel_name', 'channel_url', 'starting_date', 'niche'];
  
  // Add sample row
  const sampleRow = [
    'Example Channel',
    'https://www.youtube.com/@example',
    '2023-01-01',
    'Technology'
  ];
  
  return [
    headers.join(','),
    sampleRow.join(',')
  ].join('\n');
};

/**
 * Download a CSV template file
 */
export const downloadCsvTemplate = () => {
  const csvContent = generateCsvTemplate();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'channel_import_template.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast.success('CSV template downloaded successfully');
};
