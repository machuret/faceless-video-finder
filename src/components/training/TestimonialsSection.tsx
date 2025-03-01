
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const TestimonialsSection: React.FC = () => {
  return (
    <div className="my-16 max-w-5xl mx-auto">
      <h2 className="text-3xl font-crimson font-bold text-center mb-10">Success Stories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-white shadow-md">
          <CardContent className="p-6">
            <p className="italic text-gray-600 mb-4">
              "This training program helped me go from 0 to 50,000 subscribers in just 6 months. The strategies for faceless YouTube channels were exactly what I needed."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-600 font-semibold">JM</div>
              <div className="ml-3">
                <p className="font-semibold">John M.</p>
                <p className="text-sm text-gray-500">Finance Channel Owner</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-md">
          <CardContent className="p-6">
            <p className="italic text-gray-600 mb-4">
              "The monetization techniques alone were worth the investment. I've been able to quit my full-time job and focus entirely on my YouTube business."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center text-green-600 font-semibold">SK</div>
              <div className="ml-3">
                <p className="font-semibold">Sarah K.</p>
                <p className="text-sm text-gray-500">Lifestyle Content Creator</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestimonialsSection;
