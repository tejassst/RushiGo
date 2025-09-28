import { useState, useCallback, useEffect } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

const toastState: ToastState = {
  toasts: [],
};

const listeners = new Set<(state: ToastState) => void>();

function dispatch(action: { type: string; toast?: Toast; id?: string }) {
  switch (action.type) {
    case 'ADD_TOAST':
      if (action.toast) {
        toastState.toasts = [...toastState.toasts, action.toast];
      }
      break;
    case 'REMOVE_TOAST':
      if (action.id) {
        toastState.toasts = toastState.toasts.filter(t => t.id !== action.id);
      }
      break;
    case 'CLEAR_TOASTS':
      toastState.toasts = [];
      break;
  }
  
  listeners.forEach(listener => listener({ ...toastState }));
}

export function useToast() {
  const [state, setState] = useState(toastState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const toast = useCallback(({ title, description, variant = 'default', duration = 3000 }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, title, description, variant, duration };
    
    dispatch({ type: 'ADD_TOAST', toast: newToast });
    
    if (duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', id });
      }, duration);
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_TOASTS' });
  }, []);

  return {
    toast,
    toasts: state.toasts,
    dismiss,
    clearAll,
  };
}
