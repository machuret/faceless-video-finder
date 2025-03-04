
import React from "react";

interface FormSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const FormSectionWrapper = ({ title, description, children }: FormSectionProps) => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <p className="text-sm text-gray-500 mb-4">{description}</p>
    {children}
  </div>
);

export default FormSectionWrapper;
