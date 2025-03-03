
import { Home, Info, Calculator, GridIcon, Lightbulb, BookOpen, GraduationCap, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import NavItem from "./NavItem";

interface MobileMenuProps {
  isOpen: boolean;
  isActive: (path: string) => boolean;
  onItemClick: () => void;
}

const MobileMenu = ({ isOpen, isActive, onItemClick }: MobileMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-white border-b shadow-md">
      <div className="px-4 py-3 space-y-1">
        <NavItem 
          to="/" 
          isActive={isActive('/')} 
          icon={<Home className="h-5 w-5 mr-2" />} 
          label="Home" 
          onClick={onItemClick}
          isMobile={true}
        />
        <NavItem 
          to="/about" 
          isActive={isActive('/about')} 
          icon={<Info className="h-5 w-5 mr-2" />} 
          label="About Us" 
          onClick={onItemClick}
          isMobile={true}
        />
        <NavItem 
          to="/calculators" 
          isActive={isActive('/calculators')} 
          icon={<Calculator className="h-5 w-5 mr-2" />} 
          label="Calculator" 
          onClick={onItemClick}
          isMobile={true}
        />
        <NavItem 
          to="/" 
          isActive={isActive('/channels')} 
          icon={<GridIcon className="h-5 w-5 mr-2" />} 
          label="Channels" 
          onClick={onItemClick}
          isMobile={true}
        />
        <NavItem 
          to="/faceless-channels" 
          isActive={isActive('/faceless-channels') || isActive('/faceless-channel-ideas')} 
          icon={<Lightbulb className="h-5 w-5 mr-2" />} 
          label="Ideas" 
          onClick={onItemClick}
          isMobile={true}
        />
        <NavItem 
          to="/channel-types" 
          isActive={isActive('/channel-types')} 
          icon={<BookOpen className="h-5 w-5 mr-2" />} 
          label="Types" 
          onClick={onItemClick}
          isMobile={true}
        />
        <NavItem 
          to="/training" 
          isActive={isActive('/training')} 
          icon={<GraduationCap className="h-5 w-5 mr-2" />} 
          label="Training" 
          onClick={onItemClick}
          isMobile={true}
        />
        <NavItem 
          to="/contact" 
          isActive={isActive('/contact')} 
          icon={<Mail className="h-5 w-5 mr-2" />} 
          label="Contact Us" 
          onClick={onItemClick}
          isMobile={true}
        />
        <Link 
          to="/admin" 
          className="block py-2 px-3 mt-2 rounded-md bg-blue-600 text-white"
          onClick={onItemClick}
        >
          Admin
        </Link>
      </div>
    </div>
  );
};

export default MobileMenu;
