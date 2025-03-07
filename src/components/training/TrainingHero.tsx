
import React from "react";
import { Button } from "@/components/ui/button";

interface TrainingHeroProps {
  startLink: string;
}

const TrainingHero: React.FC<TrainingHeroProps> = ({ startLink }) => {
  const handleTrainingClick = () => {
    window.location.href = "https://facelesstraining.com/";
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="font-crimson text-4xl md:text-5xl font-bold mb-4">YouTube Channel Training</h1>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
          Comprehensive training materials to help you create, grow, and monetize your faceless YouTube channel
        </p>
        <div className="mt-8">
          <a 
            href="https://facelesstraining.com/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button 
              size="lg" 
              className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold"
            >
              Start Free Training
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TrainingHero;
