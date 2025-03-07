
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const ApiTester = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testApifyConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-apify-connection');
      
      if (error) {
        console.error("Error testing Apify connection:", error);
        setError(`Failed to test connection: ${error.message}`);
        return;
      }
      
      console.log("Apify connection test result:", data);
      setResult(data);
    } catch (err) {
      console.error("Error in test flow:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow-sm space-y-4">
      <h2 className="text-xl font-semibold">API Connection Tester</h2>
      <p className="text-sm text-gray-500">Test connection to external APIs</p>
      
      <Button 
        onClick={testApifyConnection} 
        disabled={loading}
        className="flex items-center gap-2"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Test Apify Connection
      </Button>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {result && (
        <Alert className={result.success ? "border-green-500" : "border-red-500"}>
          <AlertTitle>{result.success ? "Success" : "Failed"}</AlertTitle>
          <AlertDescription>
            <p>{result.message || result.error}</p>
            {result.userInfo && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                <p><strong>User ID:</strong> {result.userInfo.userId}</p>
                <p><strong>Username:</strong> {result.userInfo.username}</p>
                <p><strong>Plan:</strong> {result.userInfo.plan}</p>
              </div>
            )}
            {result.details && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-sm whitespace-pre-wrap">
                {result.details}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ApiTester;
