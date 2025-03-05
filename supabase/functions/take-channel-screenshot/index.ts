
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

interface RequestBody {
  channelUrl: string;
  channelId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Screenshot request received");
    
    // Parse the request body
    const requestBody = await req.json();
    console.log("Request body:", JSON.stringify(requestBody));
    
    const { channelUrl, channelId } = requestBody as RequestBody;

    // Validate input
    if (!channelUrl) {
      console.error("Missing channel URL");
      return new Response(
        JSON.stringify({ success: false, error: "Channel URL is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!channelId) {
      console.error("Missing channel ID");
      return new Response(
        JSON.stringify({ success: false, error: "Channel ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Taking screenshot of channel: ${channelUrl} with ID: ${channelId}`);

    // Initialize Supabase client (we need this first to check bucket exists)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials");
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if bucket exists, and create it if it doesn't
    console.log("Checking if storage bucket exists");
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error checking buckets:", listError);
      return new Response(
        JSON.stringify({ success: false, error: `Error checking buckets: ${listError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const bucketName = "channel_screenshots";
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Creating bucket: ${bucketName}`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (createError) {
        console.error("Error creating bucket:", createError);
        return new Response(
          JSON.stringify({ success: false, error: `Error creating bucket: ${createError.message}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      console.log("Bucket created successfully");
    } else {
      console.log("Bucket already exists");
    }

    // Initialize Puppeteer
    console.log("Initializing Puppeteer");
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    try {
      const page = await browser.newPage();
      
      // Set viewport size for a good screenshot
      await page.setViewport({ width: 1280, height: 800 });
      
      console.log("Navigating to the YouTube channel page");
      // Navigate to the YouTube channel page
      await page.goto(channelUrl, { waitUntil: "networkidle2", timeout: 60000 });
      
      console.log("Waiting for channel page to load");
      // Wait for the channel page to load
      await page.waitForSelector("#channel-header", { timeout: 15000 }).catch((err) => {
        console.log("Channel header not found, proceeding anyway:", err);
      });
      
      // Wait a bit more for everything to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Taking screenshot");
      // Take the screenshot
      const screenshot = await page.screenshot();
      
      // Create a filename for the screenshot
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `channel_${channelId}_${timestamp}.png`;
      
      console.log(`Uploading screenshot with filename: ${filename}`);
      // Upload the screenshot to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filename, screenshot, {
          contentType: "image/png",
          upsert: true,
        });
      
      if (uploadError) {
        console.error("Error uploading screenshot:", uploadError);
        return new Response(
          JSON.stringify({ success: false, error: `Error uploading screenshot: ${uploadError.message}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      console.log("Screenshot uploaded successfully, getting public URL");
      // Get the public URL of the uploaded screenshot
      const { data: urlData } = await supabase.storage
        .from(bucketName)
        .getPublicUrl(filename);
      
      const screenshotUrl = urlData.publicUrl;
      console.log("Screenshot URL:", screenshotUrl);
      
      console.log("Updating the channel record with the screenshot URL");
      // Update the channel record with the screenshot URL
      const { error: updateError } = await supabase
        .from("youtube_channels")
        .update({ screenshot_url: screenshotUrl })
        .eq("id", channelId);
      
      if (updateError) {
        console.error("Error updating channel with screenshot URL:", updateError);
        // Still return the URL even if updating the channel failed
        return new Response(
          JSON.stringify({ 
            success: true, 
            screenshotUrl: screenshotUrl,
            warning: `Channel update failed: ${updateError.message}`,
            message: "Screenshot taken but channel update failed" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
      
      console.log(`Screenshot saved and channel updated: ${screenshotUrl}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          screenshotUrl: screenshotUrl,
          message: "Screenshot taken and saved successfully" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } finally {
      await browser.close();
      console.log("Browser closed");
    }
  } catch (error) {
    console.error("Error taking screenshot:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "An error occurred while taking the screenshot",
        stack: error.stack 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
