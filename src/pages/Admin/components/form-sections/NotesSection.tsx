
import { FormSection } from "./FormSection";
import { RichTextEditor } from "@/components/ui/rich-text-editor/RichTextEditor";

interface NotesSectionProps {
  notes: string | undefined;
  onFieldChange: (name: string, value: string) => void;
}

const NotesSection = ({ notes, onFieldChange }: NotesSectionProps) => {
  return (
    <FormSection title="Channel Notes">
      <div className="space-y-2">
        <RichTextEditor
          id="notes"
          name="notes"
          label=""
          value={notes || ""}
          onChange={onFieldChange}
          placeholder="Enter notes about this channel here..."
          className="w-full"
        />
      </div>
    </FormSection>
  );
};

export default NotesSection;
