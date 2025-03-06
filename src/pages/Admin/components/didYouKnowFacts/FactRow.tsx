
import { TableCell, TableRow } from "@/components/ui/table";
import { DidYouKnowFact } from "@/services/didYouKnowService";
import FactActions from "./FactActions";

interface FactRowProps {
  fact: DidYouKnowFact;
  onEdit: (fact: DidYouKnowFact) => void;
  onToggleActive: (fact: DidYouKnowFact) => void;
  onDelete: (id: string) => void;
}

const FactRow = ({ fact, onEdit, onToggleActive, onDelete }: FactRowProps) => {
  return (
    <TableRow key={fact.id}>
      <TableCell className="font-medium max-w-[200px] truncate">
        {fact.title}
      </TableCell>
      <TableCell className="hidden md:table-cell max-w-md">
        <div className="truncate">{fact.content.substring(0, 100)}...</div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <span className={`px-2 py-1 rounded-full text-xs ${
          fact.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {fact.is_active ? 'Active' : 'Inactive'}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <FactActions 
          fact={fact} 
          onEdit={onEdit} 
          onToggleActive={onToggleActive} 
          onDelete={onDelete} 
        />
      </TableCell>
    </TableRow>
  );
};

export default FactRow;
