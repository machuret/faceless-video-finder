
import React, { ReactNode } from "react";

interface FormSectionWrapperProps {
  title: string;
  description?: string;
  children: ReactNode;
  actionComponent?: ReactNode;
}

const FormSectionWrapper = ({
  title,
  description,
  children,
  actionComponent
}: FormSectionWrapperProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
        {actionComponent && (
          <div className="ml-4">
            {actionComponent}
          </div>
        )}
      </div>
      <div className="bg-white p-4 rounded-lg border">
        {children}
      </div>
    </div>
  );
};

export default FormSectionWrapper;
