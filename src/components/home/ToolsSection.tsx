
import { Link } from "react-router-dom";
import { Calculator, ArrowRight, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

const ToolsSection = () => {
  return (
    <div className="mb-16">
      <div className="text-center mb-10">
        <h2 className="font-crimson text-3xl font-bold mb-4 text-gray-800">Tools for YouTube Creators</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Everything you need to research, plan, and grow your channel
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
            <Calculator className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-crimson text-xl font-bold mb-2">Earnings Calculator</h3>
          <p className="text-gray-600 mb-4">Estimate your YouTube revenue based on views and engagement</p>
          <Link to="/calculator" className="text-blue-600 font-medium flex items-center hover:underline">
            Try it now <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="rounded-full bg-green-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-crimson text-xl font-bold mb-2">Growth Analyzer</h3>
          <p className="text-gray-600 mb-4">Track and predict your subscriber growth over time</p>
          <Link to="/growth-calculator" className="text-blue-600 font-medium flex items-center hover:underline">
            Try it now <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="rounded-full bg-purple-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
            <DollarSign className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-crimson text-xl font-bold mb-2">Channel Valuation</h3>
          <p className="text-gray-600 mb-4">Estimate the market value of your YouTube channel</p>
          <Link to="/reach-calculator" className="text-blue-600 font-medium flex items-center hover:underline">
            Try it now <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <Link to="/calculators">
          <Button variant="outline" className="font-montserrat">
            View All Tools <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ToolsSection;
