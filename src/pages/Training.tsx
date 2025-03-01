
import React from "react";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Compass, GraduationCap, BookOpen, Play, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const TrainingPage = () => {
  const trainingModules = [
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
            <div className="mt-8">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold">
                <Link to={trainingModules[0].link}>
                  Start Free Training
                </Link>
              </Button>
            </div>
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
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">KEY LESSONS</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{module.level}</span>
                    </div>
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
                      <Link to={module.link}>
                        <Button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
                          Start Module
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Learning Path Section */}
          <div className="mt-16 mb-12 max-w-4xl mx-auto">
            <h2 className="text-3xl font-crimson font-bold text-center mb-8">Your Learning Path</h2>
            <div className="relative">
              {/* Timeline */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200"></div>
              
              {/* Timeline Steps */}
              <div className="space-y-12 relative">
                {/* Step 1 */}
                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-1/2 md:pr-8 md:text-right order-2 md:order-1">
                    <h3 className="text-xl font-semibold mb-2">1. Channel Foundation</h3>
                    <p className="text-gray-600">Learn how to set up your channel for success from day one.</p>
                  </div>
                  <div className="z-10 flex-shrink-0 order-1 md:order-2 mb-4 md:mb-0">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white font-bold">1</span>
                    </div>
                  </div>
                </div>
                
                {/* Step 2 */}
                <div className="flex flex-col md:flex-row items-center">
                  <div className="z-10 flex-shrink-0 order-1 mb-4 md:mb-0">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white font-bold">2</span>
                    </div>
                  </div>
                  <div className="md:w-1/2 md:pl-8 order-2">
                    <h3 className="text-xl font-semibold mb-2">2. Content Creation</h3>
                    <p className="text-gray-600">Master the art of creating engaging, high-quality content.</p>
                  </div>
                </div>
                
                {/* Step 3 */}
                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-1/2 md:pr-8 md:text-right order-2 md:order-1">
                    <h3 className="text-xl font-semibold mb-2">3. Growth & Optimization</h3>
                    <p className="text-gray-600">Learn strategies to grow your audience and optimize for the algorithm.</p>
                  </div>
                  <div className="z-10 flex-shrink-0 order-1 md:order-2 mb-4 md:mb-0">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                      <span className="text-white font-bold">3</span>
                    </div>
                  </div>
                </div>
                
                {/* Step 4 */}
                <div className="flex flex-col md:flex-row items-center">
                  <div className="z-10 flex-shrink-0 order-1 mb-4 md:mb-0">
                    <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                      <span className="text-white font-bold">4</span>
                    </div>
                  </div>
                  <div className="md:w-1/2 md:pl-8 order-2">
                    <h3 className="text-xl font-semibold mb-2">4. Monetization</h3>
                    <p className="text-gray-600">Turn your channel into a profitable business with multiple revenue streams.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Testimonials Section */}
          <div className="my-16 max-w-5xl mx-auto">
            <h2 className="text-3xl font-crimson font-bold text-center mb-10">Success Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white shadow-md">
                <CardContent className="p-6">
                  <p className="italic text-gray-600 mb-4">
                    "This training program helped me go from 0 to 50,000 subscribers in just 6 months. The strategies for faceless YouTube channels were exactly what I needed."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-600 font-semibold">JM</div>
                    <div className="ml-3">
                      <p className="font-semibold">John M.</p>
                      <p className="text-sm text-gray-500">Finance Channel Owner</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-md">
                <CardContent className="p-6">
                  <p className="italic text-gray-600 mb-4">
                    "The monetization techniques alone were worth the investment. I've been able to quit my full-time job and focus entirely on my YouTube business."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center text-green-600 font-semibold">SK</div>
                    <div className="ml-3">
                      <p className="font-semibold">Sarah K.</p>
                      <p className="text-sm text-gray-500">Lifestyle Content Creator</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="mt-16 mb-8 max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-semibold mb-4">Ready to grow your YouTube channel?</h3>
            <p className="text-gray-600 mb-8">
              Start your journey to YouTube success today with our comprehensive training program.
              Learn at your own pace and implement proven strategies for channel growth.
            </p>
            <Link to="/calculators">
              <Button size="lg" className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition-colors">
                Explore All Calculators
              </Button>
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              Want to see channel examples? <Link to="/" className="text-blue-600 hover:underline">Browse examples</Link>
            </p>
          </div>
        </div>
      </main>
      
      <PageFooter />
    </div>
  );
};

export default TrainingPage;
