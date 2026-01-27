import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "./ui/dialog";
import { Deadline, UpdateDeadlineRequest } from "../services/api";

interface Props {
  deadline: Deadline;
  open: boolean;
  onClose: () => void;
  onSave: (id: number, updates: UpdateDeadlineRequest) => Promise<void>;
}

const priorities = ["high", "medium", "low"] as const;

export const ModifyDeadlineModal: React.FC<Props> = ({
  deadline,
  open,
  onClose,
  onSave,
}) => {
  // Convert backend ISO date to local datetime-local format for input
  const getLocalDateTimeString = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    // Pad to 'YYYY-MM-DDTHH:MM' format
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const [form, setForm] = useState<UpdateDeadlineRequest>({
    title: deadline.title,
    description: deadline.description,
    course: deadline.course,
    date: getLocalDateTimeString(deadline.date),
    priority: deadline.priority,
    estimated_hours: deadline.estimated_hours,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Convert local datetime-local string to UTC ISO string before saving
      let saveForm = { ...form };
      if (form.date) {
        // 'YYYY-MM-DDTHH:MM' local -> Date -> ISO
        const localDate = new Date(form.date);
        saveForm.date = localDate.toISOString();
      }
      await onSave(deadline.id, saveForm);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update deadline");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modify Deadline</DialogTitle>
          <DialogDescription>
            Edit the details and save changes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={form.description || ""}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Course</label>
            <input
              name="course"
              value={form.course || ""}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Date</label>
            <input
              name="date"
              type="datetime-local"
              value={form.date}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              required
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Estimated Hours</label>
            <input
              name="estimated_hours"
              type="number"
              min="0"
              step="0.1"
              value={form.estimated_hours ?? ""}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <DialogFooter>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <DialogClose asChild>
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModifyDeadlineModal;
