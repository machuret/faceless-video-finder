
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, DollarSign, BarChart } from "lucide-react";

const YouTubeTools = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="font-crimson text-2xl font-bold mb-4 text-gray-800">YouTube Creator Tools</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <Link to="/calculator">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-crimson text-lg font-semibold">YouTube Shorts Calculator</h3>
                <p className="text-gray-600 font-lato text-sm">Estimate your potential earnings from YouTube Shorts</p>
              </div>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <Link to="/channel-earnings">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-crimson text-lg font-semibold">Channel Earnings Estimator</h3>
                <p className="text-gray-600 font-lato text-sm">Calculate estimated earnings for any YouTube channel</p>
              </div>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <Link to="/reach-calculator">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <BarChart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-crimson text-lg font-semibold">Reach Calculator</h3>
                <p className="text-gray-600 font-lato text-sm">Estimate the ad value of your YouTube content</p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default YouTubeTools;
