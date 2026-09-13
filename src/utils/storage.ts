import { Task, UserProfile } from '../types';

/**
 * [PARCHE DEFENSIVO SEC-002]
 * Limita el tamaño total de datos antes de escribir en LocalStorage.
 * Previene un ataque de Storage Exhaustion donde un script malicioso
 * o datos corruptos llenen los ~5MB de cuota del navegador,
 * denegando almacenamiento a otras apps del mismo origen.
 */
const MAX_TASKS_STORAGE_BYTES = 3 * 1024 * 1024; // 3 MB límite defensivo
const MAX_PROFILE_STORAGE_BYTES = 512 * 1024;    // 512 KB para perfil+avatar

function byteSize(str: string): number {
  return new Blob([str]).size;
}

const TASKS_KEY = 'taskflow_tasks';
const PROFILE_KEY = 'taskflow_user_profile';
const ONBOARDING_KEY = 'taskflow_onboarding_completed';

/**
 * Validates and sanitizes avatar URL to prevent XSS (e.g. javascript: protocols)
 * [PARCHE DEFENSIVO SEC-003]
 * Defensa en profundidad: normalizar minúsculas y caracteres de control/espacios,
 * bloqueando variantes de javascript:, vbscript:, data:text/, data:application/, etc.
 */
export function sanitizeAvatarUrl(url: string | undefined): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  const lowerTrimmed = trimmed.toLowerCase().replace(/[\s\t\r\n\u00a0]+/g, '');
  const BANNED_PROTOCOLS = [
    'javascript:',
    'vbscript:',
    'data:text/',
    'data:application/',
  ];
  for (const proto of BANNED_PROTOCOLS) {
    if (lowerTrimmed.startsWith(proto)) {
      console.warn('[SEC-003] URL de avatar bloqueada por protocolo peligroso:', trimmed.slice(0, 40));
      return '';
    }
  }

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/')
  ) {
    return trimmed;
  }
  return '';
}

/**
 * Safely reads tasks from LocalStorage with runtime validation
 * [PARCHE DEFENSIVO SEC-004]
 * Validación de estructura, límites de longitud y protección contra prototype pollution.
 */
export function loadTasksFromStorage(fallback: Task[]): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((t) => {
        if (!t || typeof t !== 'object' || Array.isArray(t)) return false;
        // Bloquear keys de prototype pollution
        if ('__proto__' in t || 'constructor' in t || 'prototype' in t) return false;
        if (typeof t.id !== 'string' || t.id.length > 128) return false;
        if (typeof t.text !== 'string' || t.text.length > 4096) return false;
        if (typeof t.completed !== 'boolean') return false;
        if (t.description !== undefined && (typeof t.description !== 'string' || t.description.length > 10000)) return false;
        if (t.createdAt !== undefined && typeof t.createdAt !== 'number') return false;
        if (t.dueDate !== undefined && typeof t.dueDate !== 'number') return false;
        if (t.completedAt !== undefined && typeof t.completedAt !== 'number') return false;
        if (t.priority !== undefined && !['alta', 'media', 'baja'].includes(t.priority)) return false;
        return true;
      });
    }
  } catch (error) {
    console.error('Error de lectura en LocalStorage para tareas:', error);
  }
  return fallback;
}

/**
 * Safely saves tasks to LocalStorage
 * [PARCHE DEFENSIVO SEC-002]
 */
export function saveTasksToStorage(tasks: Task[]): boolean {
  try {
    const serialized = JSON.stringify(tasks);
    if (byteSize(serialized) > MAX_TASKS_STORAGE_BYTES) {
      console.warn('[SEC-002] Tamaño de tareas excede el límite defensivo (3MB). Escritura abortada.');
      return false;
    }
    localStorage.setItem(TASKS_KEY, serialized);
    return true;
  } catch (error) {
    console.error('Error de escritura en LocalStorage para tareas:', error);
    return false;
  }
}

/**
 * Safely reads UserProfile from LocalStorage with runtime validation
 */
export function loadProfileFromStorage(fallback: UserProfile): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      // Proteger contra prototype pollution
      if ('__proto__' in parsed || 'constructor' in parsed || 'prototype' in parsed) {
        return fallback;
      }
      const validTheme = ['warm', 'light', 'dark'].includes(parsed.theme) ? parsed.theme : 'warm';
      return {
        nombre: typeof parsed.nombre === 'string' ? parsed.nombre.trim().slice(0, 64) : fallback.nombre,
        apellidos: typeof parsed.apellidos === 'string' ? parsed.apellidos.trim().slice(0, 64) : fallback.apellidos,
        avatarUrl: sanitizeAvatarUrl(parsed.avatarUrl),
        bio: typeof parsed.bio === 'string' ? parsed.bio.trim().slice(0, 500) : fallback.bio,
        theme: validTheme,
        plan: typeof parsed.plan === 'string' ? parsed.plan.slice(0, 64) : fallback.plan,
      };
    }
  } catch (error) {
    console.error('Error de lectura en LocalStorage para perfil:', error);
  }
  return fallback;
}

/**
 * Safely saves UserProfile to LocalStorage with sanitized URLs and quota guard
 * [PARCHE DEFENSIVO SEC-002]
 */
export function saveProfileToStorage(profile: UserProfile): boolean {
  try {
    const sanitizedProfile: UserProfile = {
      ...profile,
      nombre: profile.nombre.trim().slice(0, 64),
      apellidos: profile.apellidos.trim().slice(0, 64),
      avatarUrl: sanitizeAvatarUrl(profile.avatarUrl),
      bio: profile.bio ? profile.bio.trim().slice(0, 500) : undefined,
      theme: profile.theme || 'warm',
    };
    const serialized = JSON.stringify(sanitizedProfile);
    if (byteSize(serialized) > MAX_PROFILE_STORAGE_BYTES) {
      console.warn('[SEC-002] Perfil excede el límite defensivo (512KB). Escritura abortada.');
      return false;
    }
    localStorage.setItem(PROFILE_KEY, serialized);
    return true;
  } catch (error) {
    console.error('Error de escritura en LocalStorage para perfil:', error);
    return false;
  }
}


/**
 * Checks if onboarding has been completed
 */
export function isOnboardingCompleted(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Saves onboarding completed state
 */
export function setOnboardingCompleted(completed: boolean): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, completed ? 'true' : 'false');
  } catch (error) {
    console.error('Error guardando estado de onboarding:', error);
  }
}
