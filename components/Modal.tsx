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
        <div className="mb-4">{message}</div>
        <div className="flex justify-end space-x-4">
          <Button onClick={onConfirm} className="btn-delete text-white">
            Confirm
          </Button>
          <Button onClick={onClose} className="btn-modal-cancel text-black">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
