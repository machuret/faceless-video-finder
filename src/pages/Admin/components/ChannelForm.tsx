
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChannelType } from "@/types/youtube";
import ChannelIdentity from "./form-sections/ChannelIdentity";
import ChannelStats from "./form-sections/ChannelStats";
import ChannelContent from "./form-sections/ChannelContent";
import RevenueDetails from "./form-sections/RevenueDetails";
import { countries } from "@/utils/channelUtils";

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
}

interface ChannelFormProps {
  formData: ChannelFormData;
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onScreenshotChange: (url: string) => void;
}

const ChannelForm = ({ formData, loading, onChange, onSubmit, onScreenshotChange }: ChannelFormProps) => {
  const isEditMode = !!formData.video_id && !!formData.channel_title;
  const [channelTypes, setChannelTypes] = useState<{id: string, label: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [channelCategories, setChannelCategories] = useState<{id: string, label: string}[]>([
    { id: "entertainment", label: "Entertainment" },
    { id: "education", label: "Education" },
    { id: "gaming", label: "Gaming" },
    { id: "sports", label: "Sports" },
    { id: "music", label: "Music" },
    { id: "news", label: "News & Politics" },
    { id: "howto", label: "How-to & Style" },
    { id: "tech", label: "Technology" },
    { id: "travel", label: "Travel & Events" },
    { id: "comedy", label: "Comedy" },
    { id: "film", label: "Film & Animation" },
    { id: "beauty", label: "Beauty & Fashion" },
    { id: "food", label: "Food & Cooking" },
    { id: "fitness", label: "Fitness & Health" },
    { id: "other", label: "Other" },
  ]);
  
  // Fetch channel types for dropdown
  useEffect(() => {
    const fetchChannelTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('channel_types')
          .select('id, label')
          .order('label', { ascending: true });
        
        if (error) throw error;
        setChannelTypes(data || []);
      } catch (error) {
        console.error('Error fetching channel types:', error);
        toast.error('Failed to load channel types');
      }
    };
    
    fetchChannelTypes();
  }, []);

  // Handle type selection
  const handleTypeSelect = (typeId: string) => {
    const mockEvent = {
      target: {
        name: "channel_type",
        value: typeId
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(mockEvent);
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    const mockEvent = {
      target: {
        name: "channel_category",
        value: categoryId
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(mockEvent);
  };

  // Handle country selection
  const handleCountrySelect = (countryCode: string) => {
    const mockEvent = {
      target: {
        name: "country",
        value: countryCode
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(mockEvent);
  };

  // Generate content using AI
  const generateContent = async () => {
    if (!formData.channel_title) {
      toast.error('Please enter a channel title first');
      return;
    }
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-channel-content', {
        body: { title: formData.channel_title, description: formData.description || '' }
      });
      
      if (error) throw error;
      
      if (data?.description) {
        const mockEvent = {
          target: {
            name: "description",
            value: data.description
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        onChange(mockEvent);
        toast.success('Description generated successfully!');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <ChannelContent
        description={formData.description}
        screenshotUrl={formData.screenshot_url}
        onChange={onChange}
        onScreenshotChange={onScreenshotChange}
        onGenerateContent={generateContent}
        isGenerating={isGenerating}
      />

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Channel Type</h3>
        <div className="space-y-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {formData.channel_type ? 
                  channelTypes.find(type => type.id === formData.channel_type)?.label || 'Select Type' : 
                  'Select Type'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full max-h-96 overflow-y-auto bg-white">
              {channelTypes.map((type) => (
                <DropdownMenuItem
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  className="cursor-pointer"
                >
                  {type.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Channel Category</h3>
        <div className="space-y-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {formData.channel_category ? 
                  channelCategories.find(category => category.id === formData.channel_category)?.label || 'Select Category' : 
                  'Select Category'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full max-h-96 overflow-y-auto bg-white">
              {channelCategories.map((category) => (
                <DropdownMenuItem
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className="cursor-pointer"
                >
                  {category.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Country</h3>
        <div className="space-y-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {formData.country ? 
                  countries.find(c => c.code === formData.country)?.name || 'Select Country' : 
                  'Select Country'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full max-h-96 overflow-y-auto bg-white">
              {countries.map((country) => (
                <DropdownMenuItem
                  key={country.code}
                  onClick={() => handleCountrySelect(country.code)}
                  className="cursor-pointer"
                >
                  {country.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ChannelIdentity
        videoId={formData.video_id}
        channelTitle={formData.channel_title}
        channelUrl={formData.channel_url}
        onChange={onChange}
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

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (isEditMode ? "Updating Channel..." : "Adding Channel...") : (isEditMode ? "Update Channel" : "Add Channel")}
      </Button>
    </form>
  );
};

export default ChannelForm;
