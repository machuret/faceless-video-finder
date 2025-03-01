
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import MainNavbar from "@/components/MainNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, DollarSign, Eye, ThumbsUp, MessageSquare, Share2 } from "lucide-react";
import { ReachStatCard } from "@/components/reach-calculator/ReachStatCard";
import { calculateReachValue } from "@/utils/reachCalculations";

export default function ReachCalculator() {
  const { toast } = useToast();
  const [views, setViews] = useState<number>(0);
  const [likes, setLikes] = useState<number>(0);
  const [dislikes, setDislikes] = useState<number>(0); 
  const [comments, setComments] = useState<number>(0);
  const [shares, setShares] = useState<number>(0);
  
  // Results
  const [reachValue, setReachValue] = useState<number>(0);
  const [engagementRate, setEngagementRate] = useState<number>(0);
  const [cpmEquivalent, setCpmEquivalent] = useState<number>(0);
  const [audienceValue, setAudienceValue] = useState<number>(0);

  const calculateResults = () => {
    // Prevent division by zero
    if (views === 0) {
      toast({
        title: "Views Required",
        description: "Please enter at least one view to calculate reach value.",
        variant: "destructive",
      });
      return;
    }

    // Calculate engagement rate (likes + comments + shares) / views
    const totalEngagements = likes + comments + shares;
    const calculatedEngagementRate = (totalEngagements / views) * 100;
    setEngagementRate(calculatedEngagementRate);

    // Calculate the monetary value using imported utility function
    const { totalValue, cpm, valuePerUser } = calculateReachValue(views, likes, dislikes, comments, shares);
    
    setReachValue(totalValue);
    setCpmEquivalent(cpm);
    setAudienceValue(valuePerUser);

    toast({
      title: "Reach Value Calculated",
      description: `Your content has an estimated ad value of $${totalValue.toFixed(2)}`,
    });
  };

  // Auto-calculate when values change
  useEffect(() => {
    if (views > 0) {
      calculateResults();
    }
  }, [views, likes, dislikes, comments, shares]);

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold font-crimson">YouTube Reach Calculator</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Calculate Your Content's Ad Value</CardTitle>
                <CardDescription>
                  Find out how much you would have to pay for ads to achieve the same reach and engagement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="views">Video Views</Label>
                    <Input
                      id="views"
                      type="number"
                      min={0}
                      value={views || ""}
                      onChange={(e) => setViews(parseInt(e.target.value) || 0)}
                      placeholder="Number of views"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="likes">Likes</Label>
                    <Input
                      id="likes"
                      type="number"
                      min={0}
                      value={likes || ""}
                      onChange={(e) => setLikes(parseInt(e.target.value) || 0)}
                      placeholder="Number of likes"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dislikes">Dislikes (estimated)</Label>
                    <Input
                      id="dislikes"
                      type="number"
                      min={0}
                      value={dislikes || ""}
                      onChange={(e) => setDislikes(parseInt(e.target.value) || 0)}
                      placeholder="Estimated dislikes"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="comments">Comments</Label>
                    <Input
                      id="comments"
                      type="number"
                      min={0}
                      value={comments || ""}
                      onChange={(e) => setComments(parseInt(e.target.value) || 0)}
                      placeholder="Number of comments"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="shares">Shares (estimated)</Label>
                    <Input
                      id="shares"
                      type="number"
                      min={0}
                      value={shares || ""}
                      onChange={(e) => setShares(parseInt(e.target.value) || 0)}
                      placeholder="Estimated shares"
                    />
                  </div>
                </div>
                
                <Button onClick={calculateResults} className="w-full">Calculate Reach Value</Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <ReachStatCard 
              title="Estimated Ad Value"
              value={`$${reachValue.toFixed(2)}`}
              icon={DollarSign}
              iconColor="text-green-600"
              description="Equivalent ad spend to achieve the same reach"
              cardClassName="mb-6"
              valueClassName="text-green-600"
            />
            
            <ReachStatCard 
              title="Engagement Rate"
              value={`${engagementRate.toFixed(2)}%`}
              icon={ThumbsUp}
              iconColor="text-blue-600"
              description="Percentage of viewers who engaged with your content"
              cardClassName="mb-6"
            />
            
            <ReachStatCard 
              title="Equivalent CPM"
              value={`$${cpmEquivalent.toFixed(2)}`}
              icon={Eye}
              iconColor="text-purple-600"
              description="Cost per thousand impressions equivalent"
              cardClassName="mb-6"
            />
            
            <ReachStatCard 
              title="Value Per User"
              value={`$${audienceValue.toFixed(4)}`}
              icon={Share2}
              iconColor="text-orange-600"
              description="Average value of each individual viewer"
            />
          </div>
        </div>
        
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How YouTube Reach Value Is Calculated</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>The YouTube Reach Calculator estimates the monetary value of your content based on several key metrics:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="bg-gray-100 p-4 rounded-lg flex items-start gap-3">
                <Eye className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Views</h3>
                  <p className="text-sm text-gray-600">The total number of video views. This forms the baseline for calculating your reach value.</p>
                </div>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg flex items-start gap-3">
                <ThumbsUp className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Engagement</h3>
                  <p className="text-sm text-gray-600">Includes likes, comments, and shares. Higher engagement increases your content's value.</p>
                </div>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">CPM Equivalent</h3>
                  <p className="text-sm text-gray-600">The estimated cost per thousand impressions if you were to pay for the same reach through advertising.</p>
                </div>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg flex items-start gap-3">
                <Share2 className="h-5 w-5 text-orange-600 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Value Multipliers</h3>
                  <p className="text-sm text-gray-600">Engagement actions like comments and shares are weighted higher as they represent more valuable interactions.</p>
                </div>
              </div>
            </div>
            
            <p className="mt-4 text-sm text-gray-500">
              The formula takes into account industry-standard CPM rates for YouTube advertising and adjusts based on your specific engagement metrics.
              Higher engagement rates typically result in higher estimated values, as engaged users are more valuable to advertisers.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
