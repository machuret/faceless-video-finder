import { Home, Calculator, Lightbulb, Layers, GraduationCap, HelpCircle, Users, Settings } from "lucide-react";
import { matchPath } from "react-router-dom";

// Define navigation items
export const navigationItems = [
  {
    path: "/",
    icon: <Home className="h-4 w-4" />,
    label: "Home",
  },
  {
    path: "/calculators",
    icon: <Calculator className="h-4 w-4" />,
    label: "Calculators",
  },
  {
    path: "/faceless-ideas",
    icon: <Lightbulb className="h-4 w-4" />,
    label: "Ideas",
  },
  {
    path: "/channel-types",
    icon: <Layers className="h-4 w-4" />,
    label: "Channel Types",
  },
  {
    path: "https://facelesstraining.com/",
    icon: <GraduationCap className="h-4 w-4" />,
    label: "Training",
    isExternal: true,
  },
  {
    path: "/how-it-works",
    icon: <HelpCircle className="h-4 w-4" />,
    label: "How It Works",
  },
  {
    path: "/about-us",
    icon: <Users className="h-4 w-4" />,
    label: "About Us",
  },
];

// Function to check if "Ideas" is active
export const isIdeasActive = (pathname: string): boolean => {
  return !!matchPath({ path: "/faceless-ideas/*", end: false }, pathname) || pathname === '/faceless-ideas';
};

// Function to check if "Admin" is active
export const isAdminActive = (pathname: string): boolean => {
  return !!matchPath({ path: "/admin/*", end: false }, pathname) || pathname === '/admin';
};
