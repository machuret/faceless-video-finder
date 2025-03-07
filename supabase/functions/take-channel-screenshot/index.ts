
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { initSupabaseClient, createErrorResponse, createSuccessResponse } from "../_shared/screenshot-utils.ts";
import { validateRequestBody } from "./request-validator.ts";
import { handleScreenshot } from "./screenshot-handler.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Screenshot request received");
    
    // Parse the request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body:", JSON.stringify(requestBody));
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return createErrorResponse("Invalid JSON in request body", 400);
    }
    
    // Validate the request body
    const validation = validateRequestBody(requestBody);
    if (!validation.isValid) {
      console.error(validation.error);
      return createErrorResponse(validation.error, 400);
    }
    
    const { channelUrl, channelId } = validation.data;
    
    // Initialize Supabase client
    const { client: supabase, error: clientError } = initSupabaseClient();
    if (clientError || !supabase) {
      console.error("Error initializing Supabase client:", clientError);
      return createErrorResponse(clientError || "Failed to initialize Supabase client", 500);
    }
    
    // Handle screenshot processing
    const result = await handleScreenshot(supabase, channelId, channelUrl);
    
    if (!result.success) {
      console.error("Screenshot processing failed:", result.error);
      // Return 200 status with error details instead of 500 to ensure the UI can display the error properly
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.error || "Screenshot processing failed",
          message: "Unable to capture screenshot, please try again later"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 200 // Use 200 instead of 500 to allow the frontend to handle the error
        }
      );
    }
    
    return createSuccessResponse(result);
    
  } catch (error) {
    console.error("Unhandled error in screenshot function:", error);
    // Return 200 status with error details instead of 500
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unexpected error occurred while taking the screenshot",
        message: "Screenshot service encountered an error, please try again"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 // Use 200 to allow the frontend to display the error message
      }
    );
  }
});
