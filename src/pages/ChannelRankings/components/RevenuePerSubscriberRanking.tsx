
import React from "react";
import { useChannelRankings } from "../hooks/useChannelRankings";
import RankingTable from "./RankingTable";
import NichesLoadingState from "@/pages/components/niches/NichesLoadingState";
import NichesErrorState from "@/pages/components/niches/NichesErrorState";
import NichesEmptyState from "@/pages/components/niches/NichesEmptyState";

const RevenuePerSubscriberRanking = () => {
  const { channels, isLoading, error, refetch } = useChannelRankings("revenue_per_month");

  if (isLoading) {
    return <NichesLoadingState />;
  }

  if (error) {
    return (
      <NichesErrorState 
        error={error instanceof Error ? error : new Error("An unknown error occurred")} 
        onRetry={() => refetch()} 
      />
    );
  }

  if (!channels || channels.length === 0) {
    return <NichesEmptyState onRetry={() => refetch()} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Revenue Per Subscriber Ranking</h2>
        <p className="text-gray-600 mt-2">
          Channels ranked by estimated revenue generated per subscriber.
        </p>
      </div>
      
      <RankingTable 
        channels={channels} 
        rankingMetric="revenue_per_month"
      />
    </div>
  );
};

export default RevenuePerSubscriberRanking;
