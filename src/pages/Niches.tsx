
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainNavbar from "@/components/MainNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import PageFooter from "@/components/home/PageFooter";

interface Niche {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
}

const Niches = () => {
  const { data: niches, isLoading, error } = useQuery({
    queryKey: ["niches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("niches")
        .select("*")
        .order('name');
      
      if (error) throw error;
      return data as Niche[];
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <MainNavbar />
      <div className="container px-4 py-16 flex-1">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">YouTube Channel Niches</h1>
          <p className="text-gray-600 mb-8">
            Explore various niches for YouTube channels to find opportunities for your faceless channel.
          </p>

          {isLoading && (
            <div className="py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading niches...</p>
            </div>
          )}

          {error && (
            <div className="py-12 text-center">
              <p className="text-red-500">Failed to load niches. Please try again later.</p>
            </div>
          )}

          {niches && niches.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {niches.map((niche) => (
                <Card key={niche.id} className="hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                  {niche.image_url && (
                    <div className="w-full h-48 overflow-hidden">
                      <img 
                        src={niche.image_url} 
                        alt={niche.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{niche.name}</CardTitle>
                    {niche.description && (
                      <CardDescription 
                        dangerouslySetInnerHTML={{ __html: niche.description }}
                        className="line-clamp-2"
                      />
                    )}
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <Link 
                      to={`/niches/${niche.id}`} 
                      className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                    >
                      Explore Channels
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {niches && niches.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-600">No niches found. Check back later for updates.</p>
            </div>
          )}
        </div>
      </div>
      <PageFooter />
    </div>
  );
};

export default Niches;
