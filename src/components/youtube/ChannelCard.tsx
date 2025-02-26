import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Wand2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import type { Channel, ChannelCategory, ChannelType } from "@/types/youtube";
import { toast } from "sonner";

interface ChannelCardProps {
  channel: Channel;
  onDelete: (id: string) => void;
  onSave: (channel: Channel) => void;
}

export const ChannelCard = ({ channel, onDelete, onSave }: ChannelCardProps) => {
  const [editing, setEditing] = useState(false);
  const [editedChannel, setEditedChannel] = useState(channel);

  const handleSave = () => {
    onSave(editedChannel);
    setEditing(false);
  };

  const channelCategories: ChannelCategory[] = [
    "entertainment",
    "education",
    "gaming",
    "music",
    "news",
    "sports",
    "technology",
    "other",
  ];

  const channelTypes: ChannelType[] = ["creator", "brand", "media", "other"];

  const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
    "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde",
    "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
    "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica",
    "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini",
    "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada",
    "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia",
    "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
    "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
    "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
    "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
    "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
    "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru",
    "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
    "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
    "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
    "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
    "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
    "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
    "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
  ];

  const cpmOptions = Array.from({ length: 25 }, (_, i) => i + 1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl">
          {editing ? (
            <Input
              value={editedChannel.channel_title}
              onChange={(e) =>
                setEditedChannel({
                  ...editedChannel,
                  channel_title: e.target.value,
                })
              }
            />
          ) : (
            channel.channel_title
          )}
        </CardTitle>
        <div className="space-x-2">
          {editing ? (
            <>
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="destructive" onClick={() => onDelete(channel.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Channel URL</Label>
                <Input
                  value={editedChannel.channel_url}
                  onChange={(e) =>
                    setEditedChannel({
                      ...editedChannel,
                      channel_url: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Video ID</Label>
                <Input
                  value={editedChannel.video_id}
                  onChange={(e) =>
                    setEditedChannel({
                      ...editedChannel,
                      video_id: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <div className="relative">
                <RichTextEditor
                  value={editedChannel.description || ""}
                  onChange={(value) =>
                    setEditedChannel({
                      ...editedChannel,
                      description: value,
                    })
                  }
                  placeholder="Enter channel description..."
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-channel-content`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                          },
                          body: JSON.stringify({
                            channelTitle: editedChannel.channel_title,
                            videoId: editedChannel.video_id,
                          }),
                        }
                      );

                      if (!response.ok) throw new Error("Failed to generate content");
                      
                      const data = await response.json();
                      setEditedChannel({
                        ...editedChannel,
                        description: data.description,
                        niche: data.niche,
                      });
                      toast.success("Generated description and niche!");
                    } catch (error) {
                      toast.error("Failed to generate content");
                      console.error(error);
                    }
                  }}
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={editedChannel.channel_category || "other"}
                  onValueChange={(value: ChannelCategory) =>
                    setEditedChannel({
                      ...editedChannel,
                      channel_category: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {channelCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Type</Label>
                <Select
                  value={editedChannel.channel_type || "other"}
                  onValueChange={(value: ChannelType) =>
                    setEditedChannel({
                      ...editedChannel,
                      channel_type: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {channelTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Subscribers</Label>
                <Input
                  type="number"
                  value={editedChannel.total_subscribers || ""}
                  onChange={(e) =>
                    setEditedChannel({
                      ...editedChannel,
                      total_subscribers: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div>
                <Label>Total Views</Label>
                <Input
                  type="number"
                  value={editedChannel.total_views || ""}
                  onChange={(e) =>
                    setEditedChannel({
                      ...editedChannel,
                      total_views: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CPM</Label>
                <Select
                  value={editedChannel.cpm?.toString() || ""}
                  onValueChange={(value) =>
                    setEditedChannel({
                      ...editedChannel,
                      cpm: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select CPM" />
                  </SelectTrigger>
                  <SelectContent>
                    {cpmOptions.map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        ${value.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Video Count</Label>
                <Input
                  type="number"
                  value={editedChannel.video_count || ""}
                  onChange={(e) =>
                    setEditedChannel({
                      ...editedChannel,
                      video_count: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Revenue per Video</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editedChannel.revenue_per_video || ""}
                  onChange={(e) =>
                    setEditedChannel({
                      ...editedChannel,
                      revenue_per_video: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div>
                <Label>Revenue per Month</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editedChannel.revenue_per_month || ""}
                  onChange={(e) =>
                    setEditedChannel({
                      ...editedChannel,
                      revenue_per_month: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Country</Label>
                <Select
                  value={editedChannel.country || ""}
                  onValueChange={(value: string) =>
                    setEditedChannel({
                      ...editedChannel,
                      country: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Niche</Label>
                <Input
                  value={editedChannel.niche || ""}
                  onChange={(e) =>
                    setEditedChannel({
                      ...editedChannel,
                      niche: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <RichTextEditor
                value={editedChannel.notes || ""}
                onChange={(value) =>
                  setEditedChannel({
                    ...editedChannel,
                    notes: value,
                  })
                }
                placeholder="Enter notes..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={editedChannel.uses_ai || false}
                onCheckedChange={(checked) =>
                  setEditedChannel({
                    ...editedChannel,
                    uses_ai: checked,
                  })
                }
              />
              <Label>Uses AI</Label>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div 
              className="text-sm text-gray-600 prose prose-sm max-w-none" 
              dangerouslySetInnerHTML={{ __html: channel.description || "" }}
            />
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span>{channel.total_subscribers?.toLocaleString()} subscribers</span>
              <span>{channel.total_views?.toLocaleString()} views</span>
              {channel.channel_category && (
                <span>Category: {channel.channel_category}</span>
              )}
              {channel.channel_type && <span>Type: {channel.channel_type}</span>}
              {channel.country && <span>Country: {channel.country}</span>}
              {channel.video_count && (
                <span>{channel.video_count.toLocaleString()} videos</span>
              )}
              {channel.uses_ai && <span>Uses AI</span>}
            </div>
            {channel.notes && (
              <div 
                className="text-sm text-gray-600 prose prose-sm max-w-none mt-4" 
                dangerouslySetInnerHTML={{ __html: channel.notes }}
              />
            )}
            {channel.cpm && (
              <div className="text-sm text-gray-500">
                CPM: ${channel.cpm.toFixed(2)}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
