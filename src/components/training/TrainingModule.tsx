
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export interface TrainingModuleProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  lessons: string[];
  duration: string;
  level: string;
  link: string;
}

const TrainingModule: React.FC<TrainingModuleProps> = ({
  title,
  description,
  icon,
  lessons,
  duration,
  level,
  link
}) => {
  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <div className="p-2">{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-2">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">KEY LESSONS</span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{level}</span>
          </div>
          <ul className="space-y-1">
            {lessons.map((lesson, idx) => (
              <li key={idx} className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                <span>{lesson}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500 flex items-center">
              <CalendarDays className="h-4 w-4 mr-1" /> {duration}
            </span>
            <Link to={link}>
              <Button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
                Start Module
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainingModule;
