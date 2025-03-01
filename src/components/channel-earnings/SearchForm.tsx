
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Search } from "lucide-react";

interface SearchFormProps {
  isLoading: boolean;
  channelInput: string;
  setChannelInput: (value: string) => void;
  onSearch: (e: React.FormEvent) => Promise<void>;
}

export const SearchForm = ({ isLoading, channelInput, setChannelInput, onSearch }: SearchFormProps) => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!channelInput.trim()) {
      toast({
        title: "Input required",
        description: "Please enter a channel name, ID, or URL",
        variant: "destructive",
      });
      return;
    }

    onSearch(e);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Search YouTube Channel</CardTitle>
        <CardDescription>
          Enter a channel name, ID, or URL to estimate earnings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Channel name, ID, or URL..."
              value={channelInput}
              onChange={(e) => setChannelInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
