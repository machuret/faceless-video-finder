
import React from "react";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import RevenuePerVideoRanking from "./components/RevenuePerVideoRanking";
import RankingsHeader from "./components/RankingsHeader";

const ChannelRankings = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <RankingsHeader 
        title="YouTube Channel Rankings"
        description="Discover the top performing YouTube channels based on different metrics."
      />
      
      <div className="container mx-auto px-4 py-8">
        <RevenuePerVideoRanking />
      </div>
      
      <PageFooter />
    </div>
  );
};

export default ChannelRankings;
