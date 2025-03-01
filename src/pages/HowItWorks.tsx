
import React from 'react';
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { Search, Calculator, Video, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <main>
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-crimson text-4xl md:text-5xl font-bold mb-4">How This Works</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Your step-by-step guide to finding and growing a successful faceless YouTube channel
            </p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="font-crimson text-3xl font-bold mb-6 text-gray-800">Our Platform Explained</h2>
              <p className="text-lg text-gray-600 mb-6">
                YT Channel Explorer is a comprehensive platform designed to help you research, start, and grow a successful faceless YouTube channel. We provide data-backed insights on what's working right now in the faceless YouTube space.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Through our tools and resources, you can save countless hours of research and avoid common mistakes that many new creators make when starting their channel.
              </p>
              <Link to="/calculators">
                <Button className="mt-4">
                  Explore Our Tools <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b" 
                alt="How YT Channel Explorer Works" 
                className="rounded-lg shadow-xl max-w-full h-auto"
              />
            </div>
          </div>
          
          <h2 className="font-crimson text-3xl font-bold mb-12 text-center text-gray-800">The Process</h2>
          
          <div className="space-y-16 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="bg-blue-600 text-white rounded-full h-16 w-16 flex-shrink-0 flex items-center justify-center text-2xl font-bold">1</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3">Research Profitable Niches</h3>
                <p className="text-gray-600 mb-4">
                  Browse our database of successful faceless YouTube channels. Filter by category, subscriber count, and revenue estimates to identify profitable niches that match your interests.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg flex items-center">
                  <Search className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">Use our search tools to find channels by keyword, niche, or category</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="bg-blue-600 text-white rounded-full h-16 w-16 flex-shrink-0 flex items-center justify-center text-2xl font-bold">2</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3">Calculate Potential Revenue</h3>
                <p className="text-gray-600 mb-4">
                  Use our calculator tools to estimate potential earnings based on niche, content type, and upload frequency. Get realistic projections for subscriber growth and revenue generation.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg flex items-center">
                  <Calculator className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">Our calculators provide data-backed estimates of channel growth and earnings</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="bg-blue-600 text-white rounded-full h-16 w-16 flex-shrink-0 flex items-center justify-center text-2xl font-bold">3</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3">Analyze Growth Strategies</h3>
                <p className="text-gray-600 mb-4">
                  Study what works for successful channels in your chosen niche. Our tools break down video performance, upload frequency, and engagement metrics to give you actionable insights.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg flex items-center">
                  <TrendingUp className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">Compare growth rates across different channel types and content strategies</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="bg-blue-600 text-white rounded-full h-16 w-16 flex-shrink-0 flex items-center justify-center text-2xl font-bold">4</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3">Create and Grow Your Channel</h3>
                <p className="text-gray-600 mb-4">
                  Apply the insights from our platform to create your own faceless YouTube channel. Use our resources to optimize your content, descriptions, and tags for maximum growth.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg flex items-center">
                  <Video className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">Follow our framework for consistent channel growth without showing your face</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-20 text-center">
            <h3 className="text-2xl font-bold mb-6">Ready to start your faceless YouTube journey?</h3>
            <Link to="/">
              <Button size="lg" className="font-semibold">
                Start Exploring Channels
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <PageFooter />
    </div>
  );
};

export default HowItWorks;
