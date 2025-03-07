
/**
 * Helper to format date to YYYY-MM-DD
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  try {
    // Handle Apify date format, e.g., "Mar 18, 2015"
    const parts = dateString.split(', ');
    if (parts.length === 2) {
      const monthDay = parts[0].split(' ');
      const year = parts[1];
      
      if (monthDay.length === 2) {
        const monthMap: {[key: string]: string} = {
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
          'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
          'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        
        const month = monthMap[monthDay[0]];
        const day = monthDay[1].padStart(2, '0');
        
        if (month && day) {
          return `${year}-${month}-${day}`;
        }
      }
    }
    
    // Fallback to ISO date parsing
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (e) {
    return "";
  }
}
