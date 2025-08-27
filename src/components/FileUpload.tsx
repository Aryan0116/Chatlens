
import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { Button } from "./ui/button";

interface FileUploadProps {
  onFileSelected: (content: string) => void;
  isLoading: boolean;
}

export default function FileUpload({ onFileSelected, isLoading }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onFileSelected(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    
    const file = e.dataTransfer.files[0];
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onFileSelected(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`upload-area ${isDragging ? "drag-active" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleUploadClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept=".txt"
        className="hidden"
        disabled={isLoading}
      />
      <div className="mb-4 text-primary">
        <svg 
          width="48" 
          height="48" 
          viewBox="0 0 24 24"
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-medium mb-2">
          {fileName ? fileName : "Upload your WhatsApp Chat file"}
        </h2>
        <p className="text-muted-foreground mb-4">
          {fileName ? "Processing your chat..." : "Drop your exported .txt file here or click to browse"}
        </p>
        <Button disabled={isLoading} variant="default" className="px-6">
          {isLoading ? "Processing..." : "Upload WhatsApp Chat"}
        </Button>
      </div>
    </div>
  );
}
