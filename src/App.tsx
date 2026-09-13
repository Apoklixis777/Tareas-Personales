import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MisTareasScreen } from './components/MisTareasScreen';
import { AjustesScreen } from './components/AjustesScreen';
import { Toast } from './components/Toast';
import { OnboardingModal } from './components/OnboardingModal';
import { PWAUpdateModal } from './components/PWAUpdateModal';
import { usePWAUpdate } from './hooks/usePWAUpdate';
import { Task, UserProfile, ScreenType, TaskPriority } from './types';
import {
  loadTasksFromStorage,
  saveTasksToStorage,
  loadProfileFromStorage,
  saveProfileToStorage,
  isOnboardingCompleted,
  setOnboardingCompleted,
} from './utils/storage';

const INITIAL_TASKS: Task[] = [];

const DEFAULT_PROFILE: UserProfile = {
  nombre: 'Carlos',
  apellidos: 'García',
  avatarUrl: '', // Avatar con iniciales por defecto
  plan: 'PERFIL PERSONAL',
};

export default function App() {
  const { hasUpdate, updateApp } = usePWAUpdate();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('mis-tareas');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check if onboarding tutorial has been completed
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(() => !isOnboardingCompleted());

  // Load tasks from LocalStorage safely
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage(INITIAL_TASKS));

  // Load profile from LocalStorage safely
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadProfileFromStorage(DEFAULT_PROFILE));

  // Save tasks to LocalStorage safely
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  // Save profile to LocalStorage safely
  useEffect(() => {
    saveProfileToStorage(userProfile);
  }, [userProfile]);

  // Synchronize theme with html data-theme attribute and meta theme-color tag
  useEffect(() => {
    const activeTheme = userProfile.theme || 'warm';
    document.documentElement.setAttribute('data-theme', activeTheme);
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const colorMap = {
        warm: '#ac2d00',
        light: '#4f46e5',
        dark: '#0f172a',
      };
      metaThemeColor.setAttribute('content', colorMap[activeTheme] || '#ac2d00');
    }
  }, [userProfile.theme]);



  // Listen to hash changes for navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'ajustes') {
        setCurrentScreen('ajustes');
      } else if (hash === 'mis-tareas') {
        setCurrentScreen('mis-tareas');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleAddTask = (text: string, priority: TaskPriority = 'media', description?: string) => {
    // [PARCHE DEFENSIVO SEC-007]
    // Validar longitud y tipo de 'text' antes de crear la tarea.
    if (typeof text !== 'string' || text.trim().length === 0) return;
    if (text.length > 4096) {
      showToast('El texto de la tarea es demasiado largo (máx. 4096 caracteres).');
      return;
    }
    if (description && description.length > 10000) {
      showToast('La descripción es demasiado larga (máx. 10000 caracteres).');
      return;
    }
    const VALID_PRIORITIES: TaskPriority[] = ['alta', 'media', 'baja'];
    let safePriority = priority;
    if (!VALID_PRIORITIES.includes(safePriority)) {
      safePriority = 'media';
    }

    const newTask: Task = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
      text: text.trim(),
      description: description?.trim() || undefined,
      completed: false,
      createdAt: Date.now(),
      priority: safePriority,
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast('Nueva tarea añadida');
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const nextState = !task.completed;
          showToast(nextState ? 'Tarea completada 🎉' : 'Tarea marcada como pendiente');
          return {
            ...task,
            completed: nextState,
            completedAt: nextState ? Date.now() : undefined,
          };
        }
        return task;
      })
    );
  };


  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    showToast('Tarea eliminada');
  };

  const handleUpdateTask = (
    id: string,
    newText: string,
    priority?: TaskPriority,
    dueDate?: number | null,
    description?: string | null
  ) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              text: newText,
              priority: priority || task.priority,
              dueDate: dueDate === null ? undefined : (dueDate !== undefined ? dueDate : task.dueDate),
              description: description === null ? undefined : (description !== undefined ? description.trim() : task.description),
            }
          : task
      )
    );
    showToast('Tarea actualizada correctamente');
  };



  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
  };

  const handleReorderTasks = (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks);
  };

  const handleCloseTutorial = () => {
    setOnboardingCompleted(true);
    setIsTutorialOpen(false);
  };


  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#1e1b18] font-sans antialiased flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        userProfile={userProfile}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
      />

      {/* Header */}
      <Header
        userProfile={userProfile}
        onNavigate={setCurrentScreen}
        onSaveProfile={handleSaveProfile}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
      />


      {/* Main Content Area */}
      <main className="pl-0 md:pl-72 pt-16 flex-1 min-h-[calc(100vh-64px)] transition-all duration-300">
        {currentScreen === 'mis-tareas' ? (
          <MisTareasScreen
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
            onReorderTasks={handleReorderTasks}
          />
        ) : (
          <AjustesScreen
            userProfile={userProfile}
            onSaveProfile={handleSaveProfile}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Interactive Onboarding Tutorial */}
      <OnboardingModal
        isOpen={isTutorialOpen}
        onClose={handleCloseTutorial}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
      />


      {/* Mandatory PWA Update Modal */}
      <PWAUpdateModal isOpen={hasUpdate} onUpdate={updateApp} />

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}




