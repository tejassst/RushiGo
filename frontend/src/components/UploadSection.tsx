import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Upload,
  FileImage,
  FileText,
  X,
  Loader2,
  AlertCircle,
  Type,
} from "lucide-react";
import { useDeadlines } from "../hooks/useDeadlines";
import { useToast } from "../hooks/useToast";
import { apiClient } from "../services/api";

// Get API base URL from environment variable
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

type Deadline = {
  title: string;
  description: string;
  date: string;
  priority: string;
  [key: string]: any; // for any extra fields
};

export function UploadSection() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"upload" | "text">("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResults, setScanResults] = useState<any[]>([]);
  const [scanTempId, setScanTempId] = useState<string | null>(null);
  const [scanComplete, setScanComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { createDeadline, error } = useDeadlines();

  const saveDeadline = async (deadline: any) => {
    if (!scanTempId) {
      toast({
        title: "Error",
        description: "No scan session found. Please rescan your document.",
        variant: "destructive",
      });
      return;
    }
    try {
      console.log("Saving deadline with data:", {
        temp_id: scanTempId,
        selected_keys: [deadline._tempKey],
        deadline: deadline,
      });

      const response = await fetch(`${API_BASE_URL}/deadlines/save-scanned`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          temp_id: scanTempId,
          selected_keys: [deadline._tempKey], // send the key
        }),
      });

      // Get response body first before checking status
      const responseText = await response.text();
      console.log("Response status:", response.status);
      console.log("Response body:", responseText);

      if (!response.ok) {
        let errorMessage = "Failed to save deadline";
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = JSON.parse(responseText);
      console.log("Save result:", result);

      toast({
        title: "Deadline Saved! ✅",
        description: `"${deadline.title}" has been added to your deadlines.`,
      });
      // Remove the saved deadline from scan results by key
      setScanResults((prev) =>
        prev.filter((d) => d._tempKey !== deadline._tempKey)
      );
    } catch (err) {
      console.error("Error saving deadline:", err);
      toast({
        title: "Save Failed ❌",
        description:
          err instanceof Error
            ? err.message
            : "Failed to save deadline. Please try again.",
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

      const response = await fetch(`${API_BASE_URL}/deadlines/scan-document`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process document");
      }

      const data = await response.json();
      const deadlinesWithKeys = data.deadlines || [];

      console.log("Scan response data:", data);
      console.log("Deadlines with keys:", deadlinesWithKeys);
      console.log("Temp ID:", data.temp_id);

      setScanResults(deadlinesWithKeys);
      setScanTempId(data.temp_id || null);
      setScanComplete(true);

      // Show completion notification
      toast({
        title: "Scan Complete! ✅",
        description: `Found ${data.deadlines?.length || 0} deadline(s) in your document`,
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
  const processText = async () => {
    if (!textInput.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter some text to extract deadlines",
        variant: "destructive",
      });
      return;
    }
    setIsProcessing(true);
    setScanResults([]);
    setScanComplete(false);

    try {
      if (!textInput.trim()) {
        toast({
          title: "Empty Input",
          description: "Please enter some text to extract deadlines",
        });
      }
      const response = await fetch(`${API_BASE_URL}/deadlines/scan-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ text: textInput }),
      });
      if (!response.ok) {
        throw new Error("Failed to process entered text");
      }
      const data = await response.json();
      const deadlinesWithKeys = data.deadlines || [];

      console.log("Scan response data:", data);
      console.log("Deadlines with keys:", deadlinesWithKeys);
      console.log("Temp ID:", data.temp_id);

      setScanResults(deadlinesWithKeys);
      setScanTempId(data.temp_id || null);
      setScanComplete(true);

      toast({
        title: "Scan Complete! ✅",
        description: `Found ${data.deadlines?.length || 0} deadline(s) in your text`,
        duration: 5000,
      });
    } catch (error) {
      console.log("Error processing text", error);
      toast({
        title: "Scan Failed ❌",
        description:
          "There was an error processing your text. Please try again.",
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
  const renderResults = () => {
    if (!scanComplete) return null;

    if (scanResults.length === 0) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-900">
                No Deadlines Found
              </h4>
              <p className="text-sm text-yellow-700">
                We couldn't find any deadlines. Try being more specific or use
                different keywords.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
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
              <h4 className="font-medium text-green-900">Scan Complete!</h4>
              <p className="text-sm text-green-700">
                Found {scanResults.length} deadline(s). Review and save the ones
                you want to track.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Extracted Deadlines</h3>
          <div className="grid gap-4">
            {scanResults.map((deadline) => (
              <div
                key={deadline._tempKey}
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
                    onClick={() => {
                      saveDeadline(deadline);
                    }}
                    className="ml-4"
                  >
                    Save
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 pb-1">
            Create Deadlines
          </h1>
          <p className="text-gray-600 text-lg">
            Upload images or PDFs and let AI extract your deadlines
            automatically
          </p>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as "upload" | "text");
            setUploadedFile(null);
            setTextInput("");
            setScanResults([]);
            setScanComplete(false);
            setIsProcessing(false);
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Documents
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Type Deadline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
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
                      Supports PDF, JPG, PNG, and GIF files
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
                  ) : !scanComplete ? (
                    <div className="text-center">
                      <Button
                        onClick={processFile}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        Extract Deadlines with AI
                      </Button>
                    </div>
                  ) : null}

                  {scanComplete && renderResults()}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="text">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={`Type or paste your deadline text here...\nExamples:\n• Submit project report by March 15th at 5 PM\n• Team meeting every Tuesday at 3 PM for the next month`}
                    className="w-full min-h-[250px] p-4 border-2 border-gray-300 rounded-lg resize-none focus:border-purple-400 focus:outline-none transition-colors"
                    disabled={isProcessing}
                  />

                  {isProcessing ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Processing text...
                      </p>
                      <p className="text-gray-600">
                        AI is analyzing your text for deadlines
                      </p>
                    </div>
                  ) : !scanComplete ? (
                    <div className="text-center">
                      <Button
                        onClick={processText}
                        disabled={!textInput.trim()}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        Extract Deadlines
                      </Button>
                    </div>
                  ) : null}

                  {scanComplete && renderResults()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
