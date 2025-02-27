
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Channel, UploadFrequency } from "@/types/youtube";
import { ChannelEditForm } from "./channel-list/ChannelEditForm";
import { ChannelCard } from "./channel-list/ChannelCard";

interface ChannelListProps {
  channels: Channel[];
  onDelete: (id: string) => void;
  onSave: (channel: Channel) => void;
  onGenerateContent?: (channel: Channel) => void;
  generatingContent?: boolean;
  getChannelSize: (subscribers: number | null) => any;
  getGrowthRange: (size: any) => string;
  calculateUploadFrequency: (startDate: string | null, videoCount: number | null) => number | null;
  getUploadFrequencyCategory: (frequency: number | null) => UploadFrequency;
  getUploadFrequencyLabel: (frequency: number | null) => string;
}

export const ChannelList = ({ 
  channels, 
  onDelete, 
  onSave,
  onGenerateContent,
  generatingContent,
  getChannelSize,
  getGrowthRange,
  calculateUploadFrequency,
  getUploadFrequencyCategory,
  getUploadFrequencyLabel
}: ChannelListProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Channel | null>(null);

  const handleEdit = (channel: Channel) => {
    setEditForm({ ...channel });
    setEditingId(channel.id);
  };

  const handleSave = () => {
    if (editForm) {
      onSave(editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (editForm) {
      let value: string | number | null = e.target.value;
      
      if (e.target.type === 'number') {
        value = e.target.value === '' ? null : Number(e.target.value);
      }

      setEditForm({
        ...editForm,
        [e.target.name]: value,
      });
    }
  };

  return (
    <div className="space-y-4">
      {channels.map((channel) => (
        <Card key={channel.id} className="overflow-hidden">
          <CardContent className="p-6">
            {editingId === channel.id ? (
              <ChannelEditForm
                editForm={editForm!}
                onChange={handleChange}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : (
              <ChannelCard
                channel={channel}
                onEdit={handleEdit}
                onDelete={onDelete}
                onGenerateContent={onGenerateContent}
                generatingContent={generatingContent}
                getChannelSize={getChannelSize}
                getGrowthRange={getGrowthRange}
                calculateUploadFrequency={calculateUploadFrequency}
                getUploadFrequencyCategory={getUploadFrequencyCategory}
                getUploadFrequencyLabel={getUploadFrequencyLabel}
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
