
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorAlertProps {
  error: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error }) => {
  return (
    <Alert variant="destructive" className="mt-2">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="text-sm">{error}</AlertDescription>
    </Alert>
  );
};

interface PartialDataAlertProps {
  missingFields: string[];
}

export const PartialDataAlert: React.FC<PartialDataAlertProps> = ({ missingFields }) => {
  return (
    <Alert className="mt-2 border-yellow-500 bg-yellow-50">
      <AlertTitle className="text-yellow-600">Incomplete Data</AlertTitle>
      <AlertDescription className="text-sm">
        Missing fields: {missingFields.join(', ')}. You'll need to fill these in manually.
      </AlertDescription>
    </Alert>
  );
};

export const SuccessAlert: React.FC = () => {
  return (
    <Alert className="mt-2 border-green-500 bg-green-50">
      <AlertTitle className="text-green-600">Complete Data Retrieved</AlertTitle>
      <AlertDescription className="text-sm">
        All channel data was successfully scraped using Apify's YouTube scraper.
      </AlertDescription>
    </Alert>
  );
};

interface MultipleAttemptsAlertProps {
  attemptsCount: number;
}

export const MultipleAttemptsAlert: React.FC<MultipleAttemptsAlertProps> = ({ attemptsCount }) => {
  if (attemptsCount < 2) return null;
  
  return (
    <Alert className="mt-2 border-blue-500 bg-blue-50">
      <AlertTitle className="text-blue-600">Multiple Fetch Attempts</AlertTitle>
      <AlertDescription className="text-sm">
        Consider entering the missing data manually if automated fetching continues to fail.
      </AlertDescription>
    </Alert>
  );
};
