
import React from 'react';
import { CloseIcon } from './IconComponents';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-md m-4 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-orbitron font-bold text-[var(--accent-primary)]">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-[var(--accent-primary)] hover:bg-white/10 transition-colors duration-300">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
