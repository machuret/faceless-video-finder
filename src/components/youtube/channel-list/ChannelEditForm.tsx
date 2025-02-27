
import { useState } from "react";
import { Channel } from "@/types/youtube";
import { Button } from "@/components/ui/button";
import { ChannelBasicInfo } from "./form-sections/ChannelBasicInfo";
import { ChannelStats } from "./form-sections/ChannelStats";
import { ChannelVideoStats } from "./form-sections/ChannelVideoStats";
import { ChannelCategories } from "./form-sections/ChannelCategories";
import { ChannelDescription } from "./form-sections/ChannelDescription";
import { KeywordsInput } from "./KeywordsInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChannelEditFormProps {
  editForm: Channel;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ChannelEditForm = ({ editForm, onChange, onSave, onCancel }: ChannelEditFormProps) => {
  const [keywords, setKeywords] = useState<string[]>(editForm.keywords || []);

  const handleKeywordsChange = (newKeywords: string[]) => {
    setKeywords(newKeywords);
    // Create a mock event to update the parent form state
    const mockEvent = {
      target: {
        name: "keywords",
        value: newKeywords
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(mockEvent);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h3 className="text-xl font-semibold">Edit Channel</h3>
        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onSave}>Save Changes</Button>
        </div>
      </div>

      <Tabs defaultValue="basic-info">
        <TabsList className="mb-4">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic-info">
          <ChannelBasicInfo editForm={editForm} onChange={onChange} />
        </TabsContent>
        
        <TabsContent value="categories">
          <ChannelCategories editForm={editForm} onChange={onChange} />
        </TabsContent>
        
        <TabsContent value="stats">
          <ChannelStats editForm={editForm} onChange={onChange} />
        </TabsContent>
        
        <TabsContent value="videos">
          <ChannelVideoStats editForm={editForm} onChange={onChange} />
        </TabsContent>
        
        <TabsContent value="description">
          <ChannelDescription editForm={editForm} onChange={onChange} />
        </TabsContent>
        
        <TabsContent value="keywords">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Keywords</h3>
            <KeywordsInput keywords={keywords} onChange={handleKeywordsChange} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
