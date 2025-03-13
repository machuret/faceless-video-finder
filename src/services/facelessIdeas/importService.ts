
import { supabase } from "@/integrations/supabase/client";
import { CsvImportResult, FacelessIdeaCreateInput } from "./types";
import { validateFacelessIdeaId } from ".";

export const processCsvImport = async (csvContent: string): Promise<CsvImportResult> => {
  try {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    // Validate headers
    const requiredHeaders = ['id', 'label'];
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    
    if (missingHeaders.length > 0) {
      return {
        success: 0,
        failed: 1,
        errors: [`Missing required headers: ${missingHeaders.join(', ')}`]
      };
    }
    
    const result: CsvImportResult = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    // Process each row
    const dataRows = lines.slice(1).filter(line => line.trim());
    
    for (let i = 0; i < dataRows.length; i++) {
      try {
        const rowData = parseCsvRow(dataRows[i]);
        
        // Map CSV data to idea object
        const idea: FacelessIdeaCreateInput = {
          id: rowData['id']?.trim() || '',
          label: rowData['label']?.trim() || '',
          description: rowData['description'] || null,
          production: rowData['production'] || null,
          example: rowData['example'] || null,
          image_url: rowData['image_url'] || null
        };
        
        // Validate idea data
        if (!idea.id || !idea.label) {
          result.failed++;
          result.errors?.push(`Row ${i + 2}: Missing required fields (id or label)`);
          continue;
        }
        
        if (!validateFacelessIdeaId(idea.id)) {
          result.failed++;
          result.errors?.push(`Row ${i + 2}: Invalid id format (${idea.id}). Use only lowercase letters, numbers, and underscores.`);
          continue;
        }
        
        // Check if idea with this ID already exists
        const { data: existingIdea } = await supabase
          .from('faceless_ideas')
          .select('id')
          .eq('id', idea.id)
          .maybeSingle();
        
        if (existingIdea) {
          // Update existing idea
          const { error: updateError } = await supabase
            .from('faceless_ideas')
            .update({
              label: idea.label,
              description: idea.description,
              production: idea.production,
              example: idea.example,
              image_url: idea.image_url,
              updated_at: new Date().toISOString()
            })
            .eq('id', idea.id);
            
          if (updateError) throw new Error(`Failed to update idea: ${updateError.message}`);
        } else {
          // Insert new idea
          const { error: insertError } = await supabase
            .from('faceless_ideas')
            .insert(idea);
            
          if (insertError) throw new Error(`Failed to insert idea: ${insertError.message}`);
        }
        
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors?.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return result;
  } catch (error) {
    console.error("Error processing CSV import:", error);
    return {
      success: 0,
      failed: 1,
      errors: [error instanceof Error ? error.message : 'Unknown error during CSV processing']
    };
  }
};

// Helper function to parse a CSV row into an object
function parseCsvRow(row: string): Record<string, string> {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  // Simple CSV parser
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last value
  values.push(current);
  
  // Match values to headers
  const headers = row.split(',').map(header => header.trim());
  const result: Record<string, string> = {};
  
  values.forEach((value, index) => {
    if (index < headers.length) {
      result[headers[index]] = value.trim();
    }
  });
  
  return result;
}
