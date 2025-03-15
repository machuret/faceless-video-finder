
import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form";

interface PasswordInputProps {
  placeholder?: string;
  isVisible: boolean;
  toggleVisibility: () => void;
  disabled?: boolean;
  field: any;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  placeholder = "••••••••",
  isVisible,
  toggleVisibility,
  disabled = false,
  field
}) => {
  return (
    <FormControl>
      <div className="relative">
        <Input 
          placeholder={placeholder} 
          type={isVisible ? "text" : "password"} 
          disabled={disabled} 
          {...field} 
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
          onClick={toggleVisibility}
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
    </FormControl>
  );
};

export default PasswordInput;
