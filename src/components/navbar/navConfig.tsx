
import { Home, Search, Calculator, Lightbulb, Award, BarChart2, BookOpen } from "lucide-react";
import { useLocation } from "react-router-dom";

const navConfig = [
  {
    title: "Home",
    path: "/",
    icon: <Home className="h-[1.2rem] w-[1.2rem]" />,
  },
  {
    title: "Channels",
    path: "/channel-search",
    icon: <Search className="h-[1.2rem] w-[1.2rem]" />,
  },
  {
    title: "Channel Rankings",
    path: "/channel-rankings",
    icon: <BarChart2 className="h-[1.2rem] w-[1.2rem]" />,
  },
  {
    title: "Channel Types",
    path: "/channel-types",
    icon: <Award className="h-[1.2rem] w-[1.2rem]" />,
  },
  {
    title: "YouTube Ideas",
    path: "/faceless-ideas",
    icon: <Lightbulb className="h-[1.2rem] w-[1.2rem]" />,
  },
  {
    title: "Niches",
    path: "/niches",
    icon: <BookOpen className="h-[1.2rem] w-[1.2rem]" />,
  },
  {
    title: "Calculators",
    path: "/calculators",
    icon: <Calculator className="h-[1.2rem] w-[1.2rem]" />,
  },
];

// Create navigation items for the navbar
export const navigationItems = navConfig.map(item => ({
  path: item.path,
  label: item.title,
  icon: item.icon,
  isExternal: false,
}));

// Helper functions to check if certain sections are active
export const isIdeasActive = (pathname: string) => pathname.includes("/faceless-ideas");
export const isAdminActive = (pathname: string) => pathname.includes("/admin");
export const isNichesActive = (pathname: string) => pathname.includes("/niches");

export default navConfig;
