import { useState, useEffect } from "react";
import { DeadlineCard } from "./DeadlineCard";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  RefreshCw,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useDeadlines } from "../hooks/useDeadlines";
import { Deadline } from "../services/api";

// Transform API deadline to component deadline
const transformDeadline = (deadline: Deadline) => ({
  id: deadline.id,
  title: deadline.title,
  description: deadline.description || "No description available",
  date: deadline.date,
  time: new Date(deadline.date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }),
  priority: deadline.priority,
  source: "API",
  status: deadline.completed ? ("completed" as const) : ("pending" as const),
});

export function RecentsSection() {
  const { deadlines, loading, error, toggleComplete, fetchDeadlines } =
    useDeadlines();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [filteredDeadlines, setFilteredDeadlines] = useState<
    ReturnType<typeof transformDeadline>[]
  >([]);

  useEffect(() => {
    const transformed = deadlines.map(transformDeadline);
    const filtered = transformed.filter((deadline) => {
      if (filter === "all") return true;
      return deadline.status === filter;
    });
    setFilteredDeadlines(filtered);
    setCurrentIndex(0);
  }, [deadlines, filter]);

  const handleSwipeLeft = async (_id: number) => {
    // Keep as pending - just move to next card
    nextCard();
  };

  const handleSwipeRight = async (id: number) => {
    // Mark as completed
    try {
      await toggleComplete(id);
      nextCard();
    } catch (err) {
      console.error("Failed to toggle completion:", err);
    }
  };

  const nextCard = () => {
    if (currentIndex < filteredDeadlines.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const resetCards = () => {
    setCurrentIndex(0);
  };

  const getFilteredCount = (status: string) => {
    const transformed = deadlines.map(transformDeadline);
    return transformed.filter((d) => d.status === status).length;
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-12">
          <Loader2 className="h-16 w-16 text-purple-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Loading Deadlines...
          </h2>
          <p className="text-gray-600">
            Fetching your deadlines from the server.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Deadlines
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={fetchDeadlines}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (filteredDeadlines.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {filter === "all" ? "No Deadlines Found" : `No ${filter} deadlines`}
          </h2>
          <p className="text-gray-600 mb-6">
            {filter === "all"
              ? "Upload a document to get started with deadline tracking!"
              : `You don't have any ${filter} deadlines at the moment.`}
          </p>
          {filter !== "all" && (
            <Button
              onClick={() => setFilter("all")}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              View All Deadlines
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Your Deadlines
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          Swipe left to keep pending, swipe right to mark as read
        </p>

        {/* Filter buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={
              filter === "all"
                ? "bg-gradient-to-r from-purple-600 to-blue-600"
                : ""
            }
          >
            <Calendar className="h-4 w-4 mr-2" />
            All ({deadlines.length})
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
            className={
              filter === "pending"
                ? "bg-gradient-to-r from-purple-600 to-blue-600"
                : ""
            }
          >
            <Clock className="h-4 w-4 mr-2" />
            Pending ({getFilteredCount("pending")})
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            onClick={() => setFilter("completed")}
            className={
              filter === "completed"
                ? "bg-gradient-to-r from-purple-600 to-blue-600"
                : ""
            }
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed ({getFilteredCount("completed")})
          </Button>
        </div>
      </div>

      {/* Card stack */}
      <div className="relative h-96 mb-8">
        <div className="absolute inset-0 flex items-center justify-center">
          {filteredDeadlines.map((deadline, index) => {
            if (index < currentIndex) return null;

            const isActive = index === currentIndex;
            const zIndex = filteredDeadlines.length - index;
            const scale = isActive ? 1 : 0.95 - (index - currentIndex) * 0.05;
            const yOffset = (index - currentIndex) * 10;

            return (
              <DeadlineCard
                key={deadline.id}
                deadline={deadline}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                style={{
                  position: "absolute",
                  zIndex,
                  transform: `scale(${scale}) translateY(${yOffset}px)`,
                  pointerEvents: isActive ? "auto" : "none",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <Badge variant="outline" className="text-sm">
            {currentIndex + 1} of {filteredDeadlines.length}
          </Badge>
          {currentIndex >= filteredDeadlines.length - 1 && (
            <Button
              onClick={resetCards}
              variant="outline"
              size="sm"
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Cards
            </Button>
          )}
        </div>

        {currentIndex >= filteredDeadlines.length - 1 && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              All caught up!
            </h3>
            <p className="text-gray-600">
              You've reviewed all {filter} deadlines. Great job staying
              organized!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
