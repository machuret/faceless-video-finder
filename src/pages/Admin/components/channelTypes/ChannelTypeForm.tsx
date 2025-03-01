
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChannelTypeInfo } from "@/services/channelTypeService";

interface ChannelTypeFormProps {
  formData: ChannelTypeInfo;
  selectedType: ChannelTypeInfo | null;
  submitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const ChannelTypeForm: React.FC<ChannelTypeFormProps> = ({
  formData,
  selectedType,
  submitting,
  onInputChange,
  onSubmit,
  onCancel
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">
        {selectedType ? `Edit Channel Type: ${selectedType.label}` : "Create New Channel Type"}
      </h2>
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="id">ID (slug)</Label>
              <Input 
                id="id" 
                name="id" 
                value={formData.id} 
                onChange={onInputChange}
                placeholder="e.g. documentary_style"
                disabled={!!selectedType}
                required
              />
              {!selectedType && (
                <p className="text-sm text-gray-500 mt-1">
                  Use lowercase letters, numbers, and underscores only. This cannot be changed later.
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="label">Label</Label>
              <Input 
                id="label" 
                name="label" 
                value={formData.label} 
                onChange={onInputChange}
                placeholder="e.g. Documentary Style"
                required
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={formData.description || ''} 
                onChange={onInputChange}
                placeholder="Describe this channel type..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="production">Production Details</Label>
            <Textarea 
              id="production" 
              name="production" 
              value={formData.production || ''} 
              onChange={onInputChange}
              placeholder="Describe how this type of content is typically produced..."
              className="min-h-[100px]"
            />
          </div>
          
          <div>
            <Label htmlFor="example">Examples</Label>
            <Textarea 
              id="example" 
              name="example" 
              value={formData.example || ''} 
              onChange={onInputChange}
              placeholder="Provide examples of channels that use this format..."
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : (selectedType ? "Update Channel Type" : "Create Channel Type")}
          </Button>
        </div>
      </form>
    </div>
  );
};
