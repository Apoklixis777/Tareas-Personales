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




export type ThemeType = 'warm' | 'light' | 'dark';

export interface UserProfile {
  nombre: string;
  apellidos: string;
  avatarUrl: string;
  bio?: string; // "Un poco sobre ti"
  theme?: ThemeType; // tema visual seleccionado ('warm' por defecto)
  plan?: string;
}



