
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { supabaseClient } from "../_shared/supabaseClient.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = supabaseClient(req);
    
    // Ensure storage buckets exist
    const buckets = [
      {
        id: 'channel-screenshots',
        name: 'Channel Screenshots',
        public: true
      },
      {
        id: 'faceless-images',
        name: 'Faceless Content Images',
        public: true
      },
      {
        id: 'niche-images',
        name: 'Niche Images', 
        public: true
      },
      {
        id: 'channel-type-images',
        name: 'Channel Type Images',
        public: true
      }
    ];

    const results = [];

    for (const bucket of buckets) {
      // Check if bucket exists
      const { data: existingBucket, error: getBucketError } = await supabase.storage.getBucket(bucket.id);
      
      if (getBucketError && getBucketError.message !== 'The resource was not found') {
        console.error(`Error checking bucket ${bucket.id}:`, getBucketError);
        results.push({
          id: bucket.id,
          status: 'error',
          message: getBucketError.message
        });
        continue;
      }
      
      if (!existingBucket) {
        // Create bucket if it doesn't exist
        const { error: createBucketError } = await supabase.storage.createBucket(bucket.id, {
          public: bucket.public
        });
        
        if (createBucketError) {
          console.error(`Error creating bucket ${bucket.id}:`, createBucketError);
          results.push({
            id: bucket.id,
            status: 'error',
            message: createBucketError.message
          });
        } else {
          console.log(`Created storage bucket: ${bucket.id}`);
          results.push({
            id: bucket.id,
            status: 'created',
            public: bucket.public
          });
        }
      } else {
        // Update bucket if it exists but settings are different
        if (existingBucket.public !== bucket.public) {
          const { error: updateBucketError } = await supabase.storage.updateBucket(bucket.id, {
            public: bucket.public
          });
          
          if (updateBucketError) {
            console.error(`Error updating bucket ${bucket.id}:`, updateBucketError);
            results.push({
              id: bucket.id,
              status: 'error',
              message: updateBucketError.message
            });
          } else {
            console.log(`Updated storage bucket: ${bucket.id}`);
            results.push({
              id: bucket.id,
              status: 'updated',
              public: bucket.public
            });
          }
        } else {
          results.push({
            id: bucket.id,
            status: 'exists',
            public: existingBucket.public
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error initializing storage:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred while initializing storage",
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
