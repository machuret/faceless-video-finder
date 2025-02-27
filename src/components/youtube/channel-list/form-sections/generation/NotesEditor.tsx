
import { Channel } from "@/types/youtube";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface NotesEditorProps {
  editForm: Channel;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export function NotesEditor({ editForm, onChange }: NotesEditorProps) {
  const handleNotesChange = (html: string) => {
    const mockEvent = {
      target: {
        name: "notes",
        value: html
      }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(mockEvent);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Gab Notes</label>
      <RichTextEditor 
        value={editForm?.notes || ""} 
        onChange={handleNotesChange}
        placeholder="Enter notes..." 
        className="min-h-[200px] border rounded-md p-4 prose prose-sm max-w-none bg-white"
      />
    </div>
  );
}
