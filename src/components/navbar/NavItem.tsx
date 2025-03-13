
import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavItemProps {
  to: string;
  isActive: boolean;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  isMobile?: boolean;
  isExternal?: boolean;
}

const NavItem = ({ to, isActive, icon, label, onClick, isMobile = false, isExternal = false }: NavItemProps) => {
  const location = useLocation();
  
  // Extra check to ensure active state works correctly
  const checkIsActive = () => {
    if (isActive) return true;
    
    // Special handling for faceless channel ideas
    if (label === "Ideas" && 
        (location.pathname === "/faceless-channel-ideas" || 
         location.pathname.startsWith("/faceless-channel-ideas/"))) {
      return true;
    }
    
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };
  
  const isActiveState = checkIsActive();
  
  const commonClasses = isMobile
    ? `block py-2 px-3 rounded-md ${isActiveState ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`
    : `font-montserrat text-xl font-medium flex items-center gap-1.5 ${isActiveState ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'} transition-colors`;

  if (isExternal) {
    return (
      <a 
        href={to} 
        className={commonClasses}
        onClick={onClick}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="flex items-center">
          {icon}
          <span>{label}</span>
        </div>
      </a>
    );
  }

  if (isMobile) {
    return (
      <Link 
        to={to} 
        className={commonClasses}
        onClick={onClick}
      >
        <div className="flex items-center">
          {icon}
          <span>{label}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={to} 
      className={commonClasses}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default NavItem;
