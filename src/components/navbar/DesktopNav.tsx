
import { useLocation } from "react-router-dom";
import NavItem from "./NavItem";
import { navigationItems, isIdeasActive, isAdminActive, isNichesActive } from "./navConfig";

interface DesktopNavProps {
  isActive: (path: string) => boolean;
}

const DesktopNav = ({ isActive }: DesktopNavProps) => {
  const location = useLocation();
  
  return (
    <nav className="hidden md:flex items-center gap-6">
      {navigationItems.map(item => (
        <NavItem 
          key={item.label}
          to={item.path} 
          isActive={
            item.label === "Ideas" ? isIdeasActive(location.pathname) : 
            item.label === "Admin" ? isAdminActive(location.pathname) :
            item.label === "Niches" ? isNichesActive(location.pathname) :
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
