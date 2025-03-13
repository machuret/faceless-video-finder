
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCcw } from "lucide-react";

interface IdeasErrorStateProps {
  error: Error;
  retryType: string;
  retryCount: number;
  onRetry: () => void;
}

const IdeasErrorState = ({ 
  error, 
  retryType, 
  retryCount, 
  onRetry 
}: IdeasErrorStateProps) => {
  let errorMessage = error.message;
  let errorTitle = "Error loading ideas";
  let errorClass = "bg-red-50 border-red-200";
  
  if (retryType === 'network') {
    errorTitle = "Network Connection Error";
    errorClass = "bg-yellow-50 border-yellow-200";
  } else if (retryType === 'server') {
    errorTitle = "Server Error";
  } else if (retryType === 'validation') {
    errorTitle = "Invalid Request";
    errorClass = "bg-amber-50 border-amber-200";
  }
  
  return (
    <Card className={`p-6 ${errorClass} mb-8 border`}>
      <h3 className="font-semibold text-red-700 mb-2">{errorTitle}</h3>
      <p className="text-red-600 mb-4">{errorMessage}</p>
      {retryCount > 0 && (
        <p className="text-sm text-gray-600 mb-4">
          Attempted {retryCount} retries
        </p>
      )}
      <Button onClick={onRetry} variant="secondary">
        <RefreshCcw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </Card>
  );
};

export default IdeasErrorState;
