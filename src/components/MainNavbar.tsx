import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, X, User, UserCircle, Shield, LogOut } from "lucide-react"
import { siteConfig } from "@/config/site"
import { useMobileMenu } from "@/hooks/use-mobile-menu"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth/AuthContext";

function Logo() {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <span className="inline-block font-bold text-2xl">{siteConfig.name}</span>
    </Link>
  )
}

interface DesktopNavProps {
  navItems: {
    title: string
    href: string
    disabled?: boolean
  }[]
}

function DesktopNav({ navItems }: DesktopNavProps) {
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
  )
}

interface MobileMenuProps {
  navItems: {
    title: string
    href: string
    disabled?: boolean
  }[]
}

function MobileMenu({ navItems }: MobileMenuProps) {
  const { isOpen, onOpen, onClose } = useMobileMenu()

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
  )
}

const mainNavItems = [
  {
    title: "Channels",
    href: "/channels",
  },
  {
    title: "Calculators",
    href: "/calculators",
  },
  {
    title: "How it works",
    href: "/how-it-works",
  },
  {
    title: "Training",
    href: "/training",
  },
  {
    title: "About",
    href: "/about",
  },
]

export default function MainNavbar() {
  return (
    <header className="w-full py-2 md:py-4 border-b border-border">
      <div className="container flex items-center justify-between">
        <Logo />

        <div className="hidden md:flex items-center">
          <DesktopNav navItems={mainNavItems} />
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex">
            <UserNavLinks />
          </div>
          <MobileMenu navItems={mainNavItems} />
        </div>
      </div>
    </header>
  );
}

function UserNavLinks() {
  const { user, isAdmin, signOut } = useAuth();
  
  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link to="/auth/login">Sign In</Link>
        </Button>
        <Button asChild>
          <Link to="/auth/register">Sign Up</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden md:inline">Account</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <UserCircle className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin/dashboard">
              <Shield className="mr-2 h-4 w-4" />
              Admin Dashboard
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
