
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface EmptyStateProps {
  isAdmin: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ isAdmin }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="p-6 text-center">
      <p className="text-gray-500 mb-4">No channels found in the database.</p>
      {isAdmin && (
        <Button variant="outline" onClick={() => navigate("/admin/add-channel")}>
          Add Your First Channel
        </Button>
      )}
    </Card>
  );
};
