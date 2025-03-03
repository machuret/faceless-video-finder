
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import TypeSelector from "./form-dropdowns/TypeSelector";
import CategorySelector from "./form-dropdowns/CategorySelector";
import CountrySelector from "./form-dropdowns/CountrySelector";
import YouTubeUrlInput from "./YouTubeUrlInput";
import { ChannelFormData } from "@/types/forms";

interface ChannelFormProps {
  formData: ChannelFormData;
  loading: boolean;
  youtubeUrl: string;
  isEditMode: boolean;
  setYoutubeUrl: (url: string) => void;
  fetchYoutubeData: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleScreenshotChange: (url: string) => void;
  handleFieldChange: (field: string, value: string) => void;
  handleKeywordsChange: (keywords: string[]) => void;
}

const FormSection = ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <p className="text-sm text-gray-500 mb-4">{description}</p>
    {children}
  </div>
);

const ChannelIdentity = ({ formData, handleChange, handleScreenshotChange, isEditMode }: any) => (
  <FormSection title="Channel Identity" description="Basic information about the YouTube channel">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="channel_title">Channel Title</Label>
        <Input
          type="text"
          id="channel_title"
          name="channel_title"
          value={formData.channel_title}
          onChange={handleChange}
          placeholder="Enter channel title"
          required
        />
      </div>
      <div>
        <Label htmlFor="channel_url">Channel URL</Label>
        <Input
          type="url"
          id="channel_url"
          name="channel_url"
          value={formData.channel_url}
          onChange={handleChange}
          placeholder="Enter channel URL"
          required
        />
      </div>
    </div>
    <div className="mt-4">
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Enter channel description"
        rows={3}
      />
    </div>
    <div className="mt-4">
      {/* We're not implementing ScreenshotUploader for now since the component is missing */}
      <Label htmlFor="screenshot_url">Screenshot URL</Label>
      <Input
        type="url"
        id="screenshot_url"
        name="screenshot_url"
        value={formData.screenshot_url}
        onChange={handleChange}
        placeholder="Enter screenshot URL"
      />
    </div>
  </FormSection>
);

const ChannelContent = ({ title, description, onDescriptionChange }: { title: string; description: string; onDescriptionChange: (value: string) => void }) => (
  <FormSection title="Channel Content" description="Details about the type of content the channel produces">
    <div className="mb-4">
      <Label htmlFor="ai-description">AI Generated Description</Label>
      <div className="flex items-center">
        <Textarea
          id="ai-description"
          placeholder="AI Generated Description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="flex-grow mr-2"
        />
        {/* We're not implementing AIContentGenerator for now since the component is missing */}
        <Button
          type="button"
          variant="outline"
          onClick={() => console.log("Generate content")}
          size="sm"
        >
          Generate
        </Button>
      </div>
    </div>
  </FormSection>
);

const ChannelStats = ({ formData, handleChange }: any) => (
  <FormSection title="Channel Stats" description="Statistics and metrics for the YouTube channel">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="total_subscribers">Total Subscribers</Label>
        <Input
          type="number"
          id="total_subscribers"
          name="total_subscribers"
          value={formData.total_subscribers}
          onChange={handleChange}
          placeholder="Enter total subscribers"
        />
      </div>
      <div>
        <Label htmlFor="total_views">Total Views</Label>
        <Input
          type="number"
          id="total_views"
          name="total_views"
          value={formData.total_views}
          onChange={handleChange}
          placeholder="Enter total views"
        />
      </div>
      <div>
        <Label htmlFor="start_date">Start Date</Label>
        <Input
          type="date"
          id="start_date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="video_count">Video Count</Label>
        <Input
          type="number"
          id="video_count"
          name="video_count"
          value={formData.video_count}
          onChange={handleChange}
          placeholder="Enter video count"
        />
      </div>
    </div>
  </FormSection>
);

const RevenueDetails = ({ formData, handleChange }: any) => (
  <FormSection title="Revenue Details" description="Monetization and revenue information for the channel">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="cpm">CPM (Cost Per Mille)</Label>
        <Input
          type="number"
          id="cpm"
          name="cpm"
          value={formData.cpm}
          onChange={handleChange}
          placeholder="Enter CPM"
        />
      </div>
    </div>
  </FormSection>
);

const NotesSection = ({ notes, onNotesChange }: { notes: string; onNotesChange: (value: string) => void }) => (
  <FormSection title="Notes" description="Additional notes or comments about the channel">
    <div>
      <Label htmlFor="notes">Notes</Label>
      <Textarea
        id="notes"
        placeholder="Enter notes"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        rows={4}
      />
    </div>
  </FormSection>
);

const ChannelForm: React.FC<ChannelFormProps> = ({
  formData,
  loading,
  youtubeUrl,
  isEditMode,
  setYoutubeUrl,
  fetchYoutubeData,
  handleSubmit,
  handleChange,
  handleScreenshotChange,
  handleFieldChange,
  handleKeywordsChange
}) => {
  const [keywords, setKeywords] = useState<string[]>(formData.keywords || []);

  useEffect(() => {
    setKeywords(formData.keywords || []);
  }, [formData.keywords]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {!isEditMode && (
        <FormSection title="YouTube URL" description="Enter a YouTube channel URL to auto-populate the form">
          <YouTubeUrlInput
            youtubeUrl={youtubeUrl}
            setYoutubeUrl={setYoutubeUrl}
            onFetch={fetchYoutubeData}
            loading={loading}
          />
        </FormSection>
      )}

      <ChannelIdentity
        formData={formData}
        handleChange={handleChange}
        handleScreenshotChange={handleScreenshotChange}
        isEditMode={isEditMode}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TypeSelector 
          selectedType={formData.channel_type} 
          onSelect={(typeId) => handleFieldChange('channel_type', typeId)} 
          channelTitle={formData.channel_title}
          description={formData.description}
        />
        
        <CategorySelector 
          selectedCategory={formData.channel_category} 
          onSelect={(category) => handleFieldChange('channel_category', category)} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CountrySelector 
          selectedCountry={formData.country} 
          onSelect={(country) => handleFieldChange('country', country)} 
        />
      </div>

      <ChannelContent
        title={formData.channel_title}
        description={formData.description || ""}
        onDescriptionChange={(value) => handleFieldChange('description', value)}
      />

      <ChannelStats
        formData={formData}
        handleChange={handleChange}
      />
      
      <RevenueDetails
        formData={formData}
        handleChange={handleChange}
      />
      
      <NotesSection
        notes={formData.notes || ""}
        onNotesChange={(value) => handleFieldChange('notes', value)}
      />

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (isEditMode ? 'Update Channel' : 'Create Channel')}
        </Button>
      </div>
    </form>
  );
};

export default ChannelForm;
