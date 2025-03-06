
import { Globe, BarChart, Bookmark, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { Channel } from "@/types/youtube";
import { channelTypes } from "@/components/youtube/channel-list/constants";

interface ChannelHeaderProps {
  channel: Channel;
}

const ChannelHeader = ({ channel }: ChannelHeaderProps) => {
  // Get channel type label and ID
  const getChannelTypeInfo = (typeId: string | undefined) => {
    if (!typeId) return { label: 'N/A', id: '' };
    const foundType = channelTypes.find(type => type.id === typeId);
    return foundType ? { label: foundType.label, id: typeId } : { label: typeId, id: typeId };
  };
  
  // Format upload frequency to be more readable
  const formatUploadFrequency = (frequency: string | undefined) => {
    if (!frequency) return 'N/A';
    return frequency
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const channelTypeInfo = getChannelTypeInfo(channel.metadata?.ui_channel_type || channel.channel_type?.toString());

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <h1 className="text-3xl font-bold mb-2">{channel.channel_title}</h1>
        {channel.niche && (
          <div className="inline-block px-3 py-1 bg-blue-500 bg-opacity-30 rounded-full text-sm font-medium">
            {channel.niche}
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Channel Information</h2>
            
            <div className="space-y-4">
              {channel.description && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-gray-700">{channel.description}</p>
                </div>
              )}
              
              {channel.channel_url && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Channel URL</h3>
                  <a 
                    href={channel.channel_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <Youtube className="h-4 w-4 mr-2" />
                    Visit YouTube Channel
                  </a>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {channel.channel_type && (
                  <div className="border rounded-md p-3">
                    <h4 className="text-sm text-gray-500 mb-1"><strong>Channel Type</strong></h4>
                    <div className="flex items-center">
                      <BarChart className="h-4 w-4 text-blue-600 mr-2" />
                      <Link 
                        to={`/channel-types/${channelTypeInfo.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {channelTypeInfo.label}
                      </Link>
                    </div>
                  </div>
                )}
                
                {channel.channel_category && (
                  <div className="border rounded-md p-3">
                    <h4 className="text-sm text-gray-500 mb-1"><strong>Category</strong></h4>
                    <div className="flex items-center">
                      <Bookmark className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="capitalize">{channel.channel_category}</span>
                    </div>
                  </div>
                )}
                
                {channel.country && (
                  <div className="border rounded-md p-3">
                    <h4 className="text-sm text-gray-500 mb-1">Country</h4>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-blue-600 mr-2" />
                      <span>{channel.country}</span>
                    </div>
                  </div>
                )}
                
                {channel.upload_frequency && (
                  <div className="border rounded-md p-3">
                    <h4 className="text-sm text-gray-500 mb-1">Upload Frequency</h4>
                    <div className="flex items-center">
                      <Upload className="h-4 w-4 text-blue-600 mr-2" />
                      <span>{formatUploadFrequency(channel.upload_frequency)}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {channel.keywords && channel.keywords.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {channel.keywords.map((keyword, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Did You Know Section */}
              <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-3">Did You Know?</h3>
                <div className="text-gray-700 space-y-2">
                  <p className="font-semibold text-blue-700">You Don't Need Millions of Views to Make Thousands of Dollars</p>
                  <p>Hey! Here's an insight you probably didn't know…</p>
                  <p>Did you know that just 50,000 views per month—which is barely a drop in the YouTube ocean—can make you $2,000+ monthly in passive income? With the right niche, some faceless YouTube channels are making $20 per 1,000 views, meaning one viral video could pay your rent for months.</p>
                  <p className="mt-3">The best part? You don't even need to show your face, record your voice, or have video editing skills. Want to know how to turn small views into big money? I break it all down at <a href="https://FacelessTraining.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">FacelessTraining.com</a> 🚀</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            {/* Channel Screenshot - Now shown at the top of the second column */}
            {channel.screenshot_url && (
              <ChannelScreenshot 
                screenshotUrl={channel.screenshot_url} 
                channelTitle={channel.channel_title} 
              />
            )}
            
            {/* Full Channel Stats below the screenshot */}
            <ChannelStats channel={channel} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Need to import here due to cyclic dependency if we try to import at the top
import { Youtube } from "lucide-react";
import ChannelStats from "./ChannelStats";
import ChannelScreenshot from "./ChannelScreenshot";

export default ChannelHeader;
