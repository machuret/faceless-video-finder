
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

export async function ensureStorageBuckets(supabase: SupabaseClient) {
  const requiredBuckets = [
    'niche-images',
    'channel-type-images',
    'faceless-images',
    'channel-screenshots'
  ];
  
  for (const bucketName of requiredBuckets) {
    try {
      // Check if bucket exists
      const { data: bucket, error: getBucketError } = await supabase.storage
        .getBucket(bucketName);
      
      if (getBucketError || !bucket) {
        // Create bucket if it doesn't exist
        const { error: createBucketError } = await supabase.storage.createBucket(
          bucketName,
          { public: true }
        );
        
        if (createBucketError) {
          console.error(`Error creating bucket ${bucketName}:`, createBucketError);
        } else {
          console.log(`Created bucket: ${bucketName}`);
        }
      }
    } catch (error) {
      console.error(`Error checking/creating bucket ${bucketName}:`, error);
    }
  }
}
