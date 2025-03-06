
import { Dispatch, SetStateAction } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export class EdgeFunctionTester {
  private setLastError: Dispatch<SetStateAction<string | null>>;
  private setLastResponse: Dispatch<SetStateAction<any>>;
  private setLoading: Dispatch<SetStateAction<boolean>>;

  constructor(
    setLastError: Dispatch<SetStateAction<string | null>>,
    setLastResponse: Dispatch<SetStateAction<any>>,
    setLoading: Dispatch<SetStateAction<boolean>>
  ) {
    this.setLastError = setLastError;
    this.setLastResponse = setLastResponse;
    this.setLoading = setLoading;
  }

  async testEdgeFunction(): Promise<void> {
    try {
      this.setLoading(true);
      this.setLastError(null);
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 🧪 Testing edge function with ping...`);
      
      const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
        body: { ping: true, timestamp }
      });
      
      console.log(`[${timestamp}] 🧪 Edge function ping response:`, { data, error });
      
      if (error) {
        console.error(`[${timestamp}] ❌ Edge function ping error:`, error);
        this.setLastError(error.message);
        toast.error(`Edge function error: ${error.message}`);
      } else {
        console.log(`[${timestamp}] ✅ Edge function ping successful:`, data);
        this.setLastResponse(data);
        toast.success("Edge function is working!");
      }
    } catch (error) {
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] ❌ Unexpected error testing edge function:`, error);
      this.setLastError(error instanceof Error ? error.message : 'Unknown error');
      toast.error(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.setLoading(false);
    }
  }
}
