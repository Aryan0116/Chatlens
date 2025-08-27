
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Maximize } from "lucide-react";
import ExpandableView from "@/components/ExpandableView";

export function useExpandableChart() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const ExpandButton = ({ className = "" }: { className?: string }) => (
    <Button
      variant="outline"
      size="icon"
      className={`absolute top-3 right-3 z-10 h-8 w-8 ${className}`}
      onClick={() => setIsExpanded(true)}
    >
      <Maximize className="h-4 w-4" />
    </Button>
  );
  
  const ChartWrapper = ({
    title,
    children,
    className = "",
  }: {
    title: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={`relative ${className}`}>
      {children}
      <ExpandButton />
      <ExpandableView 
        title={title}
        open={isExpanded}
        onOpenChange={setIsExpanded}
      >
        {children}
      </ExpandableView>
    </div>
  );
  
  return { ChartWrapper, ExpandButton, isExpanded, setIsExpanded };
}
