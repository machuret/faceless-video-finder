
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface ChannelStatFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  type?: "text" | "number" | "date";
  placeholder?: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ChannelStatField = ({ 
  id, 
  name, 
  label, 
  value, 
  type = "text",
  placeholder,
  required = false,
  onChange 
}: ChannelStatFieldProps) => {
  const isMissing = required && !value;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <Label htmlFor={id}>{label}</Label>
        {isMissing && (
          <div className="flex items-center text-yellow-600 text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>Required</span>
          </div>
        )}
      </div>
      <Input
        type={type}
        id={id}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={isMissing ? "border-yellow-500" : ""}
      />
    </div>
  );
};

export default ChannelStatField;
