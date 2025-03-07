
// Function to take screenshots via Apify's Screenshot URL Actor
export async function takeScreenshotViaAPI(url: string): Promise<ArrayBuffer | null> {
  try {
    console.log("Taking screenshot via Apify Screenshot URL actor:", url);
    
    // Get API key from environment
    const apiKey = Deno.env.get("APIFY_API_KEY") || Deno.env.get("APIFY_API_TOKEN");
    if (!apiKey) {
      console.error("APIFY_API_KEY not configured");
      throw new Error("Apify API key not configured");
    }
    
    // Prepare the Apify Actor input
    const input = {
      "urls": [
        {
          "url": url,
          "fullPage": false,
          "saveImages": true,
          "screenshotQuality": 85,
          "ignoreCookieBanners": true
        }
      ],
      "format": "png",
      "waitUntil": "networkidle2",
      "delay": 10000, // 10 seconds delay
      "viewportWidth": 1366,
      "viewportHeight": 768,
      "scrollToBottom": false,
      "proxy": {
        "useApifyProxy": true,
        "apifyProxyGroups": ["RESIDENTIAL"]
      }
    };
    
    console.log("Calling Apify Screenshot URL actor with input:", JSON.stringify(input, null, 2));
    
    // Use fetch API to call Apify API directly
    const apiUrl = `https://api.apify.com/v2/acts/apify~screenshot-url/runs?token=${apiKey}`;
    
    // Start the actor run
    const startResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input)
    });
    
    if (!startResponse.ok) {
      const errorText = await startResponse.text();
      console.error("Apify API error when starting actor:", startResponse.status, startResponse.statusText);
      console.error("Error response:", errorText);
      throw new Error(`Apify API error: ${startResponse.status} ${errorText || startResponse.statusText}`);
    }
    
    // Parse the response to get the run ID
    const runData = await startResponse.json();
    const runId = runData.data?.id;
    
    if (!runId) {
      console.error("No run ID returned from Apify");
      console.error("Response:", JSON.stringify(runData));
      throw new Error("No run ID returned from Apify");
    }
    
    console.log(`Apify actor run started with ID: ${runId}`);
    
    // Poll for the run status until it's completed
    let isFinished = false;
    let maxAttempts = 30; // 30 attempts with 2 second delay = max 1 minute wait
    let attempts = 0;
    
    while (!isFinished && attempts < maxAttempts) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between checks
      
      console.log(`Checking run status (attempt ${attempts}/${maxAttempts})...`);
      
      const statusResponse = await fetch(
        `https://api.apify.com/v2/acts/apify~screenshot-url/runs/${runId}?token=${apiKey}`
      );
      
      if (!statusResponse.ok) {
        console.error(`Error checking run status: ${statusResponse.status}`);
        continue; // Try again
      }
      
      const statusData = await statusResponse.json();
      const status = statusData.data?.status;
      
      console.log(`Run status: ${status}`);
      
      if (status === 'SUCCEEDED') {
        isFinished = true;
      } else if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
        throw new Error(`Apify run failed with status: ${status}`);
      }
    }
    
    if (!isFinished) {
      throw new Error("Apify run timed out or did not complete");
    }
    
    // Get the dataset items from the successful run
    const datasetResponse = await fetch(
      `https://api.apify.com/v2/acts/apify~screenshot-url/runs/${runId}/dataset/items?token=${apiKey}`
    );
    
    if (!datasetResponse.ok) {
      const errorText = await datasetResponse.text();
      console.error("Error fetching dataset:", datasetResponse.status, datasetResponse.statusText);
      console.error("Error response:", errorText);
      throw new Error(`Error fetching dataset: ${datasetResponse.status}`);
    }
    
    const items = await datasetResponse.json();
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("No items found in dataset");
      throw new Error("No screenshots found in the dataset");
    }
    
    console.log(`Found ${items.length} items in dataset`);
    
    // Get the screenshot URL from the first item
    const screenshotUrl = items[0].screenshotUrl;
    if (!screenshotUrl) {
      console.error("No screenshot URL found in items");
      console.error("Items:", JSON.stringify(items));
      throw new Error("No screenshot URL found in the dataset items");
    }
    
    console.log("Screenshot URL from Apify:", screenshotUrl);
    
    // Fetch the actual screenshot image from the URL
    const imageResponse = await fetch(screenshotUrl);
    if (!imageResponse.ok) {
      console.error("Error fetching screenshot image:", imageResponse.status, imageResponse.statusText);
      throw new Error(`Error fetching screenshot image: ${imageResponse.status}`);
    }
    
    console.log("Screenshot image fetched successfully");
    return await imageResponse.arrayBuffer();
  } catch (err) {
    console.error("Error taking screenshot via Apify API:", err);
    return null;
  }
}
