
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLElement>;
  filename?: string;
}

export default function ExportButton({ targetRef, filename = "chat-analysis" }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportAsPNG = async () => {
    if (!targetRef.current) return;
    
    try {
      setIsExporting(true);
      
      // Dynamically import html2canvas
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;
      
      const canvas = await html2canvas(targetRef.current, {
        scale: 2,
        backgroundColor: '#fff',
        logging: false
      });
      
      // Create a download link
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error exporting chart:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="ml-auto flex items-center gap-1"
      onClick={exportAsPNG}
      disabled={isExporting}
    >
      <Download size={16} />
      {isExporting ? 'Exporting...' : 'Export'}
    </Button>
  );
}
