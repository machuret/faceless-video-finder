
import React, { useState } from 'react';
import MainNavbar from '@/components/MainNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TrendingUp, Calendar, Info } from 'lucide-react';
import { calculateGrowthRate } from '@/utils/growthCalculations';
import { useToast } from '@/components/ui/use-toast';

const GrowthRateCalculator = () => {
  const [startSubscribers, setStartSubscribers] = useState<string>('');
  const [endSubscribers, setEndSubscribers] = useState<string>('');
  const [growthRate, setGrowthRate] = useState<number | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const { toast } = useToast();

  const handleCalculate = () => {
    const startValue = parseInt(startSubscribers);
    const endValue = parseInt(endSubscribers);
    
    if (isNaN(startValue) || isNaN(endValue)) {
      toast({
        title: "Invalid input",
        description: "Please enter valid numbers for subscriber counts.",
        variant: "destructive"
      });
      return;
    }
    
    if (startValue <= 0) {
      toast({
        title: "Invalid input",
        description: "Starting subscribers must be greater than zero.",
        variant: "destructive"
      });
      return;
    }
    
    const rate = calculateGrowthRate(startValue, endValue);
    setGrowthRate(rate);
    setIsCalculated(true);
    
    toast({
      title: "Growth rate calculated!",
      description: `Your YouTube channel growth rate is ${rate.toFixed(2)}%`,
    });
  };

  const getBenchmarkComparison = (rate: number) => {
    const weeklyBenchmark = 0.120;
    const monthlyBenchmark = 0.55;
    
    if (rate > monthlyBenchmark * 2) {
      return "Excellent! Your growth rate is more than double the average monthly rate.";
    } else if (rate > monthlyBenchmark) {
      return "Great! Your growth rate is above the average monthly rate.";
    } else if (rate > weeklyBenchmark) {
      return "Good. Your growth rate is above the average weekly rate.";
    } else if (rate > 0) {
      return "Your growth is positive but below average benchmarks.";
    } else {
      return "Your channel lost subscribers during this period.";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">YouTube Growth Rate Calculator</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Calculate Your Channel's Growth Rate
                </CardTitle>
                <CardDescription>
                  Measure your YouTube channel's growth rate based on subscriber counts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="startSubscribers" className="mb-2 block">
                      Starting Subscribers
                    </Label>
                    <Input
                      id="startSubscribers"
                      type="number"
                      value={startSubscribers}
                      onChange={(e) => setStartSubscribers(e.target.value)}
                      placeholder="e.g., 5,293"
                      className="mb-4"
                    />
                    <p className="text-sm text-gray-500">
                      Enter subscriber count at the beginning of the period
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="endSubscribers" className="mb-2 block">
                      Ending Subscribers
                    </Label>
                    <Input
                      id="endSubscribers"
                      type="number"
                      value={endSubscribers}
                      onChange={(e) => setEndSubscribers(e.target.value)}
                      placeholder="e.g., 5,428"
                      className="mb-4"
                    />
                    <p className="text-sm text-gray-500">
                      Enter subscriber count at the end of the period
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={handleCalculate} 
                  className="w-full mt-6"
                  size="lg"
                >
                  Calculate Growth Rate
                </Button>
                
                {isCalculated && growthRate !== null && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <TrendingUp className={`h-5 w-5 ${growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                      Growth Rate: <span className={`${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>{growthRate.toFixed(2)}%</span>
                    </h3>
                    <p className="mb-2">{getBenchmarkComparison(growthRate)}</p>
                    <p className="text-sm text-gray-600">
                      Subscriber Increase: {parseInt(endSubscribers) - parseInt(startSubscribers)} subscribers
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  Benchmark
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      Weekly Average
                    </h3>
                    <p className="text-2xl font-bold">0.120%</p>
                    <p className="text-sm text-gray-500">17 Feb - 23 Feb 2025</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-indigo-500" />
                      Monthly Average
                    </h3>
                    <p className="text-2xl font-bold">0.55%</p>
                    <p className="text-sm text-gray-500">February 2025</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>How to Calculate Growth Rate on YouTube</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Growth Rate is a simple calculation of the increase (or decrease) between two numbers, specifically the number of subscribers of a YouTube Channel.
              </p>
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <p className="font-medium mb-2">Monthly Growth Rate Formula:</p>
                <p className="font-mono bg-white p-2 rounded border">
                  Growth Rate = (End Subscribers - Start Subscribers) / Start Subscribers × 100
                </p>
              </div>
              <p className="mb-4">
                <span className="font-medium">Example:</span> If your YouTube Channel had 5,293 Subscribers on March 1 and 5,428 Subscribers on March 31.
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 pl-4">
                <li>5,428 − 5,293 = 135</li>
                <li>135 ÷ 5,293 = 0.02550</li>
                <li>0.02550 × 100 = 2.55%</li>
              </ul>
              <p>Growth Rate is usually expressed with 2 decimal places as a percentage.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default GrowthRateCalculator;
