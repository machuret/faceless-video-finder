
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
      </div>
    </div>
  );
};

export default HeroSection;
