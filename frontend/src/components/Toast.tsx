import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { useToast, Toast } from "../hooks/useToast";

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const getIcon = () => {
    if (toast.variant === "destructive") {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

  const getStyles = () => {
    if (toast.variant === "destructive") {
      return "bg-red-50 border-red-200 text-red-900";
    }
    return "bg-white border-gray-200 text-gray-900 shadow-lg";
  };

  return (
    <div
      className={`
        max-w-md p-4 rounded-lg border transition-all duration-300 transform
        ${getStyles()}
        ${
          isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{toast.title}</h4>
          {toast.description && (
            <p className="text-sm opacity-90 mt-1">{toast.description}</p>
          )}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 ml-2 opacity-50 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}

export { useToast } from "../hooks/useToast";
