
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ManageNiches: React.FC = () => {
  const { toast } = useToast();
  const [niches, setNiches] = useState<string[]>([]);
  const [newNiche, setNewNiche] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch niches from storage
  const fetchNiches = async () => {
    try {
      setLoading(true);
      // Fetch from Supabase edge function
      const { data, error } = await supabase.functions.invoke('get-niches');
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data && Array.isArray(data.niches)) {
        setNiches(data.niches);
      }
    } catch (error) {
      console.error("Error fetching niches:", error);
      toast({
        title: "Error",
        description: "Failed to load niches. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a new niche
  const handleAddNiche = async () => {
    if (!newNiche.trim()) {
      toast({
        title: "Error",
        description: "Please enter a niche name",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Add niche using edge function
      const { error } = await supabase.functions.invoke('add-niche', {
        body: { niche: newNiche.trim() }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Refresh niches list
      await fetchNiches();
      setNewNiche("");
      
      toast({
        title: "Success",
        description: `Added '${newNiche.trim()}' to niches`
      });
    } catch (error) {
      console.error("Error adding niche:", error);
      toast({
        title: "Error",
        description: "Failed to add niche. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete a niche
  const handleDeleteNiche = async (niche: string) => {
    if (!confirm(`Are you sure you want to delete "${niche}"?`)) {
      return;
    }

    try {
      setLoading(true);
      
      // Delete niche using edge function
      const { error } = await supabase.functions.invoke('delete-niche', {
        body: { niche }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Refresh niches list
      await fetchNiches();
      
      toast({
        title: "Success",
        description: `Deleted '${niche}' from niches`
      });
    } catch (error) {
      console.error("Error deleting niche:", error);
      toast({
        title: "Error",
        description: "Failed to delete niche. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load niches on component mount
  useEffect(() => {
    fetchNiches();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Channel Niches</h2>
        <Button onClick={fetchNiches} variant="outline" disabled={loading}>
          Refresh
        </Button>
      </div>
      
      <div className="flex gap-4 items-end">
        <div className="space-y-2 flex-1">
          <Label htmlFor="new-niche">Add New Niche</Label>
          <Input
            id="new-niche"
            value={newNiche}
            onChange={(e) => setNewNiche(e.target.value)}
            placeholder="Enter new niche name"
            disabled={loading}
          />
        </div>
        <Button onClick={handleAddNiche} disabled={loading || !newNiche.trim()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Niche
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-4">Loading niches...</div>
      ) : (
        <div className="border rounded-md max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Niche Name</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {niches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4">
                    No niches found
                  </TableCell>
                </TableRow>
              ) : (
                niches.map((niche) => (
                  <TableRow key={niche}>
                    <TableCell>{niche}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNiche(niche)}
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive/20"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ManageNiches;
