
import NavItem from "./NavItem";
import { navigationItems, isIdeasActive, isAdminActive } from "./navConfig";

interface DesktopNavProps {
  isActive: (path: string) => boolean;
}

const DesktopNav = ({ isActive }: DesktopNavProps) => {
  return (
    <nav className="hidden md:flex items-center gap-6">
      {navigationItems.map(item => (
        <NavItem 
          key={item.label}
          to={item.path} 
          isActive={
            item.label === "Ideas" ? isIdeasActive(location.pathname) : 
            item.label === "Admin" ? isAdminActive(location.pathname) :
            isActive(item.path)
          } 
          icon={item.icon} 
          label={item.label} 
        />
      ))}
    </nav>
  );
};

export default DesktopNav;
