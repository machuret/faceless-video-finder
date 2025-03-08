
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info, CheckCircle2, RefreshCw } from "lucide-react";

export const ErrorAlert = ({ error }: { error: string }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error fetching stats</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
  </Alert>
);

export const PartialDataAlert = ({ missingFields }: { missingFields: string[] }) => (
  <Alert variant="default" className="border-orange-200 bg-orange-50">
    <Info className="h-4 w-4 text-orange-600" />
    <AlertTitle className="text-orange-800">Partial data received</AlertTitle>
    <AlertDescription className="text-orange-700">
      Some fields could not be fetched: {missingFields.join(', ')}
    </AlertDescription>
  </Alert>
);

export const SuccessAlert = () => (
  <Alert variant="default" className="bg-green-50 border-green-200">
    <CheckCircle2 className="h-4 w-4 text-green-600" />
    <AlertTitle className="text-green-800">Success</AlertTitle>
    <AlertDescription className="text-green-700">
      Channel stats were successfully fetched and imported
    </AlertDescription>
  </Alert>
);

export const MultipleAttemptsAlert = ({ attemptsCount }: { attemptsCount: number }) => (
  <Alert variant="default" className="bg-blue-50 border-blue-200">
    <RefreshCw className="h-4 w-4 text-blue-600" />
    <AlertTitle className="text-blue-800">Multiple attempts detected</AlertTitle>
    <AlertDescription className="text-blue-700">
      {attemptsCount} fetch attempts so far. If fetching continues to fail, consider filling in data manually.
    </AlertDescription>
  </Alert>
);
