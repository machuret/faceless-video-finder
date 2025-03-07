/**
 * Formats a YouTube date string into a standardized format (YYYY-MM-DD)
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  console.log(`Formatting date: "${dateString}"`);
  
  // Remove any HTML entities and trim
  dateString = dateString.replace(/&nbsp;/g, ' ').trim();
  
  // Various formats YouTube might use
  const formats = [
    // "Joined Aug 3, 2015" or "Joined 3 Aug 2015"
    /Joined\s+(?:(\w+)\s+(\d{1,2}),?\s+(\d{4})|(\d{1,2})\s+(\w+)\s+(\d{4}))/i,
    
    // "Aug 3, 2015" or "3 Aug 2015"
    /(?:(\w+)\s+(\d{1,2}),?\s+(\d{4})|(\d{1,2})\s+(\w+)\s+(\d{4}))/i,
    
    // "Channel created on Aug 3, 2015" or "Channel created on 3 Aug 2015"
    /Channel created on\s+(?:(\w+)\s+(\d{1,2}),?\s+(\d{4})|(\d{1,2})\s+(\w+)\s+(\d{4}))/i,
    
    // ISO-like format "2015-08-03"
    /(\d{4})-(\d{2})-(\d{2})/,
    
    // Other possible formats
    // DD/MM/YYYY
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    
    // MM/DD/YYYY
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    
    // "August 3, 2015" (full month name)
    /(\w+)\s+(\d{1,2}),?\s+(\d{4})/i
  ];
  
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june', 
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  
  let matchedDate = false;
  let year = '', month = '', day = '';
  
  // Try each format
  for (const format of formats) {
    const match = dateString.match(format);
    if (match) {
      console.log(`Matched format: ${format}`);
      console.log(`Match results: ${JSON.stringify(match)}`);
      
      // "Joined Aug 3, 2015" or similar
      if (match[1] && match[2] && match[3] && !match[4]) {
        const monthStr = match[1].toLowerCase();
        const monthIndex = monthNames.findIndex(m => m.startsWith(monthStr.substring(0, 3)));
        
        if (monthIndex !== -1) {
          month = String(monthIndex + 1).padStart(2, '0');
          day = String(parseInt(match[2])).padStart(2, '0');
          year = match[3];
          matchedDate = true;
          break;
        }
      }
      // "Joined 3 Aug 2015" or similar
      else if (match[4] && match[5] && match[6]) {
        const monthStr = match[5].toLowerCase();
        const monthIndex = monthNames.findIndex(m => m.startsWith(monthStr.substring(0, 3)));
        
        if (monthIndex !== -1) {
          month = String(monthIndex + 1).padStart(2, '0');
          day = String(parseInt(match[4])).padStart(2, '0');
          year = match[6];
          matchedDate = true;
          break;
        }
      }
      // ISO format "2015-08-03"
      else if (match[0].includes('-') && match[1] && match[2] && match[3]) {
        year = match[1];
        month = match[2];
        day = match[3];
        matchedDate = true;
        break;
      }
      // DD/MM/YYYY or MM/DD/YYYY
      else if (match[0].includes('/')) {
        // Assume MM/DD/YYYY for simplicity (could be improved with locale detection)
        month = String(parseInt(match[1])).padStart(2, '0');
        day = String(parseInt(match[2])).padStart(2, '0');
        year = match[3];
        matchedDate = true;
        break;
      }
      // "August 3, 2015" (full month name)
      else if (match[1] && match[2] && match[3] && match[1].length > 2) {
        const monthStr = match[1].toLowerCase();
        const monthIndex = monthNames.findIndex(m => m.startsWith(monthStr.substring(0, 3)));
        
        if (monthIndex !== -1) {
          month = String(monthIndex + 1).padStart(2, '0');
          day = String(parseInt(match[2])).padStart(2, '0');
          year = match[3];
          matchedDate = true;
          break;
        }
      }
    }
  }
  
  if (matchedDate) {
    const formattedDate = `${year}-${month}-${day}`;
    console.log(`Formatting successful: "${dateString}" -> "${formattedDate}"`);
    return formattedDate;
  }
  
  console.log(`Could not parse date string: "${dateString}"`);
  return '';
}
