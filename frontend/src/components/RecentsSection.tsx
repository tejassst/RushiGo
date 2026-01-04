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
  Plus,
  X,
} from "lucide-react";
import { useDeadlines } from "../hooks/useDeadlines";
import {
  Deadline as APIDeadline,
  CreateDeadlineRequest,
  apiClient,
} from "../services/api";

// Create a local Deadline type that matches what DeadlineCard expects
type TransformedDeadline = {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  priority: "high" | "medium" | "low";
  source: string;
  status: "pending" | "completed" | "deleted";
};

// Transform API deadline to component deadline
const transformDeadline = (deadline: APIDeadline): TransformedDeadline => ({
  id: deadline.id,
  title: deadline.title,
  description: deadline.description || "No description available",
  date: deadline.date,
  time: new Date(deadline.date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }),
  priority: deadline.priority,
  source: deadline.description?.includes("Extracted from")
    ? "Document Scan"
    : "Manual Entry",
  status: deadline.completed ? ("completed" as const) : ("pending" as const),
});

export function RecentsSection() {
  const {
    deadlines,
    loading,
    error,
    fetchDeadlines,
    deleteDeadline,
    createDeadline,
  } = useDeadlines();
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [filteredDeadlines, setFilteredDeadlines] = useState<
    TransformedDeadline[]
  >([]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [formData, setFormData] = useState<CreateDeadlineRequest>({
    title: "",
    description: "",
    date: "",
    priority: "medium",
    estimated_hours: 0,
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const transformed = deadlines.map(transformDeadline);
    const filtered = transformed.filter((deadline) => {
      if (filter === "all") return true;
      return deadline.status === filter;
    });

    // Sort deadlines by date (earliest first)
    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    setFilteredDeadlines(sorted);
  }, [deadlines, filter]);

  const getFilteredCount = (status: string) => {
    const transformed = deadlines.map(transformDeadline);
    return transformed.filter((d) => d.status === status).length;
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDeadline(id);
    } catch (error) {
      console.error("Failed to delete deadline:", error);
    }
  };

  const handleUpdate = async (updatedDeadline: APIDeadline) => {
    try {
      await apiClient.updateDeadline(updatedDeadline.id, {
        completed: updatedDeadline.completed,
      });
      // Refresh the deadlines list
      await fetchDeadlines();
    } catch (error) {
      console.error("Failed to update deadline:", error);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;

    setIsCreating(true);
    try {
      // datetime-local gives us "2024-01-15T14:30" format (local time)
      // Convert to ISO string with timezone to preserve user's local time
      let deadlineDate: string;

      if (formData.date.includes("T")) {
        // Has time component: "2024-01-15T14:30"
        // Create a Date object which will be in user's local timezone
        const localDate = new Date(formData.date);
        // Convert to ISO string which includes timezone offset
        deadlineDate = localDate.toISOString();
      } else {
        // No time component, add midnight in user's timezone
        const localDate = new Date(formData.date + "T00:00:00");
        deadlineDate = localDate.toISOString();
      }

      await createDeadline({
        ...formData,
        date: deadlineDate,
      });
      // Reset form
      setFormData({
        title: "",
        description: "",
        date: "",
        priority: "medium",
        estimated_hours: 0,
      });
      setShowManualForm(false);
    } catch (error) {
      console.error("Failed to create deadline:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleFormChange = (
    field: keyof CreateDeadlineRequest,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const filteredDeadlinesCount = deadlines.filter((deadline) => {
    if (filter === "all") return true;
    return filter === "pending" ? !deadline.completed : deadline.completed;
  }).length;

  if (filteredDeadlinesCount === 0 && deadlines.length > 0) {
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
          Your deadlines sorted by date, with the earliest ones first
        </p>

        {/* Filter buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
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

      {/* Manual Deadline Creation */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Create a Deadline
          </h2>
          <Button
            onClick={() => setShowManualForm(!showManualForm)}
            variant="outline"
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            {showManualForm ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Deadline
              </>
            )}
          </Button>
        </div>

        {showManualForm && (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter deadline title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.date}
                  onChange={(e) => handleFormChange("date", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  step="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    handleFormChange(
                      "priority",
                      e.target.value as "low" | "medium" | "high"
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimated_hours}
                  onChange={(e) =>
                    handleFormChange(
                      "estimated_hours",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter deadline description (optional)"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isCreating || !formData.title || !formData.date}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Deadline
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowManualForm(false)}
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Deadlines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-12">
        {filteredDeadlines.map((transformedDeadline) => {
          const originalDeadline = deadlines.find(
            (d) => d.id === transformedDeadline.id
          );
          return originalDeadline ? (
            <div key={transformedDeadline.id} className="flex justify-center">
              <DeadlineCard
                deadline={originalDeadline}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            </div>
          ) : null;
        })}
      </div>

      {/* Results summary */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Calendar className="h-5 w-5 text-purple-600" />
            <Badge variant="outline" className="text-sm">
              {
                deadlines.filter((deadline) => {
                  if (filter === "all") return true;
                  return filter === "pending"
                    ? !deadline.completed
                    : deadline.completed;
                }).length
              }{" "}
              {deadlines.filter((deadline) => {
                if (filter === "all") return true;
                return filter === "pending"
                  ? !deadline.completed
                  : deadline.completed;
              }).length === 1
                ? "deadline"
                : "deadlines"}{" "}
              found
            </Badge>
          </div>
          <p className="text-gray-600">
            {filter === "all"
              ? "All your deadlines are displayed above, sorted by date."
              : `Showing ${filter} deadlines, sorted by date.`}
          </p>
        </div>
      </div>
    </div>
  );
}
