
import { Dispatch, SetStateAction } from "react";

export const useFormInputHandlers = <T extends Record<string, any>>(
  setFormData: Dispatch<SetStateAction<T>>
) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
