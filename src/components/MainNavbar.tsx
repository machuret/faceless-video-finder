
import { Home, BookOpen, Mail, HelpCircle, GraduationCap, Info, Calculator } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const MainNavbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Home className="h-6 w-6 text-blue-600" />
            <span className="font-crimson text-2xl font-bold text-gray-900">YT Channel Explorer</span>
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
              to="/calculator" 
              className={`font-montserrat text-sm font-medium flex items-center gap-1.5 ${isActive('/calculator') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'} transition-colors`}
            >
              <Calculator className="h-4 w-4" />
              <span>Shorts Calculator</span>
            </Link>
            <Link 
              to="/about" 
              className={`font-montserrat text-sm font-medium flex items-center gap-1.5 ${isActive('/about') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'} transition-colors`}
            >
              <Info className="h-4 w-4" />
              <span>About Us</span>
            </Link>
            <Link 
              to="/how-it-works" 
              className={`font-montserrat text-sm font-medium flex items-center gap-1.5 ${isActive('/how-it-works') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'} transition-colors`}
            >
              <HelpCircle className="h-4 w-4" />
              <span>How This Works</span>
            </Link>
            <Link 
              to="/training" 
              className={`font-montserrat text-sm font-medium flex items-center gap-1.5 ${isActive('/training') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'} transition-colors`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Training</span>
            </Link>
            <Link 
              to="/channel-types" 
              className={`font-montserrat text-sm font-medium flex items-center gap-1.5 ${isActive('/channel-types') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'} transition-colors`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Channel Types</span>
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
              to="/admin/login" 
              className="font-montserrat text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainNavbar;
