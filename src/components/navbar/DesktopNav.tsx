
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { NavItem } from '@/components/navbar/types';

interface DesktopNavProps {
  navItems: NavItem[];
}

export function DesktopNav({ navItems }: DesktopNavProps) {
  return (
    <nav className="hidden md:flex items-center space-x-6">
      {navItems?.length ? (
        navItems.map(
          (item, index) =>
            item.href ? (
              <Link
                key={index}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground/80 focus:outline-none focus:ring-2 focus:ring-foreground/30 disabled:opacity-50 data-[active=true]:text-foreground/80",
                  item.disabled && "cursor-not-allowed opacity-60"
                )}
              >
                {item.title}
              </Link>
            ) : null
        )
      ) : null}
    </nav>
  );
}
