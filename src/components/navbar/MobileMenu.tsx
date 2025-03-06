
import React from "react";
import NavItem from "./NavItem";
import { navigationItems, isIdeasActive, isAdminActive } from "./navConfig";
import { useLocation } from "react-router-dom";

interface MobileMenuProps {
  isOpen: boolean;
  isActive: (path: string) => boolean;
  onItemClick: () => void;
}

const MobileMenu = ({ isOpen, isActive, onItemClick }: MobileMenuProps) => {
  const location = useLocation();
  
  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-white border-b shadow-md">
      <div className="px-4 py-3 space-y-1">
        {navigationItems.map(item => (
          <NavItem 
            key={item.label}
            to={item.path} 
            isActive={
              item.label === "Ideas" ? isIdeasActive(location.pathname) : 
              item.label === "Admin" ? isAdminActive(location.pathname) :
              isActive(item.path)
            } 
            icon={React.cloneElement(item.icon as React.ReactElement, { className: "h-5 w-5 mr-2" })}
            label={item.label} 
            onClick={onItemClick}
            isMobile={true}
          />
        ))}
      </div>
    </div>
  );
};

export default MobileMenu;
