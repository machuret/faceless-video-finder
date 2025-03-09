
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

export async function ensureStorageBucketsExist(supabase: SupabaseClient) {
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

  for (const bucket of buckets) {
    // Check if bucket exists
    const { data: existingBucket } = await supabase.storage.getBucket(bucket.id);
    
    if (!existingBucket) {
      // Create bucket if it doesn't exist
      await supabase.storage.createBucket(bucket.id, {
        public: bucket.public
      });
      console.log(`Created storage bucket: ${bucket.id}`);
    } else {
      // Update bucket if it exists but settings are different
      if (existingBucket.public !== bucket.public) {
        await supabase.storage.updateBucket(bucket.id, {
          public: bucket.public
        });
        console.log(`Updated storage bucket: ${bucket.id}`);
      }
    }
  }
}
