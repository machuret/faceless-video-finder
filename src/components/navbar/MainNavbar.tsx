
import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { DesktopNav } from './DesktopNav';
import { MobileNav } from './MobileNav';
import { UserNavMenu } from './UserNavMenu';
import { navConfig } from './config';

export default function MainNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className={`w-full py-2 md:py-4 border-b border-border fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled ? 'bg-background/95 backdrop-blur-sm shadow-sm' : 'bg-background'
      }`}
    >
      <div className="container flex items-center justify-between">
        <Logo />

        <div className="hidden md:flex items-center">
          <DesktopNav navItems={navConfig.mainNavItems} />
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex">
            <UserNavMenu />
          </div>
          <MobileNav navItems={navConfig.mainNavItems} />
        </div>
      </div>
    </header>
  );
}
