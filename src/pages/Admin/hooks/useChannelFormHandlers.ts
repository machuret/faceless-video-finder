
import { useState } from "react";
import { ChannelFormData } from "../components/ChannelForm";

export const useChannelFormHandlers = (
  formData: ChannelFormData,
  setFormData: React.Dispatch<React.SetStateAction<ChannelFormData>>
) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScreenshotChange = (url: string) => {
    setFormData((prev) => ({ ...prev, screenshot_url: url }));
  };

  return {
    handleChange,
    handleFieldChange,
    handleScreenshotChange
  };
};
