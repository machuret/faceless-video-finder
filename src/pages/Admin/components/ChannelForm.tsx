
import { Button } from "@/components/ui/button";
import ChannelIdentity from "./form-sections/ChannelIdentity";
import ChannelStats from "./form-sections/ChannelStats";
import ChannelContent from "./form-sections/ChannelContent";
import RevenueDetails from "./form-sections/RevenueDetails";
import TypeSelector from "./form-dropdowns/TypeSelector";
import CategorySelector from "./form-dropdowns/CategorySelector";
import CountrySelector from "./form-dropdowns/CountrySelector";
import NotesSection from "./form-sections/NotesSection";

export interface ChannelFormData {
  video_id: string;
  channel_title: string;
  channel_url: string;
  description: string;
  screenshot_url: string;
  total_subscribers: string;
  total_views: string;
  start_date: string;
  video_count: string;
  cpm: string;
  channel_type?: string;
  country?: string;
  channel_category?: string;
  notes?: string;
}

interface ChannelFormProps {
  formData: ChannelFormData;
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onScreenshotChange: (url: string) => void;
  onFieldChange: (name: string, value: string) => void;
}

const ChannelForm = ({ 
  formData, 
  loading, 
  onChange, 
  onSubmit, 
  onScreenshotChange,
  onFieldChange 
}: ChannelFormProps) => {
  const isEditMode = !!formData.video_id && !!formData.channel_title;

  // Handle type selection
  const handleTypeSelect = (typeId: string) => {
    console.log("Type selection in form:", typeId);
    onFieldChange("channel_type", typeId);
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    console.log("Category selection in form:", categoryId);
    onFieldChange("channel_category", categoryId);
  };

  // Handle country selection
  const handleCountrySelect = (countryCode: string) => {
    console.log("Country selection in form:", countryCode);
    onFieldChange("country", countryCode);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Channel Identity always at the top */}
      <ChannelIdentity
        videoId={formData.video_id}
        channelTitle={formData.channel_title}
        channelUrl={formData.channel_url}
        onChange={onChange}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <TypeSelector
            selectedType={formData.channel_type}
            onSelect={handleTypeSelect}
          />
        </div>
        
        <div>
          <CategorySelector
            selectedCategory={formData.channel_category}
            onSelect={handleCategorySelect}
          />
        </div>
      </div>
      
      <CountrySelector
        selectedCountry={formData.country}
        onSelect={handleCountrySelect}
      />
      
      <ChannelContent
        description={formData.description}
        screenshotUrl={formData.screenshot_url}
        channelTitle={formData.channel_title}
        onChange={onChange}
        onScreenshotChange={onScreenshotChange}
        onFieldChange={onFieldChange}
      />

      <ChannelStats
        totalSubscribers={formData.total_subscribers}
        totalViews={formData.total_views}
        videoCount={formData.video_count}
        startDate={formData.start_date}
        onChange={onChange}
      />

      <RevenueDetails
        cpm={formData.cpm}
        onChange={onChange}
      />
      
      <NotesSection
        notes={formData.notes}
        onFieldChange={onFieldChange}
      />

      <div className="flex justify-between gap-2 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => window.location.href = "/admin/dashboard"}
        >
          Back to Dashboard
        </Button>
        
        <Button type="submit" className="min-w-32" disabled={loading}>
          {loading 
            ? (isEditMode ? "Updating..." : "Adding...") 
            : (isEditMode ? "Update Channel" : "Add Channel")}
        </Button>
      </div>
    </form>
  );
};

export default ChannelForm;
