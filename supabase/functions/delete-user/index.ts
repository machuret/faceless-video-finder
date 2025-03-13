
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabaseClient } from "../_shared/supabaseClient.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface DeleteUserRequest {
  userId: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { userId }: DeleteUserRequest = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Initialize Supabase client with request for logging
    const supabase = supabaseClient(req, { auditLog: true });
    
    // Verify the requester is an admin
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Not authenticated');
    }
    
    // Check if requester is admin
    const { data: requesterIsAdmin, error: adminError } = await supabase.rpc('check_is_admin', {
      user_id: user.id
    });
    
    if (adminError || !requesterIsAdmin) {
      throw new Error('Not authorized - admin rights required');
    }
    
    // Get the user to delete
    const { data: userData, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    
    if (getUserError || !userData.user) {
      throw new Error(`User with id ${userId} not found`);
    }
    
    if (userData.user.id === user.id) {
      throw new Error('Cannot delete your own account');
    }
    
    console.log(`Admin user ${user.email} deleting user ${userData.user.email} (${userId})`);
    
    // Delete the user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      throw deleteError;
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        deletedUserId: userId
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in delete-user function:', error);
    
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
