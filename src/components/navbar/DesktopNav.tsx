
import { Home, Info, Calculator, GridIcon, Lightbulb, BookOpen, GraduationCap, Mail } from "lucide-react";
import NavItem from "./NavItem";

interface DesktopNavProps {
  isActive: (path: string) => boolean;
}

const DesktopNav = ({ isActive }: DesktopNavProps) => {
  return (
    <nav className="hidden md:flex items-center gap-6">
      <NavItem 
        to="/" 
        isActive={isActive('/')} 
        icon={<Home className="h-4 w-4" />} 
        label="Home" 
      />
      <NavItem 
        to="/about" 
        isActive={isActive('/about')} 
        icon={<Info className="h-4 w-4" />} 
        label="About Us" 
      />
      <NavItem 
        to="/calculators" 
        isActive={isActive('/calculators')} 
        icon={<Calculator className="h-4 w-4" />} 
        label="Calculator" 
      />
      <NavItem 
        to="/" 
        isActive={isActive('/channels')} 
        icon={<GridIcon className="h-4 w-4" />} 
        label="Channels" 
      />
      <NavItem 
        to="/faceless-channels" 
        isActive={isActive('/faceless-channels') || isActive('/faceless-channel-ideas')} 
        icon={<Lightbulb className="h-4 w-4" />} 
        label="Ideas" 
      />
      <NavItem 
        to="/channel-types" 
        isActive={isActive('/channel-types')} 
        icon={<BookOpen className="h-4 w-4" />} 
        label="Types" 
      />
      <NavItem 
        to="/training" 
        isActive={isActive('/training')} 
        icon={<GraduationCap className="h-4 w-4" />} 
        label="Training" 
      />
      <NavItem 
        to="/contact" 
        isActive={isActive('/contact')} 
        icon={<Mail className="h-4 w-4" />} 
        label="Contact Us" 
      />
    </nav>
  );
};

export default DesktopNav;
