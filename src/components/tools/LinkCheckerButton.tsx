
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LinkChecker from './LinkChecker';

interface LinkCheckerButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const LinkCheckerButton: React.FC<LinkCheckerButtonProps> = ({ 
  variant = 'outline',
  size = 'sm'
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-1">
          <AlertTriangle className="h-4 w-4" />
          <span>Check Links</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Link Checker</DialogTitle>
          <DialogDescription>
            Scan this page for broken links and problems
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <LinkChecker autoScan={true} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkCheckerButton;
