
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ChannelListPagination from "./ChannelListPagination";

interface ChannelListFooterProps {
  isAdmin: boolean;
  showAll: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  limit?: number;
  channelsLength: number;
}

const ChannelListFooter: React.FC<ChannelListFooterProps> = ({
  isAdmin,
  showAll,
  currentPage,
  totalPages,
  onPageChange,
  limit,
  channelsLength
}) => {
  const navigate = useNavigate();

  return (
    <>
      {isAdmin && showAll && (
        <ChannelListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
      
      {limit && channelsLength >= limit && !isAdmin && !showAll && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin/channels")}
          >
            View All Channels
          </Button>
        </div>
      )}
    </>
  );
};

export default ChannelListFooter;
