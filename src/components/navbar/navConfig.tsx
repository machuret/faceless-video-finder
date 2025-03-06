
import { 
  Home, 
  Info, 
  Calculator, 
  GridIcon, 
  Lightbulb, 
  BookOpen, 
  GraduationCap, 
  Mail,
  Settings
} from "lucide-react";
import { ReactNode } from "react";

export interface NavItemConfig {
  path: string;
  label: string;
  icon: ReactNode;
}

export const navigationItems: NavItemConfig[] = [
  {
    path: "/",
    label: "Home",
    icon: <Home className="h-4 w-4" />
  },
  {
    path: "/about",
    label: "About Us",
    icon: <Info className="h-4 w-4" />
  },
  {
    path: "/calculators",
    label: "Calculator",
    icon: <Calculator className="h-4 w-4" />
  },
  {
    path: "/",
    label: "Channels",
    icon: <GridIcon className="h-4 w-4" />
  },
  {
    path: "/faceless-channels",
    label: "Ideas",
    icon: <Lightbulb className="h-4 w-4" />
  },
  {
    path: "/channel-types",
    label: "Types",
    icon: <BookOpen className="h-4 w-4" />
  },
  {
    path: "/training",
    label: "Training",
    icon: <GraduationCap className="h-4 w-4" />
  },
  {
    path: "/contact",
    label: "Contact Us",
    icon: <Mail className="h-4 w-4" />
  },
  {
    path: "/admin/dashboard",
    label: "Admin",
    icon: <Settings className="h-4 w-4" />
  }
];

// Special case handling for Ideas menu item
export const isIdeasActive = (path: string): boolean => {
  return path === '/faceless-channels' || path === '/faceless-channel-ideas';
};

// Special case handling for Admin menu item
export const isAdminActive = (path: string): boolean => {
  return path.startsWith('/admin');
};
