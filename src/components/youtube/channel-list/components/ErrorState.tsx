
import React from "react";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <Card className="p-6 text-center">
      <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
      <p className="text-gray-700 mb-2 font-semibold">Error loading channels</p>
      <p className="text-gray-500 mb-4">{error}</p>
      <Button variant="outline" onClick={onRetry}>
        Try Again
      </Button>
    </Card>
  );
};
