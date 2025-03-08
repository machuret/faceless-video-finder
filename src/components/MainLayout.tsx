
import React from "react";
import MainNavbar from "./MainNavbar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNavbar />
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} TubeFacts. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
