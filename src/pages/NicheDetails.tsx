
import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainNavbar from "@/components/MainNavbar";
import { Card } from "@/components/ui/card";
import PageFooter from "@/components/home/PageFooter";
import { ChannelCard } from "@/components/youtube/channel-list/components/ChannelCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface Niche {
  id: string;
  name: string;
  description?: string | null;
}

interface NicheDetail {
  id: string;
  niche_id: string;
  content: string | null;
}

const NicheDetails = () => {
  const { nicheId } = useParams<{ nicheId: string }>();

  const { data: niche, isLoading: isNicheLoading } = useQuery({
    queryKey: ["niche", nicheId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("niches")
        .select("*")
        .eq("id", nicheId)
        .single();
      
      if (error) throw error;
      return data as Niche;
    },
    enabled: !!nicheId,
  });

  const { data: nicheDetails } = useQuery({
    queryKey: ["niche-details", nicheId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("niche_details")
        .select("*")
        .eq("niche_id", nicheId)
        .single();
      
      if (error && error.code !== "PGRST116") throw error; // Ignore not found error
      return data as NicheDetail;
    },
    enabled: !!nicheId,
  });

  const { data: channels, isLoading: isChannelsLoading } = useQuery({
    queryKey: ["niche-channels", nicheId, niche?.name],
    queryFn: async () => {
      if (!niche?.name) return [];
      
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .eq("niche", niche.name)
        .order("total_subscribers", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!niche?.name,
  });

  if (isNicheLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <MainNavbar />
        <div className="container px-4 py-16 flex-1 flex items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        </div>
        <PageFooter />
      </div>
    );
  }

  if (!niche) {
    return (
      <div className="min-h-screen flex flex-col">
        <MainNavbar />
        <div className="container px-4 py-16 flex-1">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Niche Not Found</h1>
            <p className="mb-8">The niche you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/niches">Back to Niches</Link>
            </Button>
          </div>
        </div>
        <PageFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <MainNavbar />
      <div className="container px-4 py-16 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/niches" className="flex items-center">
                <ChevronLeft className="h-4 w-4 mr-2" /> Back to All Niches
              </Link>
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{niche.name}</h1>
            {niche.description && (
              <p className="text-gray-600 mb-6">{niche.description}</p>
            )}
          </div>

          {nicheDetails && nicheDetails.content && (
            <Card className="p-6 mb-8">
              <div dangerouslySetInnerHTML={{ __html: nicheDetails.content }} />
            </Card>
          )}

          <h2 className="text-2xl font-bold mb-6">Channels in this Niche</h2>
          
          {isChannelsLoading && (
            <div className="py-6 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading channels...</p>
            </div>
          )}

          {channels && channels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {channels.map((channel) => (
                <ChannelCard key={channel.id} channel={channel} />
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-gray-600">No channels found in this niche.</p>
            </div>
          )}
        </div>
      </div>
      <PageFooter />
    </div>
  );
};

export default NicheDetails;
