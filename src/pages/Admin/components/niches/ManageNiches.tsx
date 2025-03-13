
import React, { useState, useEffect } from "react";
import { useNichesList } from "./hooks/useNichesList";
import { NichesList } from "./components/NichesList";
import { NicheForm } from "./NicheForm";
import { NicheProvider, useNicheContext } from "./context/NicheContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const ManageNichesContent = () => {
  const { data, isLoading, error, refetch } = useNichesList();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const {
    selectedNiche,
    setSelectedNiche,
    isFormOpen,
    setIsFormOpen,
    nicheDetails,
    setNicheDetails,
    setRefreshNiches,
  } = useNicheContext();

  useEffect(() => {
    if (data) {
      setNicheDetails(data.nicheDetails || {});
    }
  }, [data, setNicheDetails]);

  useEffect(() => {
    setRefreshNiches(() => refetch);
  }, [refetch, setRefreshNiches]);

  const handleOpenForm = (niche: string) => {
    setSelectedNiche(niche);
    setIsFormOpen(true);
    setActiveTab("edit");
  };

  const handleCreateNew = () => {
    setSelectedNiche(null);
    setIsFormOpen(true);
    setActiveTab("edit");
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedNiche(null);
    setActiveTab("list");
  };

  const filteredNiches = data?.niches
    ? data.niches.filter((niche) =>
        niche.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-6 w-full sm:w-auto">
        <TabsTrigger value="list">Niches List</TabsTrigger>
        <TabsTrigger value="edit">
          {selectedNiche ? "Edit Niche" : "Create New Niche"}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="list" className="mt-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Manage Niches</h2>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search niches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button onClick={handleCreateNew}>Add New Niche</Button>
            </div>
          </div>

          <NichesList
            niches={filteredNiches}
            loading={isLoading}
            error={error}
            onEdit={handleOpenForm}
            nicheDetails={nicheDetails}
          />
        </Card>
      </TabsContent>

      <TabsContent value="edit" className="mt-6">
        <Card className="p-6">
          <NicheForm
            niche={selectedNiche}
            description={selectedNiche ? nicheDetails[selectedNiche]?.description || null : null}
            example={selectedNiche ? nicheDetails[selectedNiche]?.example || null : null}
            image_url={selectedNiche ? nicheDetails[selectedNiche]?.image_url || null : null}
            cpm={selectedNiche ? nicheDetails[selectedNiche]?.cpm || 4 : 4}
            onCancel={handleCloseForm}
          />
        </Card>
      </TabsContent>
    </Tabs>
  );
};

const ManageNiches = () => {
  return (
    <NicheProvider>
      <ManageNichesContent />
    </NicheProvider>
  );
};

export default ManageNiches;
