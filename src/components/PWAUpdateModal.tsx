import React, { useEffect } from 'react';

interface PWAUpdateModalProps {
  isOpen: boolean;
  onUpdate: () => void;
}

export const PWAUpdateModal: React.FC<PWAUpdateModalProps> = ({
  isOpen,
  onUpdate,
}) => {
  // Lock body scroll when update modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Dark backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in pointer-events-auto" />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#efe6e2] z-10 overflow-hidden flex flex-col p-6 sm:p-8 text-center items-center gap-5 transition-all transform scale-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Animated Update Icon */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#ac2d00] to-[#ff9800] text-white flex items-center justify-center shadow-lg ring-4 ring-[#d53e0b]/20 animate-bounce">
          <span className="material-symbols-outlined text-[36px]">system_update</span>
        </div>

        {/* Header & Description */}
        <div className="space-y-2">
          <span className="bg-[#ffdad6] text-[#93000a] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#ffb5a0]">
            Actualización Requerida
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1e1b18] tracking-tight">
            ¡Nueva Versión Disponible!
          </h2>
          <p className="text-xs sm:text-sm text-[#5b4139] leading-relaxed">
            Hemos publicado mejoras de rendimiento, seguridad y experiencia en <strong className="text-[#ac2d00]">TaskFlow v2.0.0</strong>. Para disfrutar de la nueva versión, haz clic en actualizar.
          </p>
        </div>

        {/* Mandatory Action Button */}
        <button
          type="button"
          onClick={onUpdate}
          className="w-full bg-gradient-to-r from-[#d53e0b] to-[#ac2d00] text-white font-bold text-sm py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg hover:from-[#b02e00] hover:to-[#8f2300] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">sync</span>
          <span>Actualizar Aplicación</span>
        </button>

        <p className="text-[10px] text-[#5b4139]/70 italic">
          La aplicación se reiniciará automáticamente y tus datos en LocalStorage estarán a salvo.
        </p>
      </div>
    </div>
  );
};
