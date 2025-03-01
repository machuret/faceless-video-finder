
import React from "react";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Compass, GraduationCap, BookOpen, Play, Certificate } from "lucide-react";

const TrainingPage = () => {
  const trainingModules = [
    {
      title: "Getting Started with Faceless YouTube",
      description: "Learn the fundamentals of creating and growing a successful faceless YouTube channel.",
      icon: <Compass className="h-10 w-10 text-blue-500" />,
      lessons: ["Channel Niche Selection", "Setting Up Your Channel", "Content Planning Basics"],
      duration: "2 hours"
    },
    {
      title: "Content Creation Masterclass",
      description: "Deep dive into creating high-quality content that engages viewers and generates views.",
      icon: <BookOpen className="h-10 w-10 text-green-500" />,
      lessons: ["Scriptwriting for Faceless Channels", "Visual Design Principles", "Voice-over Techniques"],
      duration: "3 hours"
    },
    {
      title: "Growth Strategies",
      description: "Proven strategies to grow your subscriber base and increase channel visibility.",
      icon: <GraduationCap className="h-10 w-10 text-purple-500" />,
      lessons: ["YouTube Algorithm Optimization", "Effective Titles & Thumbnails", "Community Engagement"],
      duration: "2.5 hours"
    },
    {
      title: "Monetization Techniques",
      description: "Learn various methods to monetize your channel beyond AdSense revenue.",
      icon: <Certificate className="h-10 w-10 text-yellow-500" />,
      lessons: ["AdSense Optimization", "Sponsorship Strategies", "Product Creation & Sales"],
      duration: "2 hours"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <main>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-crimson text-4xl md:text-5xl font-bold mb-4">YouTube Channel Training</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Comprehensive training materials to help you create, grow, and monetize your faceless YouTube channel
            </p>
          </div>
        </div>
        
        {/* Overview Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Card className="mb-12">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center gap-6 p-4">
                  <div className="bg-blue-100 p-6 rounded-full">
                    <GraduationCap className="h-12 w-12 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Training Program Overview</h2>
                    <p className="text-gray-600 mb-4">
                      Our comprehensive training program is designed to take you from complete beginner to successful YouTube channel owner.
                      With step-by-step guidance, practical examples, and proven strategies, you'll learn everything you need to know
                      about creating and growing a profitable faceless YouTube channel.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center">
                        <Play className="h-5 w-5 text-blue-500 mr-2" />
                        <span>20+ Video Lessons</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
                        <span>Downloadable Resources</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarDays className="h-5 w-5 text-blue-500 mr-2" />
                        <span>10 Hours of Content</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Training Modules */}
          <h2 className="text-3xl font-crimson font-bold text-center mb-10">Training Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {trainingModules.map((module, index) => (
              <Card key={index} className="transition-all hover:shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-semibold">{module.title}</CardTitle>
                      <CardDescription className="mt-1">{module.description}</CardDescription>
                    </div>
                    <div className="p-2">{module.icon}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">KEY LESSONS</h4>
                    <ul className="space-y-1">
                      {module.lessons.map((lesson, idx) => (
                        <li key={idx} className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          <span>{lesson}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm text-gray-500 flex items-center">
                        <CalendarDays className="h-4 w-4 mr-1" /> {module.duration}
                      </span>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors">
                        Start Module
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Call to Action */}
          <div className="mt-16 mb-8 max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-semibold mb-4">Ready to grow your YouTube channel?</h3>
            <p className="text-gray-600 mb-8">
              Start your journey to YouTube success today with our comprehensive training program.
              Learn at your own pace and implement proven strategies for channel growth.
            </p>
            <button className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition-colors">
              Enroll in Full Program
            </button>
          </div>
        </div>
      </main>
      
      <PageFooter />
    </div>
  );
};

export default TrainingPage;
