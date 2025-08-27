
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Eye } from "lucide-react";

const ExportInstructions = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          <span>How to Export WhatsApp Chat</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-auto">
        <SheetHeader>
          <SheetTitle className="mb-2">How to Export Your WhatsApp Chat</SheetTitle>
          <SheetDescription>
            Follow these steps to export your WhatsApp conversations for analysis
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium text-lg">On Android:</h3>
            <ol className="list-decimal ml-5 space-y-3">
              <li>
                <p>Open the chat you want to export</p>
                <p className="text-sm text-muted-foreground">Open WhatsApp and navigate to the conversation</p>
              </li>
              <li>
                <p>Tap the three dots in the top right corner</p>
                <p className="text-sm text-muted-foreground">This opens the menu</p>
              </li>
              <li>
                <p>Select "More"</p>
              </li>
              <li>
                <p>Choose "Export chat"</p>
              </li>
              <li>
                <p>Select "Without Media"</p>
                <p className="text-sm text-muted-foreground">This creates a smaller file with just the text messages</p>
              </li>
              <li>
                <p>Choose how you want to share the export (email to yourself, save to Drive, etc.)</p>
              </li>
            </ol>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-lg">On iPhone:</h3>
            <ol className="list-decimal ml-5 space-y-3">
              <li>
                <p>Open the chat you want to export</p>
                <p className="text-sm text-muted-foreground">Open WhatsApp and navigate to the conversation</p>
              </li>
              <li>
                <p>Tap on the contact/group name at the top</p>
              </li>
              <li>
                <p>Scroll down and select "Export Chat"</p>
              </li>
              <li>
                <p>Choose "Without Media"</p>
                <p className="text-sm text-muted-foreground">Unless you want to include images/videos</p>
              </li>
              <li>
                <p>Select how you want to share the export</p>
                <p className="text-sm text-muted-foreground">You can email it to yourself or save it to Files</p>
              </li>
            </ol>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-lg">Then:</h3>
            <ol className="list-decimal ml-5 space-y-3">
              <li>
                <p>Save the .txt file to your device</p>
              </li>
              <li>
                <p>Return to this page and click "Upload Chat File"</p>
              </li>
              <li>
                <p>Select the .txt file you saved</p>
              </li>
              <li>
                <p>Wait for the analysis to complete</p>
              </li>
            </ol>
          </div>
          
          <div className="rounded-md bg-muted p-3 mt-4">
            <p className="text-sm">
              <strong>Privacy Note:</strong> All your chat data is processed locally in your browser. 
              No data is sent to any server or stored online.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ExportInstructions;
