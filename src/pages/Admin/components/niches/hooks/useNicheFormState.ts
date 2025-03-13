
import { useState } from "react";
import { NicheInfo } from "./types";

export const useNicheFormState = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<NicheInfo>({
    name: "",
    description: null,
    example: null,
    image_url: null,
    cpm: 4
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const setEditingNiche = (niche: string, description?: string | null, example?: string | null, image_url?: string | null, cpm?: number | null) => {
    setFormData({
      name: niche,
      description: description || null,
      example: example || null,
      image_url: image_url || null,
      cpm: cpm || 4
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setFormData({
      name: "",
      description: null,
      example: null,
      image_url: null,
      cpm: 4
    });
    setIsEditing(false);
  };

  return {
    isEditing,
    formData,
    submitting,
    uploading,
    setFormData,
    setSubmitting,
    setUploading,
    setEditingNiche,
    cancelEditing
  };
};
