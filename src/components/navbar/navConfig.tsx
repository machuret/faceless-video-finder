
import { Home, Search, Calculator, Lightbulb, Award, BarChart2, BookOpen, User, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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

// Create a function to generate navigation items based on auth state
export const getNavigationItems = () => {
  const { user, isAdmin } = useAuth();
  
  const items = navConfig.map(item => ({
    path: item.path,
    label: item.title,
    icon: item.icon,
    isExternal: false,
  }));
  
  // Add auth-related items
  if (user) {
    // Add profile link for logged in users
    items.push({
      path: "/profile",
      label: "Profile",
      icon: <User className="h-[1.2rem] w-[1.2rem]" />,
      isExternal: false,
    });
    
    // Add admin links for admin users - moved to admin section, not in main nav
  } else {
    // Add login link for logged out users
    items.push({
      path: "/auth",
      label: "Login",
      icon: <User className="h-[1.2rem] w-[1.2rem]" />,
      isExternal: false,
    });
  }
  
  return items;
};

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
export const isAuthActive = (pathname: string) => pathname.includes("/auth") || pathname.includes("/profile");

export default navConfig;
