
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Play, BookOpen, CalendarDays } from "lucide-react";

const TrainingOverview: React.FC = () => {
  return (
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
  );
};

export default TrainingOverview;
