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
  CheckCircle,
} from "lucide-react";
import { useDeadlines } from "../hooks/useDeadlines";

export function UploadSection() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { scanDocument, error } = useDeadlines();

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
    setScanResult(null);

    try {
      const scannedDeadlines = await scanDocument(uploadedFile);
      setScanResult(
        `Successfully extracted ${scannedDeadlines.length} deadlines from your document!`
      );
      setUploadedFile(null);
    } catch (err) {
      setScanResult("Failed to scan document. Please try again.");
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
            ) : scanResult ? (
              <div className="text-center py-6">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <p className="text-lg text-gray-900 mb-4">{scanResult}</p>
                <Button
                  onClick={() => setScanResult(null)}
                  variant="outline"
                  className="mr-4"
                >
                  Upload Another
                </Button>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
