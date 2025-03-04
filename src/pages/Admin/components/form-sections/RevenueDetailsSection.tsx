
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormSectionWrapper from "./FormSectionWrapper";
import { ChannelFormData } from "@/types/forms";

interface RevenueDetailsSectionProps {
  formData: ChannelFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const RevenueDetailsSection = ({ 
  formData, 
  handleChange 
}: RevenueDetailsSectionProps) => (
  <FormSectionWrapper title="Revenue Details" description="Monetization and revenue information for the channel">
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
  </FormSectionWrapper>
);

export default RevenueDetailsSection;
