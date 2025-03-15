
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import Logo from "./navbar/Logo";
import DesktopNav from "./navbar/DesktopNav";
import MobileMenu from "./navbar/MobileMenu";
import AccountDropdown from "./navbar/AccountDropdown";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const MainNavbar = () => {
  const location = useLocation();
  const isActivePath = (path: string) => location.pathname === path;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Logo />
          
          <DesktopNav isActive={isActivePath} />
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <AccountDropdown />
          ) : (
            <Button asChild variant="default" size="sm">
              <Link to="/auth">Login</Link>
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
      
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        isActive={isActivePath} 
        onItemClick={closeMobileMenu} 
      />
    </header>
  );
};

export default MainNavbar;
