import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FacelessIdeaInfo {
  id: string;
  label: string;
  description: string | null;
  production: string | null;
  example: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Fetch all faceless ideas
export const fetchFacelessIdeas = async (): Promise<FacelessIdeaInfo[]> => {
  try {
    const { data, error } = await supabase
      .from("faceless_ideas")
      .select("*")
      .order("label");

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Error fetching faceless ideas:", error.message);
    throw error;
  }
};

// Get a specific faceless idea by ID
export const getFacelessIdeaById = async (id: string): Promise<FacelessIdeaInfo | null> => {
  try {
    const { data, error } = await supabase
      .from("faceless_ideas")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error(`Error fetching faceless idea with ID ${id}:`, error.message);
    throw error;
  }
};

// Create a new faceless idea
export const createFacelessIdea = async (idea: FacelessIdeaInfo): Promise<FacelessIdeaInfo> => {
  try {
    const { data, error } = await supabase
      .from("faceless_ideas")
      .insert(idea)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error creating faceless idea:", error.message);
    throw error;
  }
};

// Update an existing faceless idea
export const updateFacelessIdea = async (idea: FacelessIdeaInfo): Promise<FacelessIdeaInfo> => {
  try {
    const { data, error } = await supabase
      .from("faceless_ideas")
      .update({
        label: idea.label,
        description: idea.description,
        production: idea.production,
        example: idea.example,
        updated_at: new Date().toISOString(),
      })
      .eq("id", idea.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error(`Error updating faceless idea with ID ${idea.id}:`, error.message);
    throw error;
  }
};

// Delete a faceless idea
export const deleteFacelessIdea = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("faceless_ideas")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error: any) {
    console.error(`Error deleting faceless idea with ID ${id}:`, error.message);
    throw error;
  }
};

// Validate faceless idea ID format
export const validateFacelessIdeaId = (id: string): boolean => {
  const regex = /^[a-z0-9_]+$/;
  return regex.test(id);
};

// Process CSV data for import
export const processCsvImport = async (csvData: string): Promise<{ success: number; failed: number }> => {
  const lines = csvData.split('\n').filter(line => line.trim() !== '');
  
  // Skip header row if it exists
  const startIndex = lines[0].includes('Niche Name') || 
                     lines[0].includes('AI Voice Software') ? 1 : 0;
  
  let success = 0;
  let failed = 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split by tab character (TSV format)
    const values = line.split('\t').map(value => value.trim());
    
    // If we only have one value, try splitting by other common delimiters
    if (values.length === 1) {
      // Try comma as delimiter (CSV format)
      const commaValues = line.split(',').map(value => value.trim());
      if (commaValues.length > 1) {
        // If comma splitting gives more values, use that instead
        values.splice(0, values.length, ...commaValues);
      }
    }
    
    if (values.length < 1) {
      failed++;
      continue;
    }
    
    try {
      // Extract values based on the CSV format
      // Niche Name | AI Voice Software | Heavy Editing | Complexity Level | Research Level | Difficulty | Notes/Description | Example Channel Name | Example Channel URL
      const label = values[0] || '';
      const aiVoice = values.length > 1 ? values[1] || 'No' : 'No';
      const heavyEditing = values.length > 2 ? values[2] || 'No' : 'No';
      const complexityLevel = values.length > 3 ? values[3] || 'Medium' : 'Medium';
      const researchLevel = values.length > 4 ? values[4] || 'Medium' : 'Medium';
      const difficulty = values.length > 5 ? values[5] || 'Medium' : 'Medium';
      const description = values.length > 6 ? values[6] || null : null;
      const exampleChannelName = values.length > 7 ? values[7] || null : null;
      const exampleChannelUrl = values.length > 8 ? values[8] || null : null;
      
      console.log("Importing row:", { label, aiVoice, heavyEditing, complexityLevel, researchLevel, difficulty });
      
      if (!label) {
        failed++;
        continue;
      }
      
      // Generate an ID from the label
      const id = label.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      
      // Format the description HTML
      let formattedDescription = description;
      if (description) {
        formattedDescription = `<p>${description}</p>`;
      }
      
      // Format the example HTML with channel info
      let formattedExample = null;
      if (exampleChannelName || exampleChannelUrl) {
        formattedExample = `<p>Example Channel: ${exampleChannelName || 'Not specified'}`;
        if (exampleChannelUrl) {
          formattedExample += ` - <a href="${exampleChannelUrl}" target="_blank" rel="noopener noreferrer">${exampleChannelUrl}</a>`;
        }
        formattedExample += `</p>`;
      }
      
      // Format the production HTML with details
      const formattedProduction = `
        <ul>
          <li><strong>AI Voice Required:</strong> ${aiVoice}</li>
          <li><strong>Heavy Editing:</strong> ${heavyEditing}</li>
          <li><strong>Complexity Level:</strong> ${complexityLevel}</li>
          <li><strong>Research Level:</strong> ${researchLevel}</li>
          <li><strong>Difficulty:</strong> ${difficulty}</li>
        </ul>
      `;
      
      await createFacelessIdea({
        id,
        label,
        description: formattedDescription,
        production: formattedProduction,
        example: formattedExample
      });
      success++;
    } catch (error) {
      console.error(`Error importing row ${i}:`, error);
      failed++;
    }
  }
  
  return { success, failed };
};
