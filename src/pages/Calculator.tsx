
import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator as CalculatorIcon } from "lucide-react";
import MainNavbar from "@/components/MainNavbar";
import { useToast } from "@/components/ui/use-toast";

export default function Calculator() {
  const { toast } = useToast();
  const [dailyViews, setDailyViews] = useState<number>(0);
  const [musicTracks, setMusicTracks] = useState<number>(0);
  const [dailyRevenue, setDailyRevenue] = useState<number>(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [yearlyRevenue, setYearlyRevenue] = useState<number>(0);

  const calculateRevenue = () => {
    // Average YouTube Shorts RPM (Revenue per 1000 views)
    const baseRpm = 0.05; // $0.05 per 1000 views is a conservative estimate
    
    // Calculate creator's share based on music tracks
    let creatorShare = 1; // 100% if no music
    if (musicTracks === 1) {
      creatorShare = 0.5; // 50% if one music track
    } else if (musicTracks >= 2) {
      creatorShare = 0.33; // 33% if two or more music tracks
    }
    
    // YouTube takes 55% of revenue, creator gets 45%
    const platformShareMultiplier = 0.45;
    
    // Calculate daily revenue
    const viewsInThousands = dailyViews / 1000;
    const calculatedRevenue = viewsInThousands * baseRpm * creatorShare * platformShareMultiplier;
    
    setDailyRevenue(calculatedRevenue);
    setMonthlyRevenue(calculatedRevenue * 30);
    setYearlyRevenue(calculatedRevenue * 365);
    
    toast({
      title: "Revenue Calculated",
      description: `Estimated daily revenue: $${calculatedRevenue.toFixed(2)}`,
    });
  };

  useEffect(() => {
    // Optional: Auto-calculate revenue whenever inputs change
    calculateRevenue();
  }, [dailyViews, musicTracks]);

  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <CalculatorIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold font-crimson">YouTube Shorts Calculator</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Calculate Your Estimated Shorts Revenue</CardTitle>
                <CardDescription>
                  Adjust the sliders below to estimate your potential YouTube Shorts earnings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="daily-views">Daily Views</Label>
                    <span className="text-xl font-semibold">{formatViews(dailyViews)}</span>
                  </div>
                  <Slider
                    id="daily-views"
                    min={0}
                    max={10000000}
                    step={1000}
                    value={[dailyViews]}
                    onValueChange={(value) => setDailyViews(value[0])}
                    className="py-4"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>0</span>
                    <span>10M</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="music-tracks">Music Tracks Used</Label>
                    <span className="text-xl font-semibold">{musicTracks}</span>
                  </div>
                  <Slider
                    id="music-tracks"
                    min={0}
                    max={3}
                    step={1}
                    value={[musicTracks]}
                    onValueChange={(value) => setMusicTracks(value[0])}
                    className="py-4"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>0</span>
                    <span>3+</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={calculateRevenue} className="w-full">Calculate Revenue</Button>
              </CardFooter>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Estimated Revenue</CardTitle>
                <CardDescription>
                  Based on your inputs and YouTube's revenue sharing model
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Daily Revenue</p>
                  <p className="text-3xl font-bold text-green-600">${dailyRevenue.toFixed(2)}</p>
                </div>
                
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Monthly Revenue (30 days)</p>
                  <p className="text-2xl font-bold text-green-600">${monthlyRevenue.toFixed(2)}</p>
                </div>
                
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Yearly Revenue (365 days)</p>
                  <p className="text-2xl font-bold text-green-600">${yearlyRevenue.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Revenue Sharing Model</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  <span className="font-semibold">0 music tracks:</span> Creator keeps 100% of their share
                </p>
                <p>
                  <span className="font-semibold">1 music track:</span> 50% to creator, 50% to music publisher
                </p>
                <p>
                  <span className="font-semibold">2+ music tracks:</span> 33% to creator, 67% to music publishers
                </p>
                <p className="pt-2 border-t">
                  Overall, creators receive 45% of their revenue share after YouTube's platform cut.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>How YouTube Shorts Monetization Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>A portion of all YouTube Shorts revenue goes to the creator pool, which is calculated based on views and music usage across all YouTube Shorts.</p>
              <p>Next, YouTube pays music publishers based on how often their intellectual property is used within YouTube Shorts.</p>
              <p>For example, if a creator uses two music tracks in a Short, 66% of revenue goes to music publishers while 33% goes to the YouTube Shorts creator.</p>
              <p>If a creator uses one music track in a YouTube Short, revenue is split 50/50 between them and music publishers.</p>
              <p>If a creator uses no music tracks, they keep all revenue from their share of the creator pool.</p>
              <p>Overall, monetizing YouTube creators keep 45% of their revenue share from the creator pool (after deductions are made for music usage).</p>
              <p>If you are a creator looking to monetize your YouTube Shorts your earnings are based on the number of views you get, your geographical location, and how many music tracks you use.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
