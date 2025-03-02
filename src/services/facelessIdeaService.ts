
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
    
    const values = line.split('\t').map(value => value.trim());
    
    if (values.length < 1) {
      failed++;
      continue;
    }
    
    try {
      // Extract values based on the CSV format
      // Niche Name | AI Voice Software | Heavy Editing | Complexity Level | Research Level | Difficulty | Notes/Description | Example Channel Name | Example Channel URL
      const label = values[0] || '';
      const aiVoice = values[1] || 'No';
      const heavyEditing = values[2] || 'No';
      const complexityLevel = values[3] || 'Medium';
      const researchLevel = values[4] || 'Medium';
      const difficulty = values[5] || 'Medium';
      const description = values[6] || null;
      const exampleChannelName = values[7] || null;
      const exampleChannelUrl = values[8] || null;
      
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
