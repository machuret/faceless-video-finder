
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ChannelTypeInfo, deleteChannelType } from "@/services/channelTypeService";
import { useToast } from "@/components/ui/use-toast";

interface ChannelTypesListProps {
  channelTypes: ChannelTypeInfo[];
  loading: boolean;
  onEdit: (id: string) => void;  // Changed parameter type from ChannelTypeInfo to string
  onCreateNew: () => void;
  onDelete: (id: string) => void;
}

export const ChannelTypesList: React.FC<ChannelTypesListProps> = ({
  channelTypes,
  loading,
  onEdit,
  onCreateNew,
  onDelete
}) => {
  return (
    <div>
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold">Available Channel Types</h2>
        <Button onClick={onCreateNew}>Add New Channel Type</Button>
      </div>
      
      {loading ? (
        <p>Loading channel types...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {channelTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">No channel types found</TableCell>
              </TableRow>
            ) : (
              channelTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.id}</TableCell>
                  <TableCell>{type.label}</TableCell>
                  <TableCell className="max-w-md truncate">{type.description}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mr-2"
                      onClick={() => onEdit(type.id)}  // Changed to pass type.id instead of type
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => onDelete(type.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
