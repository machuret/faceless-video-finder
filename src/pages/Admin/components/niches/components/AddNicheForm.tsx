
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AddNicheFormProps {
  niches: string[];
  onNicheAdded: () => Promise<void>;
}

const AddNicheForm: React.FC<AddNicheFormProps> = ({ niches, onNicheAdded }) => {
  const [newNiche, setNewNiche] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddNiche = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNiche.trim()) {
      toast.error("Please enter a niche name");
      return;
    }
    
    if (niches.includes(newNiche.trim())) {
      toast.error("This niche already exists");
      return;
    }
    
    setIsAdding(true);
    
    try {
      const { error } = await supabase.functions.invoke("add-niche", {
        body: { niche: newNiche.trim() }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Refresh the niches list
      await onNicheAdded();
      setNewNiche("");
      toast.success(`Added "${newNiche}" to niches`);
    } catch (error) {
      console.error("Error adding niche:", error);
      toast.error("Failed to add niche");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Add New Niche</h2>
      <form onSubmit={handleAddNiche} className="flex space-x-2">
        <Input
          value={newNiche}
          onChange={(e) => setNewNiche(e.target.value)}
          placeholder="Enter new niche name"
          className="flex-1"
        />
        <Button type="submit" disabled={isAdding}>
          {isAdding ? "Adding..." : "Add Niche"}
        </Button>
      </form>
    </div>
  );
};

export default AddNicheForm;
