
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabaseClient } from "../_shared/supabaseClient.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface UpdateUserAdminRequest {
  userId: string;
  isAdmin: boolean;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { userId, isAdmin }: UpdateUserAdminRequest = await req.json();
    
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
    
    console.log(`Admin user ${user.email} updating admin status for user ${userId} to ${isAdmin}`);
    
    // Get the user to update
    const { data: userData, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    
    if (getUserError || !userData.user) {
      throw new Error(`User with id ${userId} not found`);
    }
    
    if (userData.user.id === user.id) {
      throw new Error('Cannot change your own admin status');
    }
    
    if (isAdmin) {
      // Add admin role
      const { error: insertError } = await supabase
        .from('admin_roles')
        .upsert({ user_id: userId, role: 'admin' });
        
      if (insertError) {
        throw insertError;
      }
    } else {
      // Remove admin role
      const { error: deleteError } = await supabase
        .from('admin_roles')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) {
        throw deleteError;
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        userId,
        isAdmin
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in update-user-admin-status function:', error);
    
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
