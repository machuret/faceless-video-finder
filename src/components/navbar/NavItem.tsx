
import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface NavItemProps {
  to: string;
  isActive: boolean;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  isMobile?: boolean;
}

const NavItem = ({ to, isActive, icon, label, onClick, isMobile = false }: NavItemProps) => {
  if (isMobile) {
    return (
      <Link 
        to={to} 
        className={`block py-2 px-3 rounded-md ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
        onClick={onClick}
      >
        <div className="flex items-center">
          {icon}
          <span>{label}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={to} 
      className={`font-montserrat text-sm font-medium flex items-center gap-1.5 ${isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'} transition-colors`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default NavItem;
