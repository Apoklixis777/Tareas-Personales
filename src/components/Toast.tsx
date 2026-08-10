import React from 'react';

interface ToastProps {
  message: string | null;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      id="toast"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1e1b18] text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 z-50 border border-[#ac2d00]/40 max-w-sm w-auto"
    >
      <div className="w-6 h-6 rounded-full bg-[#ac2d00] text-white flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[16px] font-bold">check</span>
      </div>
      <span className="truncate">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 text-white/60 hover:text-white"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      )}
    </div>
  );
};

