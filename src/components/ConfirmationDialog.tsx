import React from "react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
}) => {
  if (!isOpen) return null;

  const getButtonStyles = () => {
    switch (type) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700 text-white";
      default:
        return "bg-blue-600 hover:bg-blue-700 text-white";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded transition-colors ${getButtonStyles()}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
