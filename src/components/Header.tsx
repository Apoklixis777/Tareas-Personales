import React, { useState } from 'react';
import { UserProfile, ScreenType, ThemeType } from '../types';

interface HeaderProps {
  userProfile: UserProfile;
  onNavigate: (screen: ScreenType) => void;
  onSaveProfile?: (profile: UserProfile) => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  onNavigate,
  onSaveProfile,
  onToggleMobileMenu,
  isMobileMenuOpen,
}) => {
  const [imageError, setImageError] = useState(false);
  const fullName = `${userProfile.nombre || ''} ${userProfile.apellidos || ''}`.trim() || 'Usuario Demo';

  const getInitials = () => {
    const n = (userProfile.nombre || '').trim();
    const a = (userProfile.apellidos || '').trim();
    const firstInitial = n ? n[0].toUpperCase() : 'U';
    const lastInitial = a ? a[0].toUpperCase() : 'D';
    return `${firstInitial}${lastInitial}`;
  };

  const handleToggleTheme = () => {
    const current = userProfile.theme || 'warm';
    const nextTheme: ThemeType = current === 'warm' ? 'light' : current === 'light' ? 'dark' : 'warm';
    if (onSaveProfile) {
      onSaveProfile({ ...userProfile, theme: nextTheme });
    }
  };

  const getThemeIcon = () => {
    switch (userProfile.theme) {
      case 'light':
        return 'light_mode';
      case 'dark':
        return 'dark_mode';
      case 'warm':
      default:
        return 'palette';
    }
  };

  return (
    <header
      id="main-header"
      className="fixed top-0 left-0 md:left-72 right-0 h-16 bg-[#fff8f5]/90 backdrop-blur-md border-b border-[#e4beb4]/40 z-30 flex items-center justify-between px-4 md:px-8 gap-4 transition-all"
    >
      {/* Mobile left side: Menu toggle + Brand */}
      <div id="mobile-brand" className="flex items-center gap-3 md:hidden">
        <button
          id="btn-mobile-menu"
          type="button"
          onClick={onToggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          className="p-2 rounded-xl text-[#5b4139] hover:bg-[#efe6e2] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">
            {isMobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>

        <div
          onClick={() => onNavigate('mis-tareas')}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ac2d00] to-[#ff9800] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <span className="material-symbols-outlined text-[18px]">task_alt</span>
          </div>
          <span className="font-bold text-lg text-[#ac2d00] tracking-tight">TaskFlow</span>
        </div>
      </div>

      {/* Desktop title indicator */}
      <div className="hidden md:flex items-center gap-2 text-xs font-medium text-[#5b4139]">
        <span className="w-2 h-2 rounded-full bg-[#d53e0b] animate-pulse"></span>
        <span>Modo LocalStorage | En línea</span>
      </div>

      {/* Profile & Quick Settings action */}
      <div id="header-right-actions" className="flex items-center gap-2.5 ml-auto">
        {/* Quick Theme Switcher Button */}
        {onSaveProfile && (
          <button
            type="button"
            onClick={handleToggleTheme}
            className="p-2 rounded-xl text-[#5b4139] hover:bg-[#efe6e2] hover:text-[#ac2d00] transition-colors cursor-pointer flex items-center justify-center border border-transparent hover:border-[#e4beb4]/60"
            title={`Tema actual: ${userProfile.theme || ' warm'}. Hacer clic para cambiar de tema`}
          >
            <span className="material-symbols-outlined text-[22px]">{getThemeIcon()}</span>
          </button>
        )}

        <button
          id="btn-profile-header"

          type="button"
          onClick={() => onNavigate('ajustes')}
          className="flex items-center gap-3 pl-3 py-1 rounded-2xl hover:bg-[#efe6e2]/60 transition-all text-left cursor-pointer group"
          title="Ir a Ajustes de Perfil"
        >
          <div id="header-user-text" className="text-right hidden sm:block">
            <div id="header-user-name" className="text-sm font-semibold text-[#1e1b18] group-hover:text-[#ac2d00] transition-colors truncate max-w-[150px]">
              {fullName}
            </div>
            <div id="header-user-plan" className="text-[10px] text-[#5b4139] uppercase tracking-wider font-semibold">
              {userProfile.plan || 'PERFIL PERSONAL'}
            </div>
          </div>

          {userProfile.avatarUrl && !imageError ? (
            <img
              id="header-user-avatar"
              src={userProfile.avatarUrl}
              alt={fullName}
              onError={() => setImageError(true)}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#d53e0b] shadow-sm transition-transform group-hover:scale-105"
            />
          ) : (
            <div
              id="header-user-avatar-fallback"
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#ac2d00] to-[#ff9800] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#d53e0b] shadow-sm transition-transform group-hover:scale-105"
            >
              {getInitials()}
            </div>
          )}
        </button>
      </div>
    </header>
  );
};

