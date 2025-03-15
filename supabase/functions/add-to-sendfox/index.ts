
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendFoxRequest {
  email: string;
  first_name?: string;
  list_id: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, first_name, list_id = 1191 }: SendFoxRequest = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }

    console.log(`Attempting to add user ${email} to SendFox list ${list_id}`);

    // Call SendFox API to add user to list
    const response = await fetch("https://api.sendfox.com/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SENDFOX_API_KEY")}`,
      },
      body: JSON.stringify({
        email,
        first_name: first_name || "",
        lists: [list_id],
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("SendFox API error:", data);
      throw new Error(`SendFox API error: ${JSON.stringify(data)}`);
    }

    console.log("User successfully added to SendFox:", data);
    
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      },
    });
  } catch (error: any) {
    console.error("Error adding user to SendFox:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "An error occurred" 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
