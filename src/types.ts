import pkg from '../package.json';

export const APP_VERSION = pkg.version || '1.5.0';

export type ScreenType = 'mis-tareas' | 'ajustes';



export type TaskPriority = 'alta' | 'media' | 'baja';

export interface Task {
  id: string;
  text: string;
  description?: string; // descripción detallada opcional
  completed: boolean;
  createdAt: number; // timestamp
  completedAt?: number; // timestamp de completado
  dueDate?: number; // timestamp limite opcional
  priority: TaskPriority;
  category?: string;
}




export interface UserProfile {
  nombre: string;
  apellidos: string;
  avatarUrl: string;
  bio?: string; // "Un poco sobre ti"
  plan?: string;
}


