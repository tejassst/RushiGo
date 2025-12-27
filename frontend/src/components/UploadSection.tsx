import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Upload,
  FileImage,
  FileText,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useDeadlines } from "../hooks/useDeadlines";
import { useToast } from "../hooks/useToast";

// Get API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export function UploadSection() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResults, setScanResults] = useState<any[]>([]);
  const [scanComplete, setScanComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { createDeadline, error } = useDeadlines();

  const saveDeadline = async (deadline: any) => {
    try {
      await createDeadline({
        title: deadline.title,
        description: deadline.description,
        date: deadline.date,
        priority: deadline.priority,
        estimated_hours: deadline.estimated_hours,
      });

      toast({
        title: "Deadline Saved! ✅",
        description: `"${deadline.title}" has been added to your deadlines.`,
      });

      // Remove the saved deadline from scan results
      setScanResults((prev) =>
        prev.filter((_, index) => prev.indexOf(deadline) !== index)
      );
    } catch (err) {
      toast({
        title: "Save Failed ❌",
        description: "Failed to save deadline. Please try again.",
        variant: "destructive",
      });
    }
  };

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
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];
    if (validTypes.includes(file.type)) {
      setUploadedFile(file);
    } else {
      alert("Please upload an image (JPG, PNG, GIF) or PDF file.");
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
    setScanResults([]);
    setScanComplete(false);

    try {
      // Show scanning start notification
      toast({
        title: "Scanning Started",
        description: "Analyzing document for deadlines...",
      });

      const formData = new FormData();
      formData.append("file", uploadedFile);

      const response = await fetch(
        `${API_BASE_URL}/deadlines/scan-document`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to process document");
      }

      const results = await response.json();
      setScanResults(results);
      setScanComplete(true);

      // Show completion notification
      toast({
        title: "Scan Complete! ✅",
        description: `Found ${results.length} deadline(s) in your document`,
        duration: 5000,
      });
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Scan Failed ❌",
        description:
          "There was an error processing your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
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
                isDragging ? "bg-purple-50 border-purple-300" : ""
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
                  <p className="font-medium text-gray-900">
                    {uploadedFile.name}
                  </p>
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
            ) : scanComplete ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900">
                      Scan Complete!
                    </h4>
                    <p className="text-sm text-green-700">
                      Found {scanResults.length} deadline(s) in your document.
                      {scanResults.length > 0 &&
                        " Review and save the ones you want to track."}
                    </p>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <p className="text-lg text-red-600 mb-4">Error: {error}</p>
                <Button
                  onClick={processFile}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Try Again
                </Button>
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

            {/* Processing Status */}
            {isProcessing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <div>
                    <h4 className="font-medium text-blue-900">
                      Scanning Document...
                    </h4>
                    <p className="text-sm text-blue-700">
                      AI is analyzing your document for deadlines. This may take
                      a few moments.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Results Display */}
            {scanResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Extracted Deadlines</h3>
                <div className="grid gap-4">
                  {scanResults.map((deadline, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-white shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{deadline.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {deadline.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span className="text-gray-500">
                              📅 {new Date(deadline.date).toLocaleDateString()}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                deadline.priority === "high"
                                  ? "bg-red-100 text-red-800"
                                  : deadline.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {deadline.priority} priority
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => saveDeadline(deadline)}
                          className="ml-4"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
