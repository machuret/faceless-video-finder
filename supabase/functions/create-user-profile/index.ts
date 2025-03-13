
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabaseClient } from "../_shared/supabaseClient.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the user data from the event payload
    const { record, type } = await req.json();
    
    // Initialize Supabase client with request for logging
    const supabase = supabaseClient(req, { auditLog: true });
    
    // Check that the event type is a new user created
    if (type !== 'INSERT' || !record?.id) {
      return new Response(
        JSON.stringify({ message: 'Not a user creation event' }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          status: 400,
        }
      );
    }
    
    console.log(`Creating profile for new user: ${record.email} (${record.id})`);
    
    // Extract metadata from raw user metadata
    const metadata = record.raw_user_meta_data || {};
    
    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: record.id,
          email: record.email,
          first_name: metadata.first_name || '',
          last_name: metadata.last_name || '',
          display_name: metadata.display_name || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]);
      
    if (profileError) {
      throw profileError;
    }
    
    // Set default role for new user
    const { data: role, error: roleError } = await supabase
      .from('user_roles')
      .insert([
        {
          user_id: record.id,
          role: 'user'
        }
      ]);
      
    if (roleError) {
      throw roleError;
    }
    
    return new Response(
      JSON.stringify({
        message: 'Profile created successfully',
        userId: record.id
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-user-profile function:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
