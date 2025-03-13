
import { supabase } from "@/integrations/supabase/client";
import { getCache, setCache } from "@/utils/cacheUtils";

export interface ChannelTypeInfo {
  id: string;
  label: string;
  description: string | null;
  image_url: string | null;
  production: string | null;
  example: string | null;
}

const CACHE_KEY = "channel_types";
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

export const fetchChannelTypes = async (): Promise<ChannelTypeInfo[]> => {
  try {
    // Try cache first
    const cachedData = getCache<ChannelTypeInfo[]>(CACHE_KEY);
    if (cachedData) {
      console.log("Returning cached channel types");
      return cachedData;
    }

    console.log("Fetching channel types from Supabase...");
    
    // First try edge function for better reliability with network issues
    try {
      const { data, error } = await supabase.functions.invoke('get-channel-types');
      
      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      if (Array.isArray(data)) {
        console.log(`Fetched ${data.length} channel types via edge function`);
        
        // Cache the result for future use
        setCache(CACHE_KEY, data, { expiry: CACHE_EXPIRY });
        
        return data;
      }
      
      // If we get here, the edge function likely returned a malformed response
      console.warn("Edge function returned invalid data format, falling back to direct query");
    } catch (edgeError) {
      console.warn("Edge function failed, trying direct query:", edgeError);
    }
    
    // Fallback to direct query if edge function fails
    const { data, error } = await supabase
      .from("channel_types")
      .select("id, label, description, image_url, production, example");

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`Fetched ${data.length} channel types via direct query`);
    
    // Cache the result for future use
    setCache(CACHE_KEY, data, { expiry: CACHE_EXPIRY });
    
    return data;
  } catch (error) {
    console.error("Error fetching channel types:", error);
    
    // Return default data when no types could be fetched
    return [
      {
        id: "compilation",
        label: "Compilation",
        description: "Videos that compile interesting clips, facts, or moments around a specific theme",
        image_url: null,
        production: null,
        example: null
      },
      {
        id: "educational",
        label: "Educational",
        description: "Videos that teach viewers about specific topics or skills",
        image_url: null,
        production: null,
        example: null
      }
    ];
  }
};

export const fetchChannelTypeById = async (id: string): Promise<ChannelTypeInfo | null> => {
  try {
    if (!id) return null;
    
    // Try cache first
    const cachedData = getCache<ChannelTypeInfo[]>(CACHE_KEY);
    if (cachedData) {
      const cachedType = cachedData.find(type => type.id === id || type.id === id.toLowerCase());
      if (cachedType) {
        console.log(`Returning cached channel type for ID: ${id}`);
        return cachedType;
      }
    }
    
    console.log(`Fetching channel type by ID: ${id}...`);
    
    // Try edge function first
    try {
      const { data, error } = await supabase.functions.invoke('get-channel-types', { 
        body: { typeId: id } 
      });
      
      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      if (data && typeof data === 'object' && 'id' in data) {
        console.log(`Found channel type via edge function: ${data.label}`);
        return data as ChannelTypeInfo;
      }
      
      // If we get here but the data is an array, it might be all channel types
      if (Array.isArray(data)) {
        const foundType = data.find(type => type.id === id || type.id === id.toLowerCase());
        if (foundType) {
          console.log(`Found channel type in array: ${foundType.label}`);
          return foundType;
        }
      }
      
      // If we get here, the edge function likely returned a malformed response
      console.warn("Edge function returned invalid data format, falling back to direct query");
    } catch (edgeError) {
      console.warn("Edge function failed, trying direct query:", edgeError);
    }
    
    // Fallback to direct query
    const { data, error } = await supabase
      .from("channel_types")
      .select("id, label, description, image_url, production, example")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error(`Error fetching channel type by ID ${id}:`, error);
    return null;
  }
};

export const DEFAULT_CHANNEL_TYPES: ChannelTypeInfo[] = [
  {
    id: "compilation",
    label: "Compilation",
    description: "Videos that compile interesting clips, facts, or moments around a specific theme",
    image_url: null,
    production: "Source clips from stock footage or with proper permissions, edit them together with transitions, add background music and captions",
    example: "Top 10 Movie Scenes, Amazing Animal Moments, Funniest Fails"
  },
  {
    id: "educational",
    label: "Educational",
    description: "Videos that teach viewers about specific topics or skills",
    image_url: null,
    production: "Research thoroughly, create script, use visuals like slides or animations, record clear audio narration",
    example: "How Things Work, Science Explained, History Mysteries"
  },
  {
    id: "data_visualization",
    label: "Data Visualization",
    description: "Videos that present data, statistics, and facts in visually engaging ways",
    image_url: null,
    production: "Research topic thoroughly, create animations using tools like After Effects or Blender, add voiceover narration",
    example: "Country GDP Comparisons, Population Growth Visualized, Climate Change Statistics"
  },
  {
    id: "relaxation",
    label: "Relaxation/Ambient",
    description: "Calming videos with beautiful scenery, sounds, or ambient music to help viewers relax",
    image_url: null,
    production: "Record or source high-quality nature footage, add ambient sounds or gentle music, edit for smooth transitions",
    example: "Thunderstorm Sounds, Fireplace with Crackling Sounds, Ocean Waves"
  }
];

