
import { Button } from "@/components/ui/button";
import { Trash, Edit, Eye, EyeOff } from "lucide-react";
import { DidYouKnowFact } from "@/services/didYouKnowService";

interface FactActionsProps {
  fact: DidYouKnowFact;
  onEdit: (fact: DidYouKnowFact) => void;
  onToggleActive: (fact: DidYouKnowFact) => void;
  onDelete: (id: string) => void;
}

const FactActions = ({ fact, onEdit, onToggleActive, onDelete }: FactActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => onToggleActive(fact)}
        title={fact.is_active ? "Deactivate" : "Activate"}
      >
        {fact.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
      </Button>
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => onEdit(fact)}
        title="Edit"
      >
        <Edit size={16} />
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        className="text-red-500 hover:text-red-700"
        onClick={() => onDelete(fact.id)}
        title="Delete"
      >
        <Trash size={16} />
      </Button>
    </div>
  );
};

export default FactActions;
