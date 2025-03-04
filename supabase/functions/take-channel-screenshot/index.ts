
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
    const { channelUrl, channelId } = await req.json() as RequestBody;

    if (!channelUrl) {
      console.error("Missing channel URL");
      return new Response(
        JSON.stringify({ error: "Channel URL is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!channelId) {
      console.error("Missing channel ID");
      return new Response(
        JSON.stringify({ error: "Channel ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Taking screenshot of channel: ${channelUrl}`);

    // Initialize Puppeteer
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    try {
      const page = await browser.newPage();
      
      // Set viewport size for a good screenshot
      await page.setViewport({ width: 1280, height: 800 });
      
      // Navigate to the YouTube channel page
      await page.goto(channelUrl, { waitUntil: "networkidle2" });
      
      // Wait for the channel page to load
      await page.waitForSelector("#channel-header", { timeout: 10000 }).catch(() => {
        console.log("Channel header not found, proceeding anyway");
      });
      
      // Take the screenshot
      const screenshot = await page.screenshot();
      
      // Create a filename for the screenshot
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `channel_${channelId}_${timestamp}.png`;
      
      // Initialize Supabase client
      const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Upload the screenshot to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("channel_screenshots")
        .upload(filename, screenshot, {
          contentType: "image/png",
          upsert: true,
        });
      
      if (uploadError) {
        throw new Error(`Error uploading screenshot: ${uploadError.message}`);
      }
      
      // Get the public URL of the uploaded screenshot
      const { data: urlData } = await supabase.storage
        .from("channel_screenshots")
        .getPublicUrl(filename);
      
      const screenshotUrl = urlData.publicUrl;
      
      // Update the channel record with the screenshot URL
      const { error: updateError } = await supabase
        .from("youtube_channels")
        .update({ screenshot_url: screenshotUrl })
        .eq("id", channelId);
      
      if (updateError) {
        throw new Error(`Error updating channel with screenshot URL: ${updateError.message}`);
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
    }
  } catch (error) {
    console.error("Error taking screenshot:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred while taking the screenshot",
        stack: error.stack 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
