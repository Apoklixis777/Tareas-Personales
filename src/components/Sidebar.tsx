import React from 'react';
import { ScreenType, UserProfile, APP_VERSION } from '../types';


interface SidebarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  userProfile?: UserProfile;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenTutorial?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  userProfile,
  isMobileOpen,
  onCloseMobile,
  onOpenTutorial,
}) => {

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, screen: ScreenType) => {
    e.preventDefault();
    onNavigate(screen);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const fullName = userProfile
    ? `${userProfile.nombre || ''} ${userProfile.apellidos || ''}`.trim() || 'Usuario'
    : 'Usuario';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation Drawer */}
      <aside
        id="main-sidebar"
        className={`fixed left-0 top-0 h-full w-72 bg-[#fbf2ed] border-r border-[#e4beb4]/40 z-50 flex flex-col pt-4 pb-6 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo Header */}
        <div id="sidebar-logo-container" className="px-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              id="logo-badge"
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ac2d00] to-[#ff9800] flex items-center justify-center text-white shadow-md"
            >
              <span className="material-symbols-outlined text-[24px]">task_alt</span>
            </div>
            <div className="flex flex-col">
              <span id="logo-title" className="font-bold text-2xl tracking-tight text-[#ac2d00]">
                TaskFlow
              </span>
              <span className="text-[10px] text-[#5b4139] uppercase font-bold tracking-widest">
                Gestor Personal
              </span>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-[#5b4139] hover:bg-[#efe6e2]"
            aria-label="Cerrar menú"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav id="sidebar-nav" className="flex-1 px-4 space-y-2">
          <a
            id="nav-link-mis-tareas"
            data-path="mis-tareas"
            href="#mis-tareas"
            onClick={(e) => handleNavClick(e, 'mis-tareas')}
            aria-current={currentScreen === 'mis-tareas' ? 'page' : undefined}
            className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group cursor-pointer ${
              currentScreen === 'mis-tareas'
                ? 'bg-[#d53e0b] text-[#fffbff] font-semibold shadow-md shadow-[#d53e0b]/20 translate-x-1'
                : 'text-[#5b4139] hover:bg-[#efe6e2] hover:text-[#1e1b18]'
            }`}
          >
            <span className="material-symbols-outlined mr-3 text-[22px]">checklist</span>
            <span className="text-sm font-medium">Mis Tareas</span>
          </a>

          <a
            id="nav-link-ajustes"
            data-path="ajustes"
            href="#ajustes"
            onClick={(e) => handleNavClick(e, 'ajustes')}
            aria-current={currentScreen === 'ajustes' ? 'page' : undefined}
            className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group cursor-pointer ${
              currentScreen === 'ajustes'
                ? 'bg-[#d53e0b] text-[#fffbff] font-semibold shadow-md shadow-[#d53e0b]/20 translate-x-1'
                : 'text-[#5b4139] hover:bg-[#efe6e2] hover:text-[#1e1b18]'
            }`}
          >
            <span className="material-symbols-outlined mr-3 text-[22px]">settings</span>
            <span className="text-sm font-medium">Ajustes</span>
          </a>
        </nav>

        {/* Sidebar Footer Info */}
        <div id="sidebar-footer" className="px-6 pt-4 border-t border-[#e4beb4]/40 space-y-2.5">
          {onOpenTutorial && (
            <button
              type="button"
              onClick={() => {
                onOpenTutorial();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[#5b4139] hover:bg-[#efe6e2] hover:text-[#ac2d00] transition-all cursor-pointer text-xs font-semibold border border-transparent hover:border-[#e4beb4]/50"
            >
              <span className="material-symbols-outlined text-[20px] text-[#ac2d00]">help</span>
              <span>Ver Tutorial Interactivo</span>
            </button>
          )}

          <div
            id="footer-storage-badge"
            className="flex items-center gap-2.5 text-xs text-[#5b4139] bg-[#f5ece7] p-3 rounded-xl border border-[#e4beb4]/40"
          >
            <span className="material-symbols-outlined text-[18px] text-[#ac2d00]">sd_card</span>
            <div className="flex flex-col">
              <span className="font-semibold text-[#1e1b18]">LocalStorage</span>
              <span className="text-[11px] text-[#5b4139]">Persistencia local</span>
            </div>
          </div>

          <div className="text-[11px] text-center text-[#5b4139]/70">
            TaskFlow v{APP_VERSION} &bull; Español
          </div>

        </div>
      </aside>

    </>
  );
};

