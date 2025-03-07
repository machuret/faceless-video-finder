
/**
 * Parses a date string from YouTube channel joined date to ISO format
 */
export function parseDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    // Define mapping of month names to numbers
    const months: Record<string, string> = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    
    // Parse dates like "Jan 4, 2017" or "January 4, 2017"
    const dateRegex = /([A-Za-z]+)\s+(\d+),?\s+(\d{4})/;
    const match = dateString.match(dateRegex);
    
    if (match) {
      const monthName = match[1].substring(0, 3); // Get first 3 letters of month
      const month = months[monthName];
      const day = match[2].padStart(2, '0');
      const year = match[3];
      
      if (month && day && year) {
        return `${year}-${month}-${day}`;
      }
    }
    
    console.warn(`Could not parse date string: ${dateString}`);
    return '';
  } catch (e) {
    console.error("Error parsing date string:", e, "for date:", dateString);
    return '';
  }
}
