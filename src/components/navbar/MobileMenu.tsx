
import React from "react";
import { Link } from "react-router-dom";
import NavItem from "./NavItem";
import { navigationItems, isIdeasActive } from "./navConfig";

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
        {navigationItems.map(item => (
          <NavItem 
            key={item.label}
            to={item.path} 
            isActive={item.label === "Ideas" ? isIdeasActive(location.pathname) : isActive(item.path)} 
            icon={React.cloneElement(item.icon as React.ReactElement, { className: "h-5 w-5 mr-2" })}
            label={item.label} 
            onClick={onItemClick}
            isMobile={true}
          />
        ))}
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
