import React, { useState, useRef, useEffect } from 'react';
import { Task, TaskPriority } from '../types';
import { TaskDescriptionModal } from './TaskDescriptionModal';

interface MisTareasScreenProps {
  tasks: Task[];
  onAddTask: (text: string, priority?: TaskPriority, description?: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (
    id: string,
    newText: string,
    priority?: TaskPriority,
    dueDate?: number | null,
    description?: string | null
  ) => void;
  onReorderTasks: (reorderedTasks: Task[]) => void;
}

type FilterType = 'pendientes' | 'completadas' | 'todas';

const toDatetimeLocalString = (timestamp: number): string => {
  const d = new Date(timestamp);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getRemainingTimeText = (now: number, dueDate: number): { text: string; isOverdue: boolean } => {
  const diff = dueDate - now;
  if (diff <= 0) {
    const overdueMs = Math.abs(diff);
    const mins = Math.floor(overdueMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return { text: `Vencida hace ${days} d`, isOverdue: true };
    if (hours > 0) return { text: `Vencida hace ${hours} h ${mins % 60} m`, isOverdue: true };
    return { text: `Vencida hace ${mins} m`, isOverdue: true };
  } else {
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return { text: `Quedan ${days} d ${hours % 24} h`, isOverdue: false };
    if (hours > 0) return { text: `Quedan ${hours} h ${mins % 60} m`, isOverdue: false };
    return { text: `Quedan ${mins} m`, isOverdue: false };
  }
};

interface DateGroup {
  dateKey: string;
  title: string;
  tasks: Task[];
}

const formatDateGroupTitle = (dateKey: string): string => {
  const [year, month, day] = dateKey.split('-').map(Number);
  const groupDate = new Date(year, month - 1, day);
  const now = new Date();

  const pad = (n: number) => n.toString().padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;

  const formattedMonth = groupDate.toLocaleDateString('es-ES', { month: 'long' });
  const capitalizedMonth = formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1);

  if (dateKey === todayStr) {
    return `Hoy - ${groupDate.getDate()} de ${capitalizedMonth} de ${groupDate.getFullYear()}`;
  } else if (dateKey === yesterdayStr) {
    return `Ayer - ${groupDate.getDate()} de ${capitalizedMonth} de ${groupDate.getFullYear()}`;
  } else {
    const dayName = groupDate.toLocaleDateString('es-ES', { weekday: 'long' });
    const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    return `${capitalizedDayName}, ${groupDate.getDate()} de ${capitalizedMonth} de ${groupDate.getFullYear()}`;
  }
};

const getGroupedTasksByDate = (taskList: Task[]): DateGroup[] => {
  const groupsMap: Record<string, Task[]> = {};

  taskList.forEach((task) => {
    const ts = task.completed && task.completedAt ? task.completedAt : task.createdAt;
    const d = new Date(ts);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateKey = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (!groupsMap[dateKey]) {
      groupsMap[dateKey] = [];
    }
    groupsMap[dateKey].push(task);
  });

  // Sort keys descending (most recent date group first)
  const sortedKeys = Object.keys(groupsMap).sort((a, b) => b.localeCompare(a));

  return sortedKeys.map((dateKey) => ({
    dateKey,
    title: formatDateGroupTitle(dateKey),
    tasks: groupsMap[dateKey],
  }));
};


export const MisTareasScreen: React.FC<MisTareasScreenProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onReorderTasks,
}) => {
  const [taskInput, setTaskInput] = useState('');
  const [taskDescriptionInput, setTaskDescriptionInput] = useState('');
  const [showAddDescription, setShowAddDescription] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority>('media');
  const [filter, setFilter] = useState<FilterType>('pendientes');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>('media');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [selectedTaskForDescription, setSelectedTaskForDescription] = useState<Task | null>(null);
  const [expandedGroupKey, setExpandedGroupKey] = useState<string | undefined>(undefined);

  // Auto-update current time every 30s to keep progress bars alive
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Reset active expanded group whenever tab filter changes
  useEffect(() => {
    setExpandedGroupKey(undefined);
  }, [filter]);

  const toggleGroupCollapse = (dateKey: string, isDefaultFirst: boolean) => {
    setExpandedGroupKey((prev) => {
      const activeKey = prev === undefined ? (isDefaultFirst ? dateKey : null) : prev;
      return activeKey === dateKey ? 'NONE' : dateKey;
    });
  };

  const checkIsGroupCollapsed = (dateKey: string, isDefaultFirst: boolean): boolean => {
    if (expandedGroupKey === undefined) {
      return !isDefaultFirst; // Default: Only first/most recent date group is expanded, others collapsed
    }
    return expandedGroupKey !== dateKey; // Exclusive accordion: Only expandedGroupKey is open
  };





  // Drag & drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchDraggedId = useRef<string | null>(null);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskInput.trim()) {
      onAddTask(taskInput.trim(), selectedPriority, taskDescriptionInput.trim() || undefined);
      setTaskInput('');
      setTaskDescriptionInput('');
      setShowAddDescription(false);
    }
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.text);
    setEditDescription(task.description || '');
    setEditPriority(task.priority || 'media');
    setEditDueDate(task.dueDate ? toDatetimeLocalString(task.dueDate) : '');
  };

  const saveEditing = (task: Task) => {
    if (editText.trim()) {
      let dueTs: number | null | undefined = undefined;
      if (editDueDate) {
        const parsed = Date.parse(editDueDate);
        dueTs = !isNaN(parsed) && parsed > task.createdAt ? parsed : null;
      } else {
        dueTs = null;
      }
      onUpdateTask(
        task.id,
        editText.trim(),
        editPriority,
        dueTs,
        editDescription.trim() ? editDescription.trim() : null
      );
    }
    setEditingId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };


  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pendientes' && t.completed) return false;
    if (filter === 'completadas' && !t.completed) return false;
    if (searchQuery.trim()) {
      return t.text.toLowerCase().includes(searchQuery.toLowerCase().trim());
    }
    return true;
  });

  // Reorder helper
  const moveTaskItem = (sourceIdx: number, destIdx: number) => {
    if (sourceIdx === destIdx || sourceIdx < 0 || destIdx < 0 || destIdx >= filteredTasks.length) {
      return;
    }

    const sourceTask = filteredTasks[sourceIdx];
    const destTask = filteredTasks[destIdx];

    const sourceGlobalIdx = tasks.findIndex((t) => t.id === sourceTask.id);
    const destGlobalIdx = tasks.findIndex((t) => t.id === destTask.id);

    if (sourceGlobalIdx !== -1 && destGlobalIdx !== -1) {
      const updatedTasks = [...tasks];
      const [removed] = updatedTasks.splice(sourceGlobalIdx, 1);
      updatedTasks.splice(destGlobalIdx, 0, removed);
      onReorderTasks(updatedTasks);
    }
  };

  // Drag handlers (HTML5 Drag & Drop)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveTaskItem(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Touch Drag Handlers (Mobile touch support)
  const handleTouchStart = (e: React.TouchEvent, taskId: string, index: number) => {
    touchStartY.current = e.touches[0].clientY;
    touchDraggedId.current = taskId;
    setDraggedIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDraggedId.current || touchStartY.current === null) return;

    const currentY = e.touches[0].clientY;
    const taskElements = Array.from(document.querySelectorAll('.task-item'));

    for (let i = 0; i < taskElements.length; i++) {
      const rect = taskElements[i].getBoundingClientRect();
      if (currentY >= rect.top && currentY <= rect.bottom) {
        if (dragOverIndex !== i) {
          setDragOverIndex(i);
        }
        break;
      }
    }
  };

  const handleTouchEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      moveTaskItem(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    touchStartY.current = null;
    touchDraggedId.current = null;
  };

  const getPriorityBadgeClass = (priority?: TaskPriority) => {
    switch (priority) {
      case 'alta':
        return 'bg-[#ffdad6] text-[#93000a] border-[#ffb5a0]';
      case 'baja':
        return 'bg-[#e6e2d9] text-[#4d4739] border-[#c9c6be]';
      case 'media':
      default:
        return 'bg-[#ffdcbe] text-[#653900] border-[#ffb870]';
    }
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '';
    const timeStr = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const dateStr = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    return `${dateStr}, ${timeStr}`;
  };

  const renderTaskCard = (task: Task, index: number) => {
    const isEditing = editingId === task.id;
    const isDragging = draggedIndex === index;
    const isDragOver = dragOverIndex === index && draggedIndex !== index;

    return (
      <div
        key={task.id}
        data-id={task.id}
        draggable={!isEditing}
        onDragStart={(e) => handleDragStart(e, index)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDrop={(e) => handleDrop(e, index)}
        onDragEnd={handleDragEnd}
        className={`task-item group relative bg-white p-4 rounded-2xl shadow-xs transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
          isDragging
            ? 'opacity-40 border-dashed border-[#ac2d00] scale-[0.99]'
            : isDragOver
            ? 'border-[#ac2d00] ring-2 ring-[#ac2d00]/30 shadow-md translate-y-1'
            : task.completed
            ? 'opacity-70 bg-[#fbf2ed]/60 border-[#efe6e2]'
            : 'border-[#efe6e2] hover:shadow-md'
        }`}
      >
        {/* Priority bar indicator */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${
            task.completed
              ? 'bg-[#e9e1dc]'
              : task.priority === 'alta'
              ? 'bg-[#ac2d00]'
              : task.priority === 'baja'
              ? 'bg-gray-400'
              : 'bg-[#ff9800]'
          }`}
        />

        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 pl-2">
          {/* Drag Handle Icon */}
          {!isEditing && filter === 'pendientes' && (
            <div
              onTouchStart={(e) => handleTouchStart(e, task.id, index)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-[#ac2d00] p-1 rounded-md transition-colors select-none touch-none"
              title="Arrastra para reordenar"
            >
              <span className="material-symbols-outlined text-[20px] block">drag_indicator</span>
            </div>
          )}

          {/* Completion Checkbox */}
          <button
            type="button"
            onClick={() => onToggleTask(task.id)}
            aria-label={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
            className={`toggle-btn shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              task.completed
                ? 'bg-[#ac2d00] text-white shadow-xs'
                : 'bg-[#efe6e2] border-2 border-[#8f7068] hover:border-[#ac2d00] hover:bg-[#ac2d00]/10 text-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] font-bold">check</span>
          </button>

          {/* Content / Edit Mode */}
          <div className="flex flex-col flex-1 min-w-0">
            {isEditing ? (
              <div className="flex flex-col gap-2.5 w-full bg-[#fbf2ed] p-3 rounded-xl border border-[#e4beb4]/50">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="edit-input w-full bg-white text-sm text-[#1e1b18] rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#ac2d00] border border-[#e4beb4]"
                  autoFocus
                  placeholder="Título de la tarea"
                />

                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Descripción detallada o notas adicionales (opcional)..."
                  className="w-full bg-white text-xs text-[#1e1b18] placeholder:text-[#5b4139]/60 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#ac2d00]/30 border border-[#e4beb4] resize-y"
                />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  {/* Priority Selector */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-[#5b4139] mr-1">Prioridad:</span>
                    {(['baja', 'media', 'alta'] as TaskPriority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setEditPriority(p)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize cursor-pointer transition-all ${
                          editPriority === p
                            ? 'bg-[#ac2d00] text-white shadow-xs'
                            : 'bg-[#efe6e2] text-[#5b4139] hover:bg-[#e4beb4]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  {/* Optional Due Date & Time Picker */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-semibold text-[#5b4139] whitespace-nowrap">Fecha tope:</span>
                    <input
                      type="datetime-local"
                      min={toDatetimeLocalString(task.createdAt)}
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="bg-white text-xs text-[#1e1b18] px-2.5 py-1.5 rounded-lg border border-[#e4beb4] outline-none focus:ring-2 focus:ring-[#ac2d00]/30 cursor-pointer"
                    />
                    {editDueDate && (
                      <button
                        type="button"
                        onClick={() => setEditDueDate('')}
                        className="text-xs text-[#ac2d00] hover:underline font-semibold cursor-pointer shrink-0"
                        title="Quitar fecha tope"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                </div>

                {/* Save/Cancel Buttons */}
                <div className="flex justify-end gap-2 pt-1 border-t border-[#e4beb4]/40">
                  <button
                    type="button"
                    onClick={() => saveEditing(task)}
                    className="bg-[#ac2d00] text-white text-xs px-4 py-1.5 rounded-lg font-semibold cursor-pointer hover:bg-[#b02e00] transition-colors shadow-xs"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-sm sm:text-base font-medium break-words transition-all duration-200 ${
                      task.completed ? 'text-[#5b4139] line-through' : 'text-[#1e1b18]'
                    }`}
                  >
                    {task.text}
                  </span>
                  {task.priority && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getPriorityBadgeClass(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  )}
                </div>

                {/* Optional Task Description Modal Trigger Button */}
                {task.description && (
                  <button
                    type="button"
                    onClick={() => setSelectedTaskForDescription(task)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#ac2d00] bg-[#f5ece7] hover:bg-[#ac2d00] hover:text-white px-2.5 py-1 rounded-lg border border-[#e4beb4]/60 transition-all cursor-pointer shadow-xs w-fit active:scale-95 my-0.5"
                    title="Hacer clic para ver la descripción completa de la tarea"
                  >
                    <span className="material-symbols-outlined text-[15px]">description</span>
                    <span>Ver descripción</span>
                  </button>
                )}

                {/* Progress Bar Component for Due Date */}
                {task.dueDate && (
                  <div className="w-full mt-2 pt-2 border-t border-[#efe6e2] space-y-1">
                    {(() => {
                      const totalMs = task.dueDate - task.createdAt;
                      const effectiveNow = task.completed && task.completedAt ? task.completedAt : currentTime;
                      const elapsedMs = effectiveNow - task.createdAt;
                      const rawPercent = totalMs > 0 ? Math.round((elapsedMs / totalMs) * 100) : 100;
                      const percent = Math.min(100, Math.max(0, rawPercent));
                      const remainingInfo = getRemainingTimeText(effectiveNow, task.dueDate);
                      const isOverdue = !task.completed && remainingInfo.isOverdue;

                      return (
                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex items-center justify-between text-[11px] font-semibold flex-wrap gap-1">
                            <span className="flex items-center gap-1 text-[#5b4139]">
                              <span className="material-symbols-outlined text-[14px] text-[#ac2d00]">hourglass_top</span>
                              <span>Avance de tiempo ({percent}%)</span>
                            </span>

                            {task.completed ? (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                100% (Completada)
                              </span>
                            ) : isOverdue ? (
                              <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 flex items-center gap-1 animate-pulse">
                                <span className="material-symbols-outlined text-[13px]">warning</span>
                                <span>{remainingInfo.text}</span>
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-[#ac2d00] bg-[#ffdcbe]/70 px-2 py-0.5 rounded-md border border-[#ffb870]/70">
                                {remainingInfo.text}
                              </span>
                            )}
                          </div>

                          <div className="w-full h-2 bg-[#efe6e2] rounded-full overflow-hidden shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                task.completed
                                  ? 'bg-emerald-600'
                                  : isOverdue
                                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                                  : percent > 85
                                  ? 'bg-gradient-to-r from-amber-500 to-red-500'
                                  : 'bg-gradient-to-r from-[#d53e0b] to-[#ff9800]'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions & Timestamps at the FAR RIGHT */}
        {!isEditing && (
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-11 sm:pl-0 border-t sm:border-t-0 border-[#efe6e2] pt-2 sm:pt-0">
            {/* Action buttons (Edit & Delete) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => startEditing(task)}
                className="edit-btn p-1.5 text-[#5b4139] hover:text-[#ac2d00] hover:bg-[#ac2d00]/10 rounded-lg transition-colors cursor-pointer"
                title="Editar tarea"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button
                type="button"
                onClick={() => onDeleteTask(task.id)}
                className="delete-btn p-1.5 text-[#5b4139] hover:text-[#ba1a1a] hover:bg-[#ba1a1a]/10 rounded-lg transition-colors cursor-pointer"
                title="Eliminar tarea"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>

            {/* Date Badges Container - Far Right */}
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 ml-auto">
              {task.dueDate && (
                <div
                  title="Fecha y hora tope (Límite)"
                  className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-lg border whitespace-nowrap shadow-xs ${
                    !task.completed && currentTime > task.dueDate
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : 'bg-[#ffdcbe]/70 text-[#653900] border-[#ffb870]/70'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">event</span>
                  <span>Tope: {formatDate(task.dueDate)}</span>
                </div>
              )}

              {task.completed && task.completedAt && (
                <div
                  title="Fecha y hora en que se marcó como lista"
                  className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#ac2d00] bg-[#ffdad6] px-2 py-0.5 rounded-lg border border-[#ffb5a0] whitespace-nowrap shadow-xs"
                >
                  <span className="material-symbols-outlined text-[13px]">check_circle</span>
                  <span>Listo: {formatDate(task.completedAt)}</span>
                </div>
              )}

              <div
                title="Fecha de creación"
                className="flex items-center gap-1 text-[11px] font-semibold text-[#5b4139] bg-[#f5ece7] px-2.5 py-1 rounded-lg border border-[#e4beb4]/50 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[14px] text-[#ac2d00]">schedule</span>
                <span>{formatDate(task.createdAt)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };


  return (
    <div id="screen-mis-tareas" className="flex flex-col w-full h-full max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-6 relative">
      {/* Decorative ambient gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#ac2d00]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/4 -right-24 w-80 h-80 bg-[#ff9800]/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Header & Stats Section */}
      <div id="mis-tareas-header" className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div id="header-text-block" className="space-y-1">
          <h1 id="screen-title-mi-dia" className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1e1b18]">
            Mis Tareas
          </h1>
          <p id="screen-subtitle-mi-dia" className="text-sm sm:text-base text-[#5b4139] max-w-lg">
            Organiza tu día con eficiencia.{' '}
            <span id="pendingCountText" className="font-bold text-[#ac2d00]">
              {pendingTasks}
            </span>{' '}
            {pendingTasks === 1 ? 'tarea pendiente' : 'tareas pendientes'}.
          </p>
        </div>

        {/* Counter cards */}
        <div id="stats-cards-container" className="flex gap-3 w-full sm:w-auto">
          <div id="stat-card-total" className="flex-1 sm:flex-initial flex flex-col items-center justify-center bg-[#f5ece7] rounded-2xl p-3.5 shadow-xs border border-[#e4beb4]/40 min-w-[90px]">
            <span className="text-[11px] font-bold text-[#5b4139] uppercase tracking-wider mb-0.5">TOTAL</span>
            <span id="statTotal" className="text-2xl font-bold text-[#1e1b18]">
              {totalTasks}
            </span>
          </div>

          <div id="stat-card-completed" className="flex-1 sm:flex-initial flex flex-col items-center justify-center bg-gradient-to-br from-[#d53e0b] to-[#ac2d00] rounded-2xl p-3.5 shadow-md min-w-[100px] text-white">
            <span className="text-[11px] font-bold uppercase tracking-wider mb-0.5 opacity-90">COMPLETADAS</span>
            <span id="statCompleted" className="text-2xl font-bold">
              {completedTasks}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 bg-white p-4 rounded-2xl border border-[#efe6e2] shadow-xs space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-[#5b4139]">
          <span>Progreso general</span>
          <span className="text-[#ac2d00] font-bold">{progressPercent}%</span>
        </div>
        <div id="progress-bar-container" className="w-full h-2.5 bg-[#efe6e2] rounded-full overflow-hidden">
          <div
            id="overallProgress"
            className="h-full bg-gradient-to-r from-[#d53e0b] to-[#ff9800] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Add Task Form */}
      <form
        id="add-task-form"
        onSubmit={handleAddSubmit}
        className="relative z-10 bg-white p-3.5 sm:p-4 rounded-2xl shadow-md border border-[#efe6e2] transition-all focus-within:ring-2 focus-within:ring-[#ac2d00]/30 flex flex-col gap-3"
      >
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
          <div className="flex-1 w-full relative flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ac2d00] pl-1">add_task</span>
            <input
              id="taskInput"
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="¿Qué necesitas hacer hoy?"
              className="w-full bg-[#fbf2ed] font-normal text-base text-[#1e1b18] placeholder:text-[#5b4139]/60 rounded-xl py-3 px-4 outline-none transition-all focus:bg-white"
            />
          </div>

          {/* Priority Selector */}
          <div id="priority-select-wrapper" className="flex items-center gap-1 bg-[#f5ece7] p-1 rounded-xl w-full sm:w-auto justify-center">
            {(['baja', 'media', 'alta'] as TaskPriority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPriority(p)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                  selectedPriority === p
                    ? 'bg-white text-[#1e1b18] shadow-xs'
                    : 'text-[#5b4139] hover:text-[#1e1b18]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowAddDescription((prev) => !prev)}
            className={`px-3 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
              showAddDescription || taskDescriptionInput.trim()
                ? 'bg-[#f5ece7] text-[#ac2d00] border-[#ac2d00]/40 font-bold'
                : 'text-[#5b4139] hover:bg-[#efe6e2] border-transparent'
            }`}
            title="Añadir descripción detallada"
          >
            <span className="material-symbols-outlined text-[18px]">notes</span>
            <span className="hidden sm:inline">{showAddDescription ? 'Menos' : '+ Descripción'}</span>
          </button>

          <button
            id="addTaskBtn"
            type="submit"
            disabled={!taskInput.trim()}
            className="w-full sm:w-auto bg-[#ac2d00] text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-sm hover:shadow-md hover:bg-[#b02e00] transition-all flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Añadir Tarea</span>
          </button>
        </div>

        {/* Expandable Optional Description Textarea */}
        {showAddDescription && (
          <div className="w-full pt-2 border-t border-[#efe6e2] animate-in fade-in duration-200">
            <textarea
              rows={3}
              value={taskDescriptionInput}
              onChange={(e) => setTaskDescriptionInput(e.target.value)}
              placeholder="Añade detalles adicionales, notas o instrucciones sobre esta tarea (opcional)..."
              className="w-full bg-[#fbf2ed] text-xs text-[#1e1b18] placeholder:text-[#5b4139]/60 rounded-xl p-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#ac2d00]/30 border border-transparent focus:border-[#ac2d00] resize-y"
            />
          </div>
        )}
      </form>

      {/* Filter Tabs & Search Bar */}
      <div id="filter-section" className="relative z-10 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Filter Tabs */}
        <div id="filter-tabs-container" className="flex gap-1 bg-[#f5ece7] p-1 rounded-xl border border-[#e4beb4]/40">
          <button
            type="button"
            data-filter="pending"
            onClick={() => setFilter('pendientes')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              filter === 'pendientes'
                ? 'bg-white text-[#ac2d00] shadow-xs'
                : 'text-[#5b4139] hover:text-[#1e1b18]'
            }`}
          >
            Pendientes ({pendingTasks})
          </button>

          <button
            type="button"
            data-filter="completed"
            onClick={() => setFilter('completadas')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              filter === 'completadas'
                ? 'bg-white text-[#ac2d00] shadow-xs'
                : 'text-[#5b4139] hover:text-[#1e1b18]'
            }`}
          >
            Completadas ({completedTasks})
          </button>

          <button
            type="button"
            data-filter="all"
            onClick={() => setFilter('todas')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              filter === 'todas'
                ? 'bg-white text-[#ac2d00] shadow-xs'
                : 'text-[#5b4139] hover:text-[#1e1b18]'
            }`}
          >
            Todas ({totalTasks})
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-[#5b4139]/60 text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tarea..."
            className="w-full sm:w-48 bg-white border border-[#efe6e2] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1e1b18] placeholder:text-[#5b4139]/50 outline-none focus:ring-2 focus:ring-[#ac2d00]/30"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-[#5b4139]/60 hover:text-[#1e1b18]"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Drag & Drop Instructions Helper */}
      {filteredTasks.length > 1 && (
        <div className="flex items-center gap-2 text-[11px] text-[#5b4139]/75 bg-[#f5ece7]/60 px-3 py-1.5 rounded-xl border border-[#e4beb4]/30 w-fit">
          <span className="material-symbols-outlined text-[16px] text-[#ac2d00]">drag_indicator</span>
          <span>Mantén pulsado o arrastra el icono ⠿ para cambiar el orden de tus tareas.</span>
        </div>
      )}

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div id="emptyState" className="flex flex-col items-center justify-center py-16 space-y-4 relative z-10 bg-white/60 rounded-3xl border border-dashed border-[#e4beb4]">
          <div className="w-24 h-24 bg-[#f5ece7] rounded-full flex items-center justify-center relative shadow-inner">
            <span className="material-symbols-outlined text-[48px] text-[#ac2d00]">
              {filter === 'completadas' ? 'task_alt' : filter === 'pendientes' ? 'done_all' : 'assignment_add'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-[#1e1b18] text-center">
            {searchQuery
              ? 'No se encontraron resultados'
              : filter === 'completadas'
              ? 'No hay tareas completadas'
              : filter === 'pendientes'
              ? '¡Excelente! No tienes tareas pendientes'
              : 'No hay tareas registradas'}
          </h3>
          <p className="text-xs sm:text-sm text-[#5b4139] text-center max-w-sm">
            {searchQuery
              ? 'Prueba a buscar con otra palabra clave.'
              : 'Añade una nueva tarea arriba para comenzar a organizar tu día.'}
          </p>
        </div>
      )}

      {/* Task Cards List with Date Accordion Grouping for Completadas and Todas */}
      <div id="taskList" className="flex flex-col space-y-3 relative z-10 min-h-[200px]">
        {filter === 'pendientes' ? (
          filteredTasks.map((task, index) => renderTaskCard(task, index))
        ) : (
          getGroupedTasksByDate(filteredTasks).map((group, groupIdx) => {
            const isDefaultFirst = groupIdx === 0;
            const isCollapsed = checkIsGroupCollapsed(group.dateKey, isDefaultFirst);

            return (
              <div
                key={group.dateKey}
                className="bg-white rounded-3xl border border-[#efe6e2] shadow-xs overflow-hidden transition-all duration-200"
              >
                {/* Accordion Group Header */}
                <button
                  type="button"
                  onClick={() => toggleGroupCollapse(group.dateKey, isDefaultFirst)}
                  className="w-full bg-[#fbf2ed]/80 hover:bg-[#f5ece7] px-5 py-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer text-left border-b border-[#efe6e2]/60 select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ac2d00] to-[#ff9800] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    </div>
                    <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-[#1e1b18] truncate">
                        {group.title}
                      </span>
                      <span className="bg-[#ac2d00]/10 text-[#ac2d00] border border-[#ac2d00]/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                        {group.tasks.length} {group.tasks.length === 1 ? 'tarea' : 'tareas'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[#5b4139] shrink-0">
                    <span className="text-xs font-semibold hidden sm:inline">
                      {isCollapsed ? 'Ver tareas' : 'Ocultar'}
                    </span>
                    <span className={`material-symbols-outlined text-[22px] transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}>
                      expand_more
                    </span>
                  </div>
                </button>

                {/* Group Tasks List */}
                {!isCollapsed && (
                  <div className="p-3 sm:p-4 space-y-3 bg-[#fff8f5]/40 animate-in fade-in duration-200">
                    {group.tasks.map((task, idx) => renderTaskCard(task, idx))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>



      {/* Task Full Description Modal */}
      <TaskDescriptionModal
        task={selectedTaskForDescription}
        onClose={() => setSelectedTaskForDescription(null)}
      />
    </div>
  );
};




