
import React from "react";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import TrainingHero from "@/components/training/TrainingHero";
import TrainingOverview from "@/components/training/TrainingOverview";
import TrainingModules from "@/components/training/TrainingModules";
import LearningPath from "@/components/training/LearningPath";
import TestimonialsSection from "@/components/training/TestimonialsSection";
import CallToAction from "@/components/training/CallToAction";

const TrainingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <main>
        {/* Hero Section - Using external link to facelesstraining.com */}
        <TrainingHero startLink="https://facelesstraining.com/" />
        
        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Overview Section */}
          <TrainingOverview />
          
          {/* Training Modules */}
          <TrainingModules />
          
          {/* Learning Path */}
          <LearningPath />
          
          {/* Testimonials Section */}
          <TestimonialsSection />
          
          {/* Call to Action */}
          <CallToAction />
        </div>
      </main>
      
      <PageFooter />
    </div>
  );
};

export default TrainingPage;
