
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      <div className="container mx-auto px-4 max-w-5xl text-center">
        <h1 className="font-crimson text-5xl md:text-6xl font-bold mb-6">
          Discover and grow your<br />
          <span className="text-yellow-300">faceless YouTube channel</span>
        </h1>
        <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
          Find trending niches, estimate earnings, and analyze growth potential
          all in one place. Start your faceless YouTube journey today.
        </p>
        <div className="flex justify-center mb-6">
          <div className="relative w-full max-w-xl">
            <Input 
              type="text" 
              placeholder="Search for niches, channels, or keywords..." 
              className="py-6 pr-12 pl-4 rounded-lg text-black border-2 border-white focus:border-yellow-300"
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
