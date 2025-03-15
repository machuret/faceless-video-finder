
import { useLocation } from "react-router-dom";
import NavItem from "./NavItem";
import { getNavigationItems, isIdeasActive, isAdminActive, isNichesActive, isAuthActive } from "./navConfig";

interface DesktopNavProps {
  isActive: (path: string) => boolean;
}

const DesktopNav = ({ isActive }: DesktopNavProps) => {
  const location = useLocation();
  const navigationItems = getNavigationItems();
  
  return (
    <nav className="hidden md:flex items-center gap-6">
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
          icon={item.icon} 
          label={item.label} 
          isExternal={item.isExternal}
        />
      ))}
    </nav>
  );
};

export default DesktopNav;
