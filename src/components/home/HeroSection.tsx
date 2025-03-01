
import { Link } from "react-router-dom";
import { Calculator, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
          <Link to="/calculators">
            <Button className="bg-white text-blue-700 hover:bg-gray-100 px-6 py-6 rounded-lg text-lg font-medium flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Explore Creator Tools
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
