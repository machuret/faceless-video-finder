
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface ChannelFormContainerProps {
  title: string;
  children: React.ReactNode;
}

const ChannelFormContainer = ({ title, children }: ChannelFormContainerProps) => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  
  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please log in to access this page");
      navigate("/admin/login");
      return;
    }

    if (!authLoading && !isAdmin) {
      toast.error("You don't have permission to access this page");
      navigate("/");
      return;
    }
  }, [user, isAdmin, authLoading, navigate]);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{title}</CardTitle>
              <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChannelFormContainer;
