
import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TextAreaFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = 'Enter content here...',
  className,
  rows = 6
}) => {
  return (
    <div className={className}>
      <Label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
        {label}
      </Label>
      <Textarea
        id={id}
        placeholder={placeholder}
        value={value || ''}
        className="min-h-24 resize-y"
        rows={rows}
        onChange={(e) => onChange(name, e.target.value)}
      />
    </div>
  );
};
