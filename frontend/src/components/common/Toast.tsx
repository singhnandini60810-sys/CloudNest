import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const toastIcons = {
  success: CheckCircle2,
  error: TriangleAlert,
  info: Info,
};

function Toast({ message, type, onClose }: ToastProps) {
  const Icon = toastIcons[type];

  return (
    <div className={`toast toast--${type}`} role="status">
      <div className="toast__icon">
        <Icon size={20} />
      </div>

      <p>{message}</p>

      <button type="button" onClick={onClose} aria-label="Close notification">
        <X size={18} />
      </button>
    </div>
  );
}

export default Toast;