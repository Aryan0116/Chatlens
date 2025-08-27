
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { X } from "lucide-react";

interface ExpandableViewProps {
  title: string;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExpandableView = ({ title, children, open, onOpenChange }: ExpandableViewProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="p-2">
          <AspectRatio ratio={16 / 9}>{children}</AspectRatio>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpandableView;
