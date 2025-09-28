import { useState, useRef } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Upload, FileImage, FileText, X, Loader2 } from "lucide-react";

interface UploadSectionProps {
  onUploadComplete: (deadlines: any[]) => void;
}

export function UploadSection({ onUploadComplete }: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (validTypes.includes(file.type)) {
      setUploadedFile(file);
    } else {
      alert('Please upload an image (JPG, PNG, GIF) or PDF file.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const processFile = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    
    // Simulate AI processing with mock data
    setTimeout(() => {
      const mockDeadlines = [
        {
          id: Date.now() + 1,
          title: "Project Submission",
          description: "Final project deadline from uploaded document",
          date: "2024-10-15",
          time: "11:59 PM",
          priority: "high",
          source: uploadedFile.name,
          status: "pending"
        },
        {
          id: Date.now() + 2,
          title: "Assignment Review",
          description: "Review deadline found in document",
          date: "2024-10-10",
          time: "5:00 PM",
          priority: "medium",
          source: uploadedFile.name,
          status: "pending"
        },
        {
          id: Date.now() + 3,
          title: "Meeting Preparation",
          description: "Prep work deadline identified",
          date: "2024-10-08",
          time: "9:00 AM",
          priority: "low",
          source: uploadedFile.name,
          status: "pending"
        }
      ];
      
      onUploadComplete(mockDeadlines);
      setIsProcessing(false);
      setUploadedFile(null);
    }, 3000);
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="h-8 w-8 text-purple-500" />;
    }
    return <FileText className="h-8 w-8 text-blue-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Upload Your Documents
        </h1>
        <p className="text-gray-600 text-lg">
          Upload images or PDFs and let AI extract your deadlines automatically
        </p>
      </div>

      {!uploadedFile ? (
        <Card className="border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors">
          <CardContent className="p-8">
            <div
              className={`text-center py-12 rounded-lg transition-colors ${
                isDragging ? 'bg-purple-50 border-purple-300' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-2">
                Drag and drop your files here
              </p>
              <p className="text-gray-500 mb-6">
                Supports JPG, PNG, GIF, and PDF files
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Choose Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                {getFileIcon(uploadedFile)}
                <div>
                  <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                disabled={isProcessing}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isProcessing ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Processing Document...
                </p>
                <p className="text-gray-600">
                  AI is scanning for deadlines and important dates
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Button
                  onClick={processFile}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Extract Deadlines with AI
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
