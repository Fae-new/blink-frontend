import { useToast } from '../../contexts/ToastContext';
import { MdClose, MdCheckCircle, MdError, MdWarning, MdInfo } from 'react-icons/md';

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}

interface ToastProps {
  toast: { id: string; message: string; type: 'success' | 'error' | 'warning' | 'info' };
  onDismiss: (id: string) => void;
}

function Toast({ toast, onDismiss }: ToastProps) {
  const icons = {
    success: <MdCheckCircle className="w-5 h-5" />,
    error: <MdError className="w-5 h-5" />,
    warning: <MdWarning className="w-5 h-5" />,
    info: <MdInfo className="w-5 h-5" />,
  };

  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-800 dark:text-green-100',
    error: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-100',
    warning: 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-100',
    info: 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-100',
  };

  return (
    <div
      className={`flex items-start gap-3 min-w-[320px] max-w-md p-4 rounded-lg border shadow-lg ${bgColors[toast.type]}`}
    >
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <div className="flex-1 text-sm">{toast.message}</div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
      >
        <MdClose className="w-5 h-5" />
      </button>
    </div>
  );
}
