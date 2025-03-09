
import React from "react";
import { NicheInfo } from "./types";

export const useFormInputHandlers = (
  setFormData: React.Dispatch<React.SetStateAction<NicheInfo>>
) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRichTextChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return {
    handleInputChange,
    handleRichTextChange
  };
};
