
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FormSectionWrapper from "./FormSectionWrapper";

interface NotesFormSectionProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

const NotesFormSection = ({ notes, onNotesChange }: NotesFormSectionProps) => (
  <FormSectionWrapper title="Notes" description="Additional notes or comments about the channel">
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
  </FormSectionWrapper>
);

export default NotesFormSection;
