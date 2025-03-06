
import { Dispatch, SetStateAction } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { YouTubeTestResult } from "./types";

export class TestSuiteRunner {
  private setTestResults: Dispatch<SetStateAction<YouTubeTestResult[]>>;
  private setLoading: Dispatch<SetStateAction<boolean>>;
  private setAttempts: Dispatch<SetStateAction<number>>;

  constructor(
    setTestResults: Dispatch<SetStateAction<YouTubeTestResult[]>>,
    setLoading: Dispatch<SetStateAction<boolean>>,
    setAttempts: Dispatch<SetStateAction<number>>
  ) {
    this.setTestResults = setTestResults;
    this.setLoading = setLoading;
    this.setAttempts = setAttempts;
  }

  async runTestSuite(): Promise<YouTubeTestResult[]> {
    this.setLoading(true);
    this.setTestResults([]);
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🧪 Running comprehensive test suite...`);
    
    // Define test URLs
    const testUrls = [
      // Channel ID format
      "https://www.youtube.com/channel/UCttFk8-Nysnyw59aNlWOWzw", // 7-Second Riddles
      "https://youtube.com/channel/UC-lHJZR3Gqxm24_Vd_AJ5Yw", // PewDiePie
      
      // Handle format
      "https://www.youtube.com/@7SecondRiddles",
      "@MrBeast",
      
      // Custom channel format
      "https://www.youtube.com/c/MarkRober",
      "https://youtube.com/c/veritasium",
      
      // User channel format
      "https://www.youtube.com/user/nigahiga",
      
      // Video format
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Rick Astley
      "https://youtu.be/jNQXAC9IVRw", // First YouTube video
      
      // Short URLs
      "youtu.be/dQw4w9WgXcQ",
      
      // Invalid/unusual formats
      "https://www.youtube.com",
      "rickastley"
    ];
    
    // Test results
    const results: YouTubeTestResult[] = [];
    
    // Test each URL
    for (const url of testUrls) {
      try {
        console.log(`[${timestamp}] 🧪 Testing URL: ${url}`);
        this.setAttempts(prev => prev + 1);
        
        const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
          body: { 
            url: url.trim(),
            timestamp,
            test: true
          }
        });
        
        if (error) {
          console.error(`[${timestamp}] ❌ Test failed for URL ${url}:`, error);
          results.push({
            url,
            success: false,
            data: { error: error.message }
          });
        } else if (data && data.basicInfo) {
          console.log(`[${timestamp}] ✅ Test passed for URL ${url}:`, data.basicInfo);
          results.push({
            url,
            success: true,
            data
          });
        } else {
          console.error(`[${timestamp}] ❌ Unexpected response format for URL ${url}:`, data);
          results.push({
            url,
            success: false,
            data: { error: "Unexpected response format", response: data }
          });
        }
        
        // Add a delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`[${timestamp}] ❌ Error testing URL ${url}:`, error);
        results.push({
          url,
          success: false,
          data: { error: error instanceof Error ? error.message : "Unknown error" }
        });
      }
    }
    
    console.log(`[${timestamp}] 🧪 Test suite complete. Results:`, results);
    this.setTestResults(results);
    this.setLoading(false);
    
    // Count successful tests
    const successCount = results.filter(r => r.success).length;
    toast.info(`Test suite complete: ${successCount}/${testUrls.length} tests passed`);
    
    return results;
  }
}
