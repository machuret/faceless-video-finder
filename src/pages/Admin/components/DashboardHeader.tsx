
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CSVUploader } from "@/components/youtube/CSVUploader";

interface DashboardHeaderProps {
  onLogout: () => void;
  onUploadSuccess: () => Promise<void>;
}

const DashboardHeader = ({ onLogout, onUploadSuccess }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={onLogout} variant="outline">Logout</Button>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={() => navigate("/admin/channels/new")}>
          <Plus className="mr-2" /> Add New Channel
        </Button>
        <CSVUploader onUploadSuccess={onUploadSuccess} />
      </div>
    </>
  );
};

export default DashboardHeader;
