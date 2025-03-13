
import { Link } from "react-router-dom";
import { Video } from "lucide-react";

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2">
      <Video className="h-6 w-6 text-blue-600" />
      <span className="font-crimson text-2xl font-bold text-gray-900">Faceless Finder</span>
    </Link>
  );
};

export default Logo;
