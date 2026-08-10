import { Task, UserProfile } from '../types';

const TASKS_KEY = 'taskflow_tasks';
const PROFILE_KEY = 'taskflow_user_profile';
const ONBOARDING_KEY = 'taskflow_onboarding_completed';

/**
 * Validates and sanitizes avatar URL to prevent XSS (e.g. javascript: protocols)
 */
export function sanitizeAvatarUrl(url: string | undefined): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
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
 */
export function loadTasksFromStorage(fallback: Task[]): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (t) =>
          t &&
          typeof t.id === 'string' &&
          typeof t.text === 'string' &&
          typeof t.completed === 'boolean'
      );
    }
  } catch (error) {
    console.error('Error de lectura en LocalStorage para tareas:', error);
  }
  return fallback;
}

/**
 * Safely saves tasks to LocalStorage
 */
export function saveTasksToStorage(tasks: Task[]): boolean {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
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
    if (parsed && typeof parsed === 'object') {
      return {
        nombre: typeof parsed.nombre === 'string' ? parsed.nombre.trim() : fallback.nombre,
        apellidos: typeof parsed.apellidos === 'string' ? parsed.apellidos.trim() : fallback.apellidos,
        avatarUrl: sanitizeAvatarUrl(parsed.avatarUrl),
        bio: typeof parsed.bio === 'string' ? parsed.bio.trim() : fallback.bio,
        plan: typeof parsed.plan === 'string' ? parsed.plan : fallback.plan,
      };
    }
  } catch (error) {
    console.error('Error de lectura en LocalStorage para perfil:', error);
  }
  return fallback;
}

/**
 * Safely saves UserProfile to LocalStorage with sanitized URLs
 */
export function saveProfileToStorage(profile: UserProfile): boolean {
  try {
    const sanitizedProfile: UserProfile = {
      ...profile,
      nombre: profile.nombre.trim(),
      apellidos: profile.apellidos.trim(),
      avatarUrl: sanitizeAvatarUrl(profile.avatarUrl),
      bio: profile.bio ? profile.bio.trim() : undefined,
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(sanitizedProfile));
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
