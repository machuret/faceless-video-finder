
import AdminHeader from "./components/AdminHeader";
import FactsContainer from "./components/didYouKnowFacts/FactsContainer";
import FactDialog from "./components/didYouKnowFacts/FactDialog";
import { useFactsManagement } from "./components/didYouKnowFacts/hooks/useFactsManagement";

const ManageDidYouKnowFacts = () => {
  const {
    facts,
    loading,
    dialogOpen,
    isEditing,
    currentFact,
    setDialogOpen,
    handleOpenDialog,
    handleSubmit,
    loadFacts
  } = useFactsManagement();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        title="Manage Did You Know Facts" 
        subtitle="Create and manage facts that appear on channel pages"
      />
      
      <div className="container mx-auto px-4 py-8">
        <FactsContainer 
          facts={facts}
          loading={loading}
          onAddNew={() => handleOpenDialog()}
          onEdit={handleOpenDialog}
          onRefresh={loadFacts}
        />
      </div>

      <FactDialog 
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        currentFact={currentFact}
        isEditing={isEditing}
      />
    </div>
  );
};

export default ManageDidYouKnowFacts;
