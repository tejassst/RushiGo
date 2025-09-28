import React from "react";
import { CheckCircle, Trash2, Calendar, BookOpen } from "lucide-react";
import { Deadline } from "../services/api";

type Props = {
  deadline: Deadline;
  onUpdate?: (updatedDeadline: Deadline) => void;
  onDelete?: (id: number) => void;
};

export const DeadlineCard: React.FC<Props> = ({ deadline, onDelete }) => {
  const formatDateTime = () => {
    try {
      const dateTime = new Date(deadline.date);
      if (isNaN(dateTime.getTime())) {
        return deadline.date;
      }

      const formattedDate = dateTime.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const formattedTime = dateTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      return `${formattedDate} • ${formattedTime}`;
    } catch (error) {
      return deadline.date;
    }
  };

  const getPriorityColor = () => {
    switch (deadline.priority) {
      case "high":
        return "border-l-red-500 bg-red-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      case "low":
        return "border-l-green-500 bg-green-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  return (
    <div
      className={`max-w-md bg-white rounded-xl shadow-md border-l-4 p-6 mb-4 hover:shadow-lg transition-shadow ${getPriorityColor()} ${
        deadline.completed ? "opacity-60" : ""
      }`}
    >
      {/* Header with Title and Priority */}
      <div className="flex justify-between items-start mb-3">
        <h3
          className={`font-semibold text-lg text-gray-900 ${
            deadline.completed ? "line-through" : ""
          }`}
        >
          {deadline.title}
        </h3>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            deadline.priority === "high"
              ? "bg-red-100 text-red-800"
              : deadline.priority === "medium"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {deadline.priority.toUpperCase()}
        </span>
      </div>

      {/* Description */}
      {deadline.description && (
        <p className="text-sm text-gray-600 mb-3">{deadline.description}</p>
      )}

      {/* Course */}
      {deadline.course && (
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
            {deadline.course}
          </span>
        </div>
      )}

      {/* Date and Time */}
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">{formatDateTime()}</span>
      </div>

      {/* Estimated Hours */}
      {(deadline.estimated_hours ?? 0) > 0 && (
        <div className="text-xs text-gray-500 mb-4">
          Estimated: {deadline.estimated_hours} hours
        </div>
      )}

      {/* Completion Status */}
      {deadline.completed && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Completed</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button
          onClick={() => onDelete?.(deadline.id)}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default DeadlineCard;
