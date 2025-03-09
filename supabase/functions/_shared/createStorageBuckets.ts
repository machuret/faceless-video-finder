
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders } from "./cors.ts";

// Storage bucket names
const STORAGE_BUCKETS = [
  "screenshots",
  "channel-images",
  "thumbnails",
  "niche-images",
  "channel-type-images",
  "faceless-idea-images",
  "profile-images",
  "attachments"
];

export async function ensureStorageBucketsExist(supabase: any) {
  try {
    console.log("Checking storage buckets...");
    
    for (const bucket of STORAGE_BUCKETS) {
      try {
        // Check if bucket exists
        const { data: existingBucket, error: getBucketError } = await supabase
          .storage
          .getBucket(bucket);
        
        if (getBucketError && getBucketError.code !== "404") {
          console.error(`Error checking bucket ${bucket}:`, getBucketError);
          continue;
        }
        
        // If bucket doesn't exist, create it
        if (!existingBucket) {
          console.log(`Creating bucket: ${bucket}`);
          const { error: createBucketError } = await supabase
            .storage
            .createBucket(bucket, {
              public: true,
              fileSizeLimit: 52428800 // 50MB
            });
          
          if (createBucketError) {
            console.error(`Error creating bucket ${bucket}:`, createBucketError);
          } else {
            console.log(`Bucket created: ${bucket}`);
          }
        } else {
          console.log(`Bucket already exists: ${bucket}`);
        }
      } catch (err) {
        console.error(`Error processing bucket ${bucket}:`, err);
      }
    }
    
    return {
      success: true,
      message: "Storage buckets initialized successfully"
    };
  } catch (err) {
    console.error("Error initializing storage buckets:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}
