import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "./ui";
import { Play, FileText, Calendar, Clock, ArrowLeft, ArrowRight, Download, Eye, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DemoSectionProps {
  onNavigate: (section: 'home' | 'upload' | 'recents' | 'demo' | 'team') => void;
}

const demoDocuments = [
  {
    id: 1,
    name: "University Assignment Schedule.pdf",
    type: "Academic",
    deadlines: [
      { title: "Literature Review", date: "2024-10-15", time: "11:59 PM", priority: "high" },
      { title: "Research Proposal", date: "2024-10-28", time: "5:00 PM", priority: "medium" },
      { title: "Final Presentation", date: "2024-11-12", time: "2:00 PM", priority: "high" }
    ]
  },
  {
    id: 2,
    name: "Project Timeline - Q4.png",
    type: "Business",
    deadlines: [
      { title: "Phase 1 Completion", date: "2024-10-20", time: "EOD", priority: "high" },
      { title: "Client Review Meeting", date: "2024-11-05", time: "10:00 AM", priority: "medium" },
      { title: "Product Launch", date: "2024-11-30", time: "12:00 PM", priority: "high" }
    ]
  },
  {
    id: 3,
    name: "Event Planning Checklist.jpg",
    type: "Event",
    deadlines: [
      { title: "Venue Booking", date: "2024-10-10", time: "12:00 PM", priority: "high" },
      { title: "Catering Confirmation", date: "2024-10-25", time: "3:00 PM", priority: "medium" },
      { title: "Final Headcount", date: "2024-11-08", time: "6:00 PM", priority: "low" }
    ]
  }
];

export function DemoSection({ onNavigate }: DemoSectionProps) {
  const [selectedDemo, setSelectedDemo] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleDemoRun = () => {
    setIsProcessing(true);
    setShowResults(false);
    
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowResults(true);
    }, 3000);
  };

  const currentDemo = demoDocuments[selectedDemo];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Interactive Demo
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Experience the power of AI deadline extraction with our live demo. 
          Select a sample document and watch as our AI instantly identifies all deadlines.
        </p>
        
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span>No upload required • Instant results • Try multiple examples</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Demo Selection */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose a Sample Document</h2>
          
          <div className="space-y-4">
            {demoDocuments.map((doc, index) => (
              <Card 
                key={doc.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedDemo === index 
                    ? 'ring-2 ring-purple-500 bg-purple-50/50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedDemo(index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                      <Badge variant="outline" className="mt-1">
                        {doc.type}
                      </Badge>
                    </div>
                    {selectedDemo === index && (
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="pt-4">
            <Button
              onClick={handleDemoRun}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Processing Document...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Run AI Demo
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">AI Extraction Results</h2>
            {showResults && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                ✓ Extraction Complete
              </Badge>
            )}
          </div>

          <Card className="border-2 border-dashed border-gray-200 min-h-96">
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {!isProcessing && !showResults && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Select a document and click "Run AI Demo" to see the magic happen
                    </p>
                  </motion.div>
                )}

                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      AI Processing Document
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Analyzing "{currentDemo.name}" for deadlines and dates...
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div>🔍 Scanning document structure...</div>
                      <div>📅 Identifying date patterns...</div>
                      <div>⚡ Extracting deadline information...</div>
                    </div>
                  </motion.div>
                )}

                {showResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Found {currentDemo.deadlines.length} Deadlines
                      </h3>
                      <Badge className="bg-blue-100 text-blue-800">
                        From: {currentDemo.name}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {currentDemo.deadlines.map((deadline, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 mb-1">
                                    {deadline.title}
                                  </h4>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1" />
                                      {new Date(deadline.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-1" />
                                      {deadline.time}
                                    </div>
                                  </div>
                                </div>
                                <Badge className={`${getPriorityColor(deadline.priority)} border`}>
                                  {deadline.priority.toUpperCase()}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>Try it with your own documents!</strong> Upload any PDF, image, or document to extract your real deadlines.
                      </p>
                      <Button
                        onClick={() => onNavigate('upload')}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        Upload Your Document
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Demo Features */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Processing</h3>
            <p className="text-sm text-gray-600">See results in seconds, not minutes</p>
          </CardContent>
        </Card>

        <Card className="text-center border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Multiple Formats</h3>
            <p className="text-sm text-gray-600">Works with PDFs, images, and documents</p>
          </CardContent>
        </Card>

        <Card className="text-center border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Detection</h3>
            <p className="text-sm text-gray-600">Accurately identifies dates and priorities</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
