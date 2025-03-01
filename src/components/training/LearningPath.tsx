
import React from "react";

const LearningPath: React.FC = () => {
  return (
    <div className="mt-16 mb-12 max-w-4xl mx-auto">
      <h2 className="text-3xl font-crimson font-bold text-center mb-8">Your Learning Path</h2>
      <div className="relative">
        {/* Timeline */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200"></div>
        
        {/* Timeline Steps */}
        <div className="space-y-12 relative">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-8 md:text-right order-2 md:order-1">
              <h3 className="text-xl font-semibold mb-2">1. Channel Foundation</h3>
              <p className="text-gray-600">Learn how to set up your channel for success from day one.</p>
            </div>
            <div className="z-10 flex-shrink-0 order-1 md:order-2 mb-4 md:mb-0">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="flex flex-col md:flex-row items-center">
            <div className="z-10 flex-shrink-0 order-1 mb-4 md:mb-0">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white font-bold">2</span>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-8 order-2">
              <h3 className="text-xl font-semibold mb-2">2. Content Creation</h3>
              <p className="text-gray-600">Master the art of creating engaging, high-quality content.</p>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-8 md:text-right order-2 md:order-1">
              <h3 className="text-xl font-semibold mb-2">3. Growth & Optimization</h3>
              <p className="text-gray-600">Learn strategies to grow your audience and optimize for the algorithm.</p>
            </div>
            <div className="z-10 flex-shrink-0 order-1 md:order-2 mb-4 md:mb-0">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-white font-bold">3</span>
              </div>
            </div>
          </div>
          
          {/* Step 4 */}
          <div className="flex flex-col md:flex-row items-center">
            <div className="z-10 flex-shrink-0 order-1 mb-4 md:mb-0">
              <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                <span className="text-white font-bold">4</span>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-8 order-2">
              <h3 className="text-xl font-semibold mb-2">4. Monetization</h3>
              <p className="text-gray-600">Turn your channel into a profitable business with multiple revenue streams.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPath;
