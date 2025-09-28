import { useState, useEffect } from 'react';
import { apiClient, Deadline, CreateDeadlineRequest, UpdateDeadlineRequest } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function useDeadlines() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchDeadlines = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getDeadlines();
      setDeadlines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deadlines');
    } finally {
      setLoading(false);
    }
  };

  const createDeadline = async (deadlineData: CreateDeadlineRequest) => {
    try {
      const newDeadline = await apiClient.createDeadline(deadlineData);
      setDeadlines(prev => [newDeadline, ...prev]);
      return newDeadline;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create deadline';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateDeadline = async (id: number, updates: UpdateDeadlineRequest) => {
    try {
      const updatedDeadline = await apiClient.updateDeadline(id, updates);
      setDeadlines(prev => prev.map(d => d.id === id ? updatedDeadline : d));
      return updatedDeadline;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update deadline';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteDeadline = async (id: number) => {
    try {
      await apiClient.deleteDeadline(id);
      setDeadlines(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete deadline';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const scanDocument = async (file: File) => {
    try {
      setLoading(true);
      const newDeadlines = await apiClient.scanDocument(file);
      setDeadlines(prev => [...newDeadlines, ...prev]);
      return newDeadlines;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scan document';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (id: number) => {
    const deadline = deadlines.find(d => d.id === id);
    if (!deadline) return;

    try {
      await updateDeadline(id, { completed: !deadline.completed });
    } catch (err) {
      // Error already handled in updateDeadline
    }
  };

  useEffect(() => {
    fetchDeadlines();
  }, [isAuthenticated]);

  return {
    deadlines,
    loading,
    error,
    fetchDeadlines,
    createDeadline,
    updateDeadline,
    deleteDeadline,
    scanDocument,
    toggleComplete,
    clearError: () => setError(null),
  };
}
