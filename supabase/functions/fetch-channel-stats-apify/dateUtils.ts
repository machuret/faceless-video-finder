
/**
 * Formats various date strings into a consistent ISO format
 */
export function formatDate(dateString: string): string | null {
  if (!dateString) return null;
  
  console.log(`Attempting to format date: "${dateString}"`);
  
  try {
    // Handle "Joined Feb 2, 2016" format
    const joinedMatch = dateString.match(/(?:Joined|Channel created on)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/i);
    if (joinedMatch) {
      const monthMap: Record<string, string> = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
        'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
      };
      
      const month = monthMap[joinedMatch[1].toLowerCase().substring(0, 3)];
      const day = joinedMatch[2].padStart(2, '0');
      const year = joinedMatch[3];
      
      const formattedDate = `${year}-${month}-${day}`;
      console.log(`Formatted date from "Joined" pattern: ${formattedDate}`);
      return formattedDate;
    }
    
    // Handle "Feb 2, 2016" format
    const standardMatch = dateString.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/i);
    if (standardMatch) {
      const monthMap: Record<string, string> = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
        'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
      };
      
      const month = monthMap[standardMatch[1].toLowerCase().substring(0, 3)];
      const day = standardMatch[2].padStart(2, '0');
      const year = standardMatch[3];
      
      const formattedDate = `${year}-${month}-${day}`;
      console.log(`Formatted date from standard pattern: ${formattedDate}`);
      return formattedDate;
    }
    
    // Handle "Aug 2016" format (month and year only)
    const monthYearMatch = dateString.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{4})/i);
    if (monthYearMatch) {
      const monthMap: Record<string, string> = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
        'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
      };
      
      const month = monthMap[monthYearMatch[1].toLowerCase().substring(0, 3)];
      const year = monthYearMatch[2];
      
      const formattedDate = `${year}-${month}-01`;
      console.log(`Formatted date from month-year pattern: ${formattedDate}`);
      return formattedDate;
    }
    
    // Try parsing a variety of date formats
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const formattedDate = date.toISOString().split('T')[0];
      console.log(`Formatted date using Date object: ${formattedDate}`);
      return formattedDate;
    }
    
    // Check if it's just a year
    const yearMatch = dateString.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      // If it's just a year, use January 1st as the default date
      const formattedDate = `${yearMatch[0]}-01-01`;
      console.log(`Formatted date from year-only pattern: ${formattedDate}`);
      return formattedDate;
    }
    
    console.log(`Could not format date: "${dateString}"`);
    return null;
  } catch (error) {
    console.error(`Error formatting date "${dateString}":`, error);
    return null;
  }
}
