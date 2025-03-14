
import React from "react";
import NavItem from "./NavItem";
import { getNavigationItems, isIdeasActive, isAdminActive, isNichesActive, isAuthActive } from "./navConfig";
import { useLocation } from "react-router-dom";

interface MobileMenuProps {
  isOpen: boolean;
  isActive: (path: string) => boolean;
  onItemClick: () => void;
}

const MobileMenu = ({ isOpen, isActive, onItemClick }: MobileMenuProps) => {
  const location = useLocation();
  const navigationItems = getNavigationItems();
  
  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-white border-b shadow-md">
      <div className="px-4 py-3 space-y-1">
        {navigationItems.map(item => (
          <NavItem 
            key={item.label}
            to={item.path} 
            isActive={
              item.label === "YouTube Ideas" ? isIdeasActive(location.pathname) : 
              item.label === "User Management" ? isAdminActive(location.pathname) :
              item.label === "Niches" ? isNichesActive(location.pathname) :
              item.label === "Login" || item.label === "Profile" ? isAuthActive(location.pathname) :
              isActive(item.path)
            } 
            icon={React.cloneElement(item.icon as React.ReactElement, { className: "h-5 w-5 mr-2" })}
            label={item.label} 
            onClick={onItemClick}
            isMobile={true}
            isExternal={item.isExternal}
          />
        ))}
      </div>
    </div>
  );
};

export default MobileMenu;
