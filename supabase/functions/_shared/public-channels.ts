
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * Fetches public channel data bypassing RLS using service role
 * @param {Request} req - The original request
 * @param {Object} params - Parameters for the query
 * @param {number} params.limit - Number of channels to return
 * @param {number} params.offset - Offset for pagination
 * @param {string[]} params.fields - Optional array of fields to return
 * @returns {Promise<Array>} - Array of channel data
 */
export async function getPublicChannels(req: Request, { 
  limit = 10, 
  offset = 0, 
  fields = [] 
}) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      return { error: "Server configuration error" };
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Determine which fields to select (optimization)
    let selectClause = '*';
    if (fields && Array.isArray(fields) && fields.length > 0) {
      // Ensure id is always included
      if (!fields.includes('id')) {
        fields.push('id');
      }
      selectClause = fields.join(',');
    } else {
      // Default minimal fields if none specified
      selectClause = 'id, channel_title, description, total_subscribers, total_views, screenshot_url, niche';
    }
    
    // Fetch channels with service role, bypassing RLS with optimized field selection
    const { data, error, count } = await supabase
      .from("youtube_channels")
      .select(selectClause, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) {
      console.error("Error fetching channels:", error);
      return { error: error.message };
    }
    
    console.log(`Successfully fetched ${data?.length || 0} channels via Edge Function`);
    
    return {
      channels: data || [],
      totalCount: count || 0
    };
  } catch (err) {
    console.error("Error in getPublicChannels:", err);
    return { error: "Failed to fetch channels" };
  }
}
