
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

const AdminHeader = ({ title, subtitle }: AdminHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 py-4 px-4 mb-6">
      <div className="container mx-auto flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/admin/dashboard")}
          className="mr-4"
          aria-label="Back to admin dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
