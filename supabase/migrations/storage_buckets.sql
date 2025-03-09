
-- Create required storage buckets if they don't exist
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  -- Create niche-images bucket
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'niche-images'
  ) INTO bucket_exists;
  
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('niche-images', 'Niche Images', TRUE);
    
    -- Create policy to allow public read access
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES (
      'Public Read Access for niche-images',
      '(bucket_id = ''niche-images''::text)',
      'niche-images'
    );
  END IF;
  
  -- Create channel-type-images bucket
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'channel-type-images'
  ) INTO bucket_exists;
  
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('channel-type-images', 'Channel Type Images', TRUE);
    
    -- Create policy to allow public read access
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES (
      'Public Read Access for channel-type-images',
      '(bucket_id = ''channel-type-images''::text)',
      'channel-type-images'
    );
  END IF;
  
  -- Create faceless-images bucket
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'faceless-images'
  ) INTO bucket_exists;
  
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('faceless-images', 'Faceless Idea Images', TRUE);
    
    -- Create policy to allow public read access
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES (
      'Public Read Access for faceless-images',
      '(bucket_id = ''faceless-images''::text)',
      'faceless-images'
    );
  END IF;
  
  -- Create channel-screenshots bucket
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'channel-screenshots'
  ) INTO bucket_exists;
  
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('channel-screenshots', 'Channel Screenshots', TRUE);
    
    -- Create policy to allow public read access
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES (
      'Public Read Access for channel-screenshots',
      '(bucket_id = ''channel-screenshots''::text)',
      'channel-screenshots'
    );
  END IF;
END $$;
