
import React from "react";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import RevenuePerVideoRanking from "./components/RevenuePerVideoRanking";
import RevenuePerSubscriberRanking from "./components/RevenuePerSubscriberRanking";
import RankingsHeader from "./components/RankingsHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ChannelRankings = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <RankingsHeader 
        title="YouTube Channel Rankings"
        description="Discover the top performing YouTube channels based on different metrics."
      />
      
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="revenue-per-video" className="w-full">
          <TabsList className="mb-8 w-full max-w-md mx-auto">
            <TabsTrigger value="revenue-per-video" className="flex-1">
              Revenue Per Video
            </TabsTrigger>
            <TabsTrigger value="revenue-per-subscriber" className="flex-1">
              Revenue Per Subscriber
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="revenue-per-video">
            <RevenuePerVideoRanking />
          </TabsContent>
          
          <TabsContent value="revenue-per-subscriber">
            <RevenuePerSubscriberRanking />
          </TabsContent>
        </Tabs>
      </div>
      
      <PageFooter />
    </div>
  );
};

export default ChannelRankings;
