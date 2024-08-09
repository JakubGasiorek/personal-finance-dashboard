import { ModalProps } from "@/types";
import React from "react";
import { Button } from "./ui/button";

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-dark-400 p-6 rounded-md shadow-lg w-full max-w-sm mx-4 text-white">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-4">
          <Button
            onClick={onConfirm}
            className="bg-red-900 hover:bg-red-600 text-white px-4 py-2 rounded-md"
          >
            Confirm
          </Button>
          <Button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-600 text-black px-4 py-2 rounded-md"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
