
import React from "react";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import CountrySelector from "../../form-dropdowns/CountrySelector";

interface CountryFieldProps {
  country: string;
  onSelect: (value: string) => void;
}

const CountryField = ({ country, onSelect }: CountryFieldProps) => {
  const isMissing = !country;
  
  return (
    <div className="md:col-span-2">
      <div className="flex items-center justify-between mb-1">
        <Label htmlFor="country">Country</Label>
        {isMissing && (
          <div className="flex items-center text-yellow-600 text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>Required</span>
          </div>
        )}
      </div>
      <CountrySelector 
        selectedCountry={country || ""}
        onSelect={onSelect}
      />
    </div>
  );
};

export default CountryField;
