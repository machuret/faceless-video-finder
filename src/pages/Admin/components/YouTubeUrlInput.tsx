
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormSectionWrapper from "./form-sections/FormSectionWrapper";
import { AlertCircle, Bug, Info, Youtube, Zap, TestTube, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface YouTubeUrlInputProps {
  youtubeUrl: string;
  loading: boolean;
  setYoutubeUrl: (url: string) => void;
  onFetch: () => void;
  debugInfo?: {
    lastError: string | null;
    lastResponse: any;
    testEdgeFunction?: () => Promise<void>;
    runTestSuite?: () => Promise<any>;
    testResults?: Array<{url: string, success: boolean, data: any}>;
  };
}

const YouTubeUrlInput = ({
  youtubeUrl,
  loading,
  setYoutubeUrl,
  onFetch,
  debugInfo
}: YouTubeUrlInputProps) => {
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState("");
  const [showDebugInfo, setShowDebugInfo] = useState(true);
  const [showAdvancedDebug, setShowAdvancedDebug] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [showTestResults, setShowTestResults] = useState(false);

  const validateUrl = (url: string) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔍 Validating URL: "${url}"`);
    
    if (!url || url.trim() === "") {
      setIsValid(false);
      setValidationMessage("URL is required");
      console.log(`[${timestamp}] ❌ URL is empty`);
      return false;
    }
    
    // We're now supporting a wider range of URL formats, so our validation is more permissive
    const youtubePatterns = [
      /youtube\.com\/channel\/([^\/\?]+)/,     // Channel URL
      /youtube\.com\/c\/([^\/\?]+)/,           // Custom URL
      /youtube\.com\/user\/([^\/\?]+)/,        // User URL
      /youtube\.com\/@([^\/\?]+)/,             // Handle URL
      /@([^\/\?\s]+)/,                         // Just the handle
      /youtube\.com\/watch\?v=([^&]+)/,        // Video URL
      /youtu\.be\/([^\/\?]+)/                  // Short video URL
    ];
    
    const isYoutubeUrl = youtubePatterns.some(pattern => pattern.test(url));
    
    if (!isYoutubeUrl) {
      // We're allowing any URL, but showing a warning for non-YouTube URLs
      console.log(`[${timestamp}] ⚠️ URL doesn't match any YouTube pattern: "${url}"`);
      // But we'll still accept it since our backend can try to make sense of it
      setIsValid(true);
      setValidationMessage("Not a standard YouTube URL format, but we'll try to extract info.");
      return true;
    }
    
    setIsValid(true);
    setValidationMessage("");
    console.log(`[${timestamp}] ✅ URL validation passed for: "${url}"`);
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setYoutubeUrl(url);
    
    if (url) {
      validateUrl(url);
    } else {
      setIsValid(true);
      setValidationMessage("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔘 Submit button clicked for URL: "${youtubeUrl}"`);
    
    if (validateUrl(youtubeUrl)) {
      console.log(`[${timestamp}] ✅ URL valid, initiating fetch`);
      onFetch();
    } else {
      console.log(`[${timestamp}] ❌ URL validation failed, not fetching`);
    }
  };

  const testEdgeFunction = async () => {
    try {
      setTestLoading(true);
      setTestResult(null);
      
      if (debugInfo?.testEdgeFunction) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] 🧪 Using builtin test function...`);
        await debugInfo.testEdgeFunction();
        
        setTestResult({ 
          success: true, 
          data: debugInfo.lastResponse || { message: "Function called, check console for details" } 
        });
      } else {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] 🧪 Testing edge function with simple ping...`);
        
        const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
          body: { test: true, timestamp }
        });
        
        console.log(`[${timestamp}] 🧪 Edge function test response:`, { data, error });
        
        if (error) {
          console.error(`[${timestamp}] ❌ Edge function test error:`, error);
          toast.error(`Edge function error: ${error.message}`);
          setTestResult({ success: false, error });
        } else {
          console.log(`[${timestamp}] ✅ Edge function test successful:`, data);
          toast.success("Edge function is working!");
          setTestResult({ success: true, data });
        }
      }
    } catch (err) {
      console.error(`[${new Date().toISOString()}] ❌ Unexpected error testing edge function:`, err);
      toast.error(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setTestResult({ success: false, error: err });
    } finally {
      setTestLoading(false);
    }
  };

  const pingEdgeFunction = async () => {
    try {
      setTestLoading(true);
      setTestResult(null);
      
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 🧪 Pinging edge function...`);
      
      const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
        body: { ping: true, timestamp }
      });
      
      console.log(`[${timestamp}] 🧪 Edge function ping response:`, { data, error });
      
      if (error) {
        console.error(`[${timestamp}] ❌ Edge function ping error:`, error);
        toast.error(`Edge function error: ${error.message}`);
        setTestResult({ success: false, error });
      } else {
        console.log(`[${timestamp}] ✅ Edge function ping successful:`, data);
        toast.success("Edge function ping successful!");
        setTestResult({ success: true, data });
      }
    } catch (err) {
      console.error(`[${new Date().toISOString()}] ❌ Unexpected error pinging edge function:`, err);
      toast.error(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setTestResult({ success: false, error: err });
    } finally {
      setTestLoading(false);
    }
  };

  const testWithMockData = async () => {
    try {
      setTestLoading(true);
      const timestamp = new Date().toISOString();
      
      if (!youtubeUrl.trim()) {
        toast.error("Please enter a YouTube URL first");
        return;
      }
      
      console.log(`[${timestamp}] 🧪 Testing with mock data for URL: ${youtubeUrl}`);
      
      const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
        body: { 
          url: youtubeUrl.trim(), 
          allowMockData: true,
          timestamp 
        }
      });
      
      console.log(`[${timestamp}] 🧪 Mock data test response:`, { data, error });
      
      if (error) {
        console.error(`[${timestamp}] ❌ Mock data test error:`, error);
        toast.error(`Error: ${error.message}`);
        setTestResult({ success: false, error });
      } else if (data?.channelData) {
        console.log(`[${timestamp}] ✅ Mock data test successful:`, data);
        toast.success(data.isMockData ? "Retrieved mock data successfully" : "Retrieved channel data successfully");
        setTestResult({ success: true, data });
      } else {
        console.error(`[${timestamp}] ⚠️ Mock data test returned unexpected format:`, data);
        toast.error("Unexpected response format");
        setTestResult({ success: false, data, error: "Unexpected response format" });
      }
    } catch (err) {
      console.error(`[${new Date().toISOString()}] ❌ Unexpected error testing with mock data:`, err);
      toast.error(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setTestResult({ success: false, error: err });
    } finally {
      setTestLoading(false);
    }
  };

  const runTestSuite = async () => {
    if (!debugInfo?.runTestSuite) {
      toast.error("Test suite function not available");
      return;
    }
    
    setTestLoading(true);
    toast.info("Running comprehensive test suite...");
    
    try {
      await debugInfo.runTestSuite();
      setShowTestResults(true);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ❌ Error running test suite:`, error);
      toast.error(`Test suite error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <FormSectionWrapper 
      title="YouTube URL" 
      description="Enter a YouTube channel URL to auto-populate the form"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={youtubeUrl}
                onChange={handleInputChange}
                placeholder="https://youtube.com/... or @username"
                className={`pl-10 ${!isValid ? 'border-red-500' : ''}`}
                required
              />
              <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <Button 
              type="submit" 
              disabled={loading || !youtubeUrl || !isValid}
              className="min-w-24"
            >
              {loading ? "Fetching..." : "Fetch"}
            </Button>
          </div>
          
          {validationMessage && (
            <div className={`text-sm flex items-center gap-1 ${!isValid ? 'text-red-500' : 'text-amber-500'}`}>
              {!isValid ? <AlertCircle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
              <span>{validationMessage}</span>
            </div>
          )}
          
          {debugInfo?.lastError && (
            <div className="text-amber-600 text-sm flex items-center gap-1 mt-1 p-2 bg-amber-50 rounded">
              <AlertCircle className="h-4 w-4" />
              <span>Last error: {debugInfo.lastError}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-2">
            <button 
              type="button" 
              className="text-xs text-blue-500 flex items-center gap-1"
              onClick={() => setShowDebugInfo(!showDebugInfo)}
            >
              <Info className="h-3 w-3" />
              {showDebugInfo ? "Hide debug info" : "Show debug info"}
            </button>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={testEdgeFunction}
                disabled={testLoading}
                className="text-xs flex items-center gap-1"
              >
                <Zap className="h-3 w-3" />
                {testLoading ? "Testing..." : "Test Edge Function"}
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={pingEdgeFunction}
                disabled={testLoading}
                className="text-xs flex items-center gap-1"
              >
                <Zap className="h-3 w-3" />
                Ping
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={runTestSuite}
                disabled={testLoading || !debugInfo?.runTestSuite}
                className="text-xs flex items-center gap-1"
              >
                <TestTube className="h-3 w-3" />
                Run Test Suite
              </Button>
            </div>
          </div>
          
          {testResult && (
            <div className={`mt-2 p-2 rounded text-xs ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <p className="font-semibold">{testResult.success ? '✅ Test Success' : '❌ Test Failed'}</p>
              <pre className="text-[10px] overflow-auto max-h-32 mt-1">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
          
          {/* Test Suite Results */}
          {showTestResults && debugInfo?.testResults && debugInfo.testResults.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Test Suite Results</h3>
                <span className="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                  {debugInfo.testResults.filter(r => r.success).length}/{debugInfo.testResults.length} Passed
                </span>
              </div>
              
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {debugInfo.testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`text-xs p-2 rounded-md ${result.success ? 'bg-green-50' : 'bg-red-50'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-medium flex items-center gap-1">
                        {result.success ? (
                          <Check size={12} className="text-green-600" />
                        ) : (
                          <X size={12} className="text-red-600" />
                        )}
                        <span className="truncate max-w-[200px]">{result.url}</span>
                      </div>
                      <button 
                        onClick={() => setYoutubeUrl(result.url)}
                        className="text-blue-600 hover:underline"
                      >
                        Use
                      </button>
                    </div>
                    
                    {result.success && result.data?.basicInfo && (
                      <div className="mt-1 pl-4 text-[10px] text-gray-600">
                        <div>Title: {result.data.basicInfo.channelTitle || 'N/A'}</div>
                        <div>ID: {result.data.basicInfo.channelId || 'N/A'}</div>
                        <div>Method: {result.data.extractionMethod || 'N/A'}</div>
                      </div>
                    )}
                    
                    {!result.success && (
                      <div className="mt-1 pl-4 text-[10px] text-red-600">
                        Error: {result.data?.error || 'Unknown error'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {showDebugInfo && (
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700 overflow-auto max-h-48">
              <p>• Current status: {loading ? "Loading..." : "Ready"}</p>
              <p>• Entered URL: {youtubeUrl || "None"}</p>
              <p>• URL valid: {isValid ? "Yes" : "No"}</p>
              <p>• Test URLs - Try these examples:</p>
              <ul className="list-disc ml-5 mt-1">
                <li>Channel: https://youtube.com/channel/UCttFk8-Nysnyw59aNlWOWzw</li>
                <li>Handle: @7SecondRiddles</li>
                <li>Video: https://www.youtube.com/watch?v=dQw4w9WgXcQ</li>
                <li>Custom: https://www.youtube.com/c/MarkRober</li>
                <li>User: https://www.youtube.com/user/nigahiga</li>
              </ul>
              
              <button 
                type="button" 
                className="text-xs text-purple-500 flex items-center gap-1 mt-2"
                onClick={() => setShowAdvancedDebug(!showAdvancedDebug)}
              >
                <Bug className="h-3 w-3" />
                {showAdvancedDebug ? "Hide advanced debug" : "Show advanced debug"}
              </button>
              
              {showAdvancedDebug && debugInfo?.lastResponse && (
                <div className="mt-2 p-2 bg-gray-200 rounded">
                  <p>Last Response:</p>
                  <pre className="text-[10px] overflow-auto max-h-32">
                    {JSON.stringify(debugInfo.lastResponse, null, 2)}
                  </pre>
                </div>
              )}
              
              <p className="mt-1">• Check browser console (F12) for detailed logs.</p>
              <p className="mt-1">• Edge function logs are also available in Supabase dashboard.</p>
            </div>
          )}
        </div>
      </form>
    </FormSectionWrapper>
  );
};

export default YouTubeUrlInput;
