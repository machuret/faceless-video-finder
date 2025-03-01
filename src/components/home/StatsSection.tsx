
import { Users, Video, DollarSign, TrendingUp } from "lucide-react";

const StatsSection = () => {
  return (
    <div className="bg-blue-800 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-crimson text-3xl font-bold">The Platform for YouTube Creators</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Users className="h-8 w-8 text-blue-300" />
            </div>
            <p className="text-3xl font-bold mb-1">2,500+</p>
            <p className="text-blue-200">Channel Ideas</p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Video className="h-8 w-8 text-blue-300" />
            </div>
            <p className="text-3xl font-bold mb-1">15+</p>
            <p className="text-blue-200">Niches</p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <DollarSign className="h-8 w-8 text-blue-300" />
            </div>
            <p className="text-3xl font-bold mb-1">$250K+</p>
            <p className="text-blue-200">Earnings Potential</p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <TrendingUp className="h-8 w-8 text-blue-300" />
            </div>
            <p className="text-3xl font-bold mb-1">10M+</p>
            <p className="text-blue-200">Views Analyzed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
