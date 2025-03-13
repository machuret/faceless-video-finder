
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import Logo from "./navbar/Logo";
import DesktopNav from "./navbar/DesktopNav";
import MobileMenu from "./navbar/MobileMenu";

const MainNavbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Logo />
          
          <DesktopNav isActive={isActive} />
          
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-700" onClick={toggleMobileMenu} aria-label="Toggle menu">
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        isActive={isActive} 
        onItemClick={closeMobileMenu} 
      />
    </div>
  );
};

export default MainNavbar;
