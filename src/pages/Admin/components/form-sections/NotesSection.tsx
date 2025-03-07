
import { FormSection } from "./FormSection";
import { RichTextEditor } from "@/components/ui/rich-text-editor/RichTextEditor";
import { useEffect, useState } from "react";
import { channelTypes } from "@/components/youtube/channel-list/constants";

interface NotesSectionProps {
  notes: string | undefined;
  channelType: string | undefined;
  onFieldChange: (name: string, value: string) => void;
}

const NotesSection = ({ notes, channelType, onFieldChange }: NotesSectionProps) => {
  const [typeInfo, setTypeInfo] = useState<any>(null);

  useEffect(() => {
    if (channelType) {
      const foundType = channelTypes.find(type => type.id === channelType);
      setTypeInfo(foundType);
    } else {
      setTypeInfo(null);
    }
  }, [channelType]);

  return (
    <FormSection title="Gabriel Notes">
      {typeInfo && (
        <div className="mb-6 space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-medium mb-2 text-blue-800">Type: {typeInfo.label}</h3>
            
            {typeInfo.description && (
              <div className="mb-4">
                <h4 className="font-medium text-blue-700 mb-1">Description</h4>
                <div 
                  className="text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: typeInfo.description }}
                />
              </div>
            )}
            
            {typeInfo.production && (
              <div className="mb-4">
                <h4 className="font-medium text-blue-700 mb-1">How to Create</h4>
                <div 
                  className="text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: typeInfo.production }}
                />
              </div>
            )}
            
            {typeInfo.example && (
              <div>
                <h4 className="font-medium text-blue-700 mb-1">Example Ideas</h4>
                <div 
                  className="text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: typeInfo.example }}
                />
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <RichTextEditor
          id="notes"
          name="notes"
          label=""
          value={notes || ""}
          onChange={(name, value) => onFieldChange(name, value)}
          placeholder="Enter notes about this channel here..."
          className="w-full"
        />
      </div>
    </FormSection>
  );
};

export default NotesSection;
