
import { Input } from "@/components/ui/input";
import { FormSection } from "./FormSection";
import { useEffect } from "react";

interface RevenueDetailsProps {
  cpm: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const RevenueDetails = ({ cpm, onChange }: RevenueDetailsProps) => {
  // Set default CPM to 4 when the component mounts and CPM is empty
  useEffect(() => {
    if (!cpm) {
      const mockEvent = {
        target: {
          name: "cpm",
          value: "4"
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(mockEvent);
    }
  }, []);

  return (
    <FormSection title="Revenue">
      <div>
        <label className="block text-sm font-medium mb-1">CPM (Cost per mille)</label>
        <Input
          name="cpm"
          placeholder="CPM"
          type="number"
          value={cpm || "4"} // Default to 4
          onChange={onChange}
        />
        <p className="text-xs text-gray-500 mt-1">Cost per thousand views (average $4)</p>
      </div>
    </FormSection>
  );
};

export default RevenueDetails;
