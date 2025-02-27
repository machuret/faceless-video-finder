
import { Channel } from "@/types/youtube";
import { DescriptionEditor } from "./generation/DescriptionEditor";
import { NotesEditor } from "./generation/NotesEditor";
import { MetadataGenerators } from "./generation/MetadataGenerators";

interface ChannelDescriptionProps {
  editForm: Channel;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const ChannelDescription = ({ editForm, onChange }: ChannelDescriptionProps) => {
  return (
    <div className="space-y-4">
      <DescriptionEditor editForm={editForm} onChange={onChange} />
      
      <MetadataGenerators editForm={editForm} onChange={onChange} />
      
      <NotesEditor editForm={editForm} onChange={onChange} />
    </div>
  );
};
