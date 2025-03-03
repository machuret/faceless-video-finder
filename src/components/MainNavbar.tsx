
import { Home, BookOpen, Mail, HelpCircle, GraduationCap, Info, Calculator, Menu, X, Video, Lightbulb, GridIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const MainNavbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Video className="h-6 w-6 text-blue-600" />
            <span className="font-crimson text-2xl font-bold text-gray-900">Faceless Finder</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={`font-montserrat text-sm font-medium flex items-center gap-1.5 ${isActive('/') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'} transition-colors`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link 
              to="/about" 
              className={`font-montserrat text-sm font-medium flex items-center gap-1.5 ${isActive('/about') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'} transition-colors`}
            >
              <Info className="h-4 w-4" />
              <span>About Us</span>
            </Link>
            <Link 
              to="/calculators" 
              className={`font-montserrat text-sm font-medium flex items-center gap-1.5 ${isActive('/calculators') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'} transition-colors`}
            >
              <Calculator className="h-4 w-4" />
              <span>Calculator</span>
            </Link>
            <Link 
              to="/" 
              className={`font-montserrat text-sm font-medium flex items-center gap-1.5 ${isActive('/channels') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'} transition-colors`}
            >
              <GridIcon className="h-4 w-4" />
              <span>Channels</span>
            </Link>
            <Link 
              to="/faceless-channels" 
              className={`font-montserrat text-sm font-medium flex items-center gap-1.5 ${isActive('/faceless-channels') || isActive('/faceless-channel-ideas') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'} transition-colors`}
            >
              <Lightbulb className="h-4 w-4" />
              <span>Ideas</span>
            </Link>
            <Link 
              to="/channel-types" 
              className={`font-montserrat text-sm font-medium flex items-center gap-1.5 ${isActive('/channel-types') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'} transition-colors`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Types</span>
            </Link>
            <Link 
              to="/training" 
              className={`font-montserrat text-sm font-medium flex items-center gap-1.5 ${isActive('/training') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'} transition-colors`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Training</span>
            </Link>
            <Link 
              to="/contact" 
              className={`font-montserrat text-sm font-medium flex items-center gap-1.5 ${isActive('/contact') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'} transition-colors`}
            >
              <Mail className="h-4 w-4" />
              <span>Contact Us</span>
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/admin" 
              className="hidden md:block font-montserrat text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Admin
            </Link>
            
            <button className="md:hidden text-gray-700" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b shadow-md">
          <div className="px-4 py-3 space-y-1">
            <Link 
              to="/" 
              className={`block py-2 px-3 rounded-md ${isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
              onClick={toggleMobileMenu}
            >
              <div className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                <span>Home</span>
              </div>
            </Link>
            <Link 
              to="/about" 
              className={`block py-2 px-3 rounded-md ${isActive('/about') ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
              onClick={toggleMobileMenu}
            >
              <div className="flex items-center">
                <Info className="h-5 w-5 mr-2" />
                <span>About Us</span>
              </div>
            </Link>
            <Link 
              to="/calculators" 
              className={`block py-2 px-3 rounded-md ${isActive('/calculators') ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
              onClick={toggleMobileMenu}
            >
              <div className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                <span>Calculator</span>
              </div>
            </Link>
            <Link 
              to="/" 
              className={`block py-2 px-3 rounded-md ${isActive('/channels') ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
              onClick={toggleMobileMenu}
            >
              <div className="flex items-center">
                <GridIcon className="h-5 w-5 mr-2" />
                <span>Channels</span>
              </div>
            </Link>
            <Link 
              to="/faceless-channels" 
              className={`block py-2 px-3 rounded-md ${isActive('/faceless-channels') || isActive('/faceless-channel-ideas') ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
              onClick={toggleMobileMenu}
            >
              <div className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                <span>Ideas</span>
              </div>
            </Link>
            <Link 
              to="/channel-types" 
              className={`block py-2 px-3 rounded-md ${isActive('/channel-types') ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
              onClick={toggleMobileMenu}
            >
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                <span>Types</span>
              </div>
            </Link>
            <Link 
              to="/training" 
              className={`block py-2 px-3 rounded-md ${isActive('/training') ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
              onClick={toggleMobileMenu}
            >
              <div className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                <span>Training</span>
              </div>
            </Link>
            <Link 
              to="/contact" 
              className={`block py-2 px-3 rounded-md ${isActive('/contact') ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
              onClick={toggleMobileMenu}
            >
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                <span>Contact Us</span>
              </div>
            </Link>
            <Link 
              to="/admin" 
              className="block py-2 px-3 mt-2 rounded-md bg-blue-600 text-white"
              onClick={toggleMobileMenu}
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainNavbar;
