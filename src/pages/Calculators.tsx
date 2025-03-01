
import React from "react";
import MainNavbar from "@/components/MainNavbar";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, DollarSign, BarChart, TrendingUp, ArrowRight, Zap, PieChart, ChartBar, Target } from "lucide-react";
import PageFooter from "@/components/home/PageFooter";
import { Button } from "@/components/ui/button";

const Calculators = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />

      <main>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center">
              <h1 className="font-crimson text-4xl md:text-5xl font-bold mb-4">YouTube Creator Tools</h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-6">
                Powerful calculators to help you analyze performance, estimate earnings,
                and make data-driven decisions for channel growth.
              </p>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            {/* Main Calculators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                <Link to="/calculator" className="block h-full">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                    <div className="bg-blue-600 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      <Calculator className="h-6 w-6" />
                    </div>
                    <h3 className="font-crimson text-2xl font-bold text-blue-900">YouTube Shorts Calculator</h3>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4">
                      Estimate your potential earnings from YouTube Shorts based on views, engagement metrics, and monetization factors.
                    </p>
                    <div className="flex items-center text-blue-600 font-medium">
                      Try Calculator <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                <Link to="/channel-earnings" className="block h-full">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6">
                    <div className="bg-green-600 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <h3 className="font-crimson text-2xl font-bold text-green-900">Channel Earnings Estimator</h3>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4">
                      Calculate estimated earnings for any YouTube channel based on views, subscribers, and engagement rates.
                    </p>
                    <div className="flex items-center text-green-600 font-medium">
                      Try Calculator <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                <Link to="/reach-calculator" className="block h-full">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6">
                    <div className="bg-purple-600 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      <BarChart className="h-6 w-6" />
                    </div>
                    <h3 className="font-crimson text-2xl font-bold text-purple-900">Reach Calculator</h3>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4">
                      Estimate the equivalent advertising value of your YouTube content's organic reach and audience impact.
                    </p>
                    <div className="flex items-center text-purple-600 font-medium">
                      Try Calculator <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                <Link to="/growth-calculator" className="block h-full">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6">
                    <div className="bg-orange-600 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <h3 className="font-crimson text-2xl font-bold text-orange-900">Growth Rate Calculator</h3>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4">
                      Track and analyze your channel's subscriber growth rate over time and predict future performance.
                    </p>
                    <div className="flex items-center text-orange-600 font-medium">
                      Try Calculator <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </div>
            
            {/* Coming Soon Section */}
            <div className="mb-12">
              <h2 className="font-crimson text-2xl font-bold mb-6 text-center text-gray-800">Coming Soon</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gray-50 border border-dashed">
                  <CardContent className="p-6 flex flex-col items-center text-center opacity-70">
                    <ChartBar className="h-10 w-10 text-gray-400 mb-3" />
                    <h3 className="font-crimson text-xl font-semibold mb-2">Content Performance Analyzer</h3>
                    <p className="text-gray-500 text-sm">Compare your videos and identify what performs best</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-50 border border-dashed">
                  <CardContent className="p-6 flex flex-col items-center text-center opacity-70">
                    <Target className="h-10 w-10 text-gray-400 mb-3" />
                    <h3 className="font-crimson text-xl font-semibold mb-2">Niche Profitability Index</h3>
                    <p className="text-gray-500 text-sm">Discover the most profitable YouTube niches</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-50 border border-dashed">
                  <CardContent className="p-6 flex flex-col items-center text-center opacity-70">
                    <PieChart className="h-10 w-10 text-gray-400 mb-3" />
                    <h3 className="font-crimson text-xl font-semibold mb-2">Revenue Breakdown</h3>
                    <p className="text-gray-500 text-sm">Analyze earnings by source and content type</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          
            {/* Why Use Our Calculator Tools */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-12">
              <h2 className="font-crimson text-2xl font-bold mb-6 text-center">Why Use Our Calculator Tools?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="rounded-full bg-blue-100 p-2 mr-3">
                      <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-blue-900">Accurate Estimates</h3>
                  </div>
                  <p className="text-gray-600">Our calculators use industry-standard metrics to provide realistic earnings and performance estimates.</p>
                </div>
                
                <div className="p-6 bg-green-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="rounded-full bg-green-100 p-2 mr-3">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-green-900">Growth Planning</h3>
                  </div>
                  <p className="text-gray-600">Make informed decisions about content strategy by understanding how different factors impact your channel.</p>
                </div>
                
                <div className="p-6 bg-purple-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="rounded-full bg-purple-100 p-2 mr-3">
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-purple-900">Optimization</h3>
                  </div>
                  <p className="text-gray-600">Identify opportunities to increase revenue and reach by analyzing your current performance.</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center bg-gradient-to-r from-blue-600 to-blue-800 text-white p-10 rounded-xl">
              <h2 className="font-crimson text-3xl font-bold mb-4">Ready to grow your YouTube channel?</h2>
              <p className="text-xl mb-6 text-blue-100">
                Start using our free calculator tools today and take your channel to the next level.
              </p>
              <Link to="/">
                <Button className="bg-white text-blue-700 hover:bg-gray-100 px-6 py-3 text-lg font-medium">
                  Explore Channel Ideas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
};

export default Calculators;
