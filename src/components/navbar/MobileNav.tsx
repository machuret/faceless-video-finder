
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { useMobileMenu } from "@/hooks/use-mobile-menu";
import { NavItem } from '@/components/navbar/types';

interface MobileNavProps {
  navItems: NavItem[];
}

export function MobileNav({ navItems }: MobileNavProps) {
  const { isOpen, onOpen, onClose } = useMobileMenu();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="flex md:hidden p-0">
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
          <span className="sr-only">Open main menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            {/* Add a description or additional content here if needed */}
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-6">
            <div className="space-y-2 col-span-4">
              {navItems.map((item) => (
                <Link key={item.title} to={item.href} onClick={onClose}>
                  <Button variant="ghost" className="w-full">{item.title}</Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
