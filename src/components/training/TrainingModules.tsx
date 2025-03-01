
import React from "react";
import { Compass, BookOpen, GraduationCap, Award } from "lucide-react";
import TrainingModule, { TrainingModuleProps } from "./TrainingModule";

const TrainingModules: React.FC = () => {
  const trainingModules: TrainingModuleProps[] = [
    {
      title: "Getting Started with Faceless YouTube",
      description: "Learn the fundamentals of creating and growing a successful faceless YouTube channel.",
      icon: <Compass className="h-10 w-10 text-blue-500" />,
      lessons: ["Channel Niche Selection", "Setting Up Your Channel", "Content Planning Basics"],
      duration: "2 hours",
      level: "Beginner",
      link: "/how-it-works" // Link to relevant page
    },
    {
      title: "Content Creation Masterclass",
      description: "Deep dive into creating high-quality content that engages viewers and generates views.",
      icon: <BookOpen className="h-10 w-10 text-green-500" />,
      lessons: ["Scriptwriting for Faceless Channels", "Visual Design Principles", "Voice-over Techniques"],
      duration: "3 hours",
      level: "Intermediate",
      link: "/channel-types" // Link to relevant page
    },
    {
      title: "Growth Strategies",
      description: "Proven strategies to grow your subscriber base and increase channel visibility.",
      icon: <GraduationCap className="h-10 w-10 text-purple-500" />,
      lessons: ["YouTube Algorithm Optimization", "Effective Titles & Thumbnails", "Community Engagement"],
      duration: "2.5 hours",
      level: "Intermediate",
      link: "/growth-calculator" // Link to relevant page
    },
    {
      title: "Monetization Techniques",
      description: "Learn various methods to monetize your channel beyond AdSense revenue.",
      icon: <Award className="h-10 w-10 text-yellow-500" />,
      lessons: ["AdSense Optimization", "Sponsorship Strategies", "Product Creation & Sales"],
      duration: "2 hours",
      level: "Advanced",
      link: "/channel-earnings" // Link to relevant page
    }
  ];

  return (
    <div>
      <h2 className="text-3xl font-crimson font-bold text-center mb-10">Training Modules</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {trainingModules.map((module, index) => (
          <TrainingModule key={index} {...module} />
        ))}
      </div>
    </div>
  );
};

export default TrainingModules;
