import React, { useEffect } from 'react';
import { Task } from '../types';

/**
 * [PARCHE DEFENSIVO SEC-001]
 * Función que neutraliza caracteres HTML peligrosos en texto de usuario.
 * Previene XSS reflejado si en el futuro se usa dangerouslySetInnerHTML
 * o se inyecta texto en atributos HTML sin escapar.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

interface TaskDescriptionModalProps {
  task: Task | null;
  onClose: () => void;
}

export const TaskDescriptionModal: React.FC<TaskDescriptionModalProps> = ({
  task,
  onClose,
}) => {
  // Lock body scroll when modal is active
  useEffect(() => {
    if (task) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [task]);

  if (!task) return null;

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '';
    const timeStr = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const dateStr = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${dateStr}, ${timeStr}`;
  };

  const getPriorityBadgeClass = () => {
    switch (task.priority) {
      case 'alta':
        return 'bg-[#ffdad6] text-[#93000a] border-[#ffb5a0]';
      case 'baja':
        return 'bg-[#e6e2d9] text-[#4d4739] border-[#c9c6be]';
      case 'media':
      default:
        return 'bg-[#ffdcbe] text-[#653900] border-[#ffb870]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#efe6e2] z-10 overflow-hidden flex flex-col my-auto max-h-[90vh] transition-all transform scale-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#fbf2ed] to-[#f5ece7] p-5 sm:p-6 border-b border-[#e4beb4]/40 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ac2d00] to-[#ff9800] text-white flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[24px]">description</span>
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ac2d00]">
                Detalles de la Tarea
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#1e1b18] truncate pr-2">
                {task.text}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#5b4139] hover:bg-[#efe6e2] hover:text-[#1e1b18] transition-colors shrink-0 cursor-pointer"
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-full border ${getPriorityBadgeClass()}`}>
              Prioridad {task.priority}
            </span>

            {task.completed ? (
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>Completada</span>
              </span>
            ) : (
              <span className="bg-[#f5ece7] text-[#5b4139] border border-[#e4beb4]/60 px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#ac2d00]">schedule</span>
                <span>Pendiente</span>
              </span>
            )}
          </div>

          {/* Full Description Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5b4139] uppercase tracking-wider block">
              Descripción Completa
            </label>
            {/* SEC-001: Nunca usar dangerouslySetInnerHTML aquí; React escapa JSX por defecto.
                La llamada a escapeHtml() es una capa defensiva extra si se migra a innerHTML. */}
            <div className="bg-[#fbf2ed] p-4 rounded-2xl border border-[#e4beb4]/40 text-sm text-[#1e1b18] leading-relaxed whitespace-pre-wrap font-sans break-words shadow-inner min-h-[100px]">
              {task.description ? escapeHtml(task.description) : 'Sin descripción adicional.'}
            </div>
          </div>

          {/* Timestamps Section */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#efe6e2] space-y-2 text-xs text-[#5b4139]">
            <div className="flex items-center justify-between border-b border-[#efe6e2] pb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[16px] text-[#ac2d00]">calendar_add_on</span>
                <span>Creada el:</span>
              </span>
              <span className="font-bold text-[#1e1b18]">{formatDate(task.createdAt)}</span>
            </div>

            {task.dueDate && (
              <div className="flex items-center justify-between border-b border-[#efe6e2] pb-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-[#ac2d00]">event</span>
                  <span>Fecha tope:</span>
                </span>
                <span className="font-bold text-[#ac2d00]">{formatDate(task.dueDate)}</span>
              </div>
            )}

            {task.completed && task.completedAt && (
              <div className="flex items-center justify-between pt-0.5">
                <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                  <span className="material-symbols-outlined text-[16px]">task_alt</span>
                  <span>Completada el:</span>
                </span>
                <span className="font-bold text-emerald-800">{formatDate(task.completedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#fbf2ed]/60 border-t border-[#efe6e2] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#ac2d00] text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-xs hover:bg-[#b02e00] transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
