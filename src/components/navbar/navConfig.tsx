
import { Home, Search, Calculator, Lightbulb, Award, BarChart2, BookOpen } from "lucide-react";

const navConfig = [
  {
    title: "Home",
    path: "/",
    icon: <Home className="h-[1.2rem] w-[1.2rem]" />,
  },
  {
    title: "Search Channels",
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

export default navConfig;
