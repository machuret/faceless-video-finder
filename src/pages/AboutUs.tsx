
import React from 'react';
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { Info, Video, Youtube } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <main>
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-crimson text-4xl md:text-5xl font-bold mb-4">About Us</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Helping creators build successful faceless YouTube channels since 2023
            </p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-crimson text-3xl font-bold mb-6 text-gray-800">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                At YT Channel Explorer, we're passionate about helping people create successful YouTube channels without showing their face. We believe anyone with great content ideas should be able to build an audience and generate income from YouTube.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our platform provides data-driven insights, tools, and resources to help you find profitable niches, analyze competition, and grow your faceless YouTube channel from zero to success.
              </p>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Info className="h-8 w-8 text-blue-600" />
                  <span className="text-lg font-semibold">Research-Based Approach</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Video className="h-8 w-8 text-blue-600" />
                  <span className="text-lg font-semibold">Creator-Focused</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158" 
                alt="About YT Channel Explorer" 
                className="rounded-lg shadow-xl max-w-full h-auto"
              />
            </div>
          </div>
          
          <div className="mt-20">
            <h2 className="font-crimson text-3xl font-bold mb-8 text-center text-gray-800">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Youtube className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-center">Channel Research</h3>
                <p className="text-gray-600 text-center">
                  We analyze thousands of successful faceless channels to identify the most profitable niches and content strategies.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Video className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-center">Growth Tools</h3>
                <p className="text-gray-600 text-center">
                  Our calculators and analytics tools help you track your progress and predict potential earnings and growth.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Info className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-center">Creator Resources</h3>
                <p className="text-gray-600 text-center">
                  Get access to guides, templates, and strategies that have worked for successful faceless YouTube channels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <PageFooter />
    </div>
  );
};

export default AboutUs;
