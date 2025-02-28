
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0'

export const supabaseClient = (req: Request) => {
  // Get the Authorization header from the request
  const authHeader = req.headers.get('Authorization')

  if (!authHeader) {
    throw new Error('Missing Authorization header')
  }

  // Parse the Authorization header to get the token
  const token = authHeader.replace('Bearer ', '')

  // Get the Supabase URL and anon key from environment variables
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase URL or anon key')
  }

  // Create and return a Supabase client
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  })
}
