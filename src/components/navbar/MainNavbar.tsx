
import React from 'react';
import { Logo } from './Logo';
import { DesktopNav } from './DesktopNav';
import { MobileNav } from './MobileNav';
import { UserNavMenu } from './UserNavMenu';
import { navConfig } from './config';

export default function MainNavbar() {
  return (
    <header className="w-full py-2 md:py-4 border-b border-border">
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
