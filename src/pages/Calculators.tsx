
import React from "react";
import MainNavbar from "@/components/MainNavbar";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, DollarSign, BarChart, TrendingUp } from "lucide-react";
import PageFooter from "@/components/home/PageFooter";

const Calculators = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">YouTube Creator Tools</h1>
          <p className="text-gray-600 mb-8">
            Powerful calculators to help YouTube creators analyze their performance, estimate earnings,
            and make data-driven decisions for channel growth.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <Link to="/calculator">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <Calculator className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-crimson text-xl font-semibold">YouTube Shorts Calculator</h3>
                    <p className="text-gray-600 font-lato">Estimate your potential earnings from YouTube Shorts based on views and music usage</p>
                  </div>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <Link to="/channel-earnings">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="bg-green-100 p-4 rounded-full">
                    <DollarSign className="h-7 w-7 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-crimson text-xl font-semibold">Channel Earnings Estimator</h3>
                    <p className="text-gray-600 font-lato">Calculate estimated earnings for any YouTube channel based on views and engagement</p>
                  </div>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <Link to="/reach-calculator">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="bg-purple-100 p-4 rounded-full">
                    <BarChart className="h-7 w-7 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-crimson text-xl font-semibold">Reach Calculator</h3>
                    <p className="text-gray-600 font-lato">Estimate the equivalent advertising value of your YouTube content's organic reach</p>
                  </div>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <Link to="/growth-calculator">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <TrendingUp className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-crimson text-xl font-semibold">Growth Rate Calculator</h3>
                    <p className="text-gray-600 font-lato">Track and analyze your channel's subscriber growth rate over time</p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Why Use Our Calculator Tools?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Accurate Estimates</h3>
                <p>Our calculators use industry-standard metrics to provide realistic earnings and performance estimates.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Growth Planning</h3>
                <p>Make informed decisions about content strategy by understanding how different factors impact your channel.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Optimization</h3>
                <p>Identify opportunities to increase revenue and reach by analyzing your current performance.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
};

export default Calculators;
