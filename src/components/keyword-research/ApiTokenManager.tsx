
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Key, Save, Check, Info, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ApiTokenManagerProps {
  apiToken: string;
  onChange: (token: string) => void;
}

const ApiTokenManager = ({ apiToken, onChange }: ApiTokenManagerProps) => {
  const [token, setToken] = useState(apiToken);
  const [showToken, setShowToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("apify_api_token");
    if (savedToken) {
      setToken(savedToken);
      onChange(savedToken);
    }
    setIsLoading(false);
  }, [onChange]);

  // Test if the token is valid
  const testToken = async () => {
    if (!token) {
      toast.error("Please enter an API token");
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-apify-connection', {
        body: { token }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || "Invalid API token");
      }

      // Save token to localStorage
      localStorage.setItem("apify_api_token", token);
      onChange(token);
      
      toast.success("API token validated successfully!");
    } catch (err) {
      console.error("Error testing token:", err);
      toast.error(`Failed to validate token: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="apiToken">Apify API Token</Label>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              id="apiToken"
              type={showToken ? "text" : "password"}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your Apify API token"
              className="pl-9"
            />
          </div>
          <Button onClick={testToken} disabled={isSaving}>
            {isSaving ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save & Test
              </>
            )}
          </Button>
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <Switch
            id="showToken"
            checked={showToken}
            onCheckedChange={setShowToken}
          />
          <Label htmlFor="showToken">Show token</Label>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-md">
        <div className="flex space-x-3">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm">
              You need an Apify API token to use the YouTube Keyword Research tool. The same token works for both channel data fetching and keyword research.
            </p>
            <p className="text-sm">
              If you already have an account for channel data fetching, you can use the same token.
            </p>
            <a 
              href="https://console.apify.com/sign-up" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              Sign up for Apify <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Code Examples</h3>
        <p className="text-sm text-gray-600">
          Copy and paste these examples to use the YouTube keyword research API directly.
        </p>

        <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
          <pre>{`import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
    token: '${token || '<YOUR_API_TOKEN>'}',
});

const input = {
    "keyword": "your search term",
    "country": "us",
    "language": "en",
    "searchHashtags": false,
    "removeDuplicates": true
};

(async () => {
    const run = await client.actor("karamelo~youtube-keywords-shitter").call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log(items);
})();`}</pre>
        </div>
      </div>
    </div>
  );
};

export default ApiTokenManager;
