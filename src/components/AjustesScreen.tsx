import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ThemeType } from '../types';
import { compressImageFile } from '../utils/image';

interface AjustesScreenProps {
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onShowToast: (message: string) => void;
}

const PRESET_AVATARS = [
  { label: 'Avatar 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' },
  { label: 'Avatar 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' },
  { label: 'Avatar 3', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300' },
  { label: 'Avatar 4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300' },
];

export const AjustesScreen: React.FC<AjustesScreenProps> = ({
  userProfile,
  onSaveProfile,
  onShowToast,
}) => {
  const [nombre, setNombre] = useState(userProfile.nombre || '');
  const [apellidos, setApellidos] = useState(userProfile.apellidos || '');
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatarUrl || '');
  const [bio, setBio] = useState(userProfile.bio || '');
  const [theme, setTheme] = useState<ThemeType>(userProfile.theme || 'warm');
  const [isSaving, setIsSaving] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNombre(userProfile.nombre || '');
    setApellidos(userProfile.apellidos || '');
    setAvatarUrl(userProfile.avatarUrl || '');
    setBio(userProfile.bio || '');
    setTheme(userProfile.theme || 'warm');
    setImageError(false);
  }, [userProfile]);

  const fullName = `${nombre} ${apellidos}`.trim() || 'Usuario Demo';

  const getInitials = () => {
    const n = nombre.trim();
    const a = apellidos.trim();
    const firstInitial = n ? n[0].toUpperCase() : 'U';
    const lastInitial = a ? a[0].toUpperCase() : 'D';
    return `${firstInitial}${lastInitial}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const base64 = await compressImageFile(file, 256);
      setAvatarUrl(base64);
      setImageError(false);
      onShowToast('Imagen comprimida e integrada en tu perfil');
    } catch (err: any) {
      onShowToast(err?.message || 'Error al procesar la imagen');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      onSaveProfile({
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        avatarUrl: avatarUrl.trim(),
        bio: bio.trim(),
        theme,
        plan: userProfile.plan || 'PERFIL PERSONAL',
      });
      setIsSaving(false);
      onShowToast('Perfil de usuario guardado correctamente');
    }, 400);
  };



  return (
    <div id="screen-ajustes" className="flex flex-col w-full relative min-h-[calc(100vh-64px)] overflow-hidden">
      {/* Input oculto para subir imágenes locales */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#ffdbd1]/30 blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#ffdcbe]/40 blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-8 py-8 flex-1 flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1 mb-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1e1b18]">Ajustes de Perfil</h1>
          <p className="text-sm sm:text-base text-[#5b4139]">
            Personaliza tus datos. Puedes subir directamente tu foto local (se guardará comprimida en tu LocalStorage).
          </p>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
          {/* 1. Avatar Preview Card (Top on Mobile, Left on Desktop) */}
          <div className="w-full lg:col-span-4 order-1">
            <div className="bg-white rounded-3xl p-8 flex flex-col items-center text-center shadow-md border border-[#efe6e2] relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#ffdbd1]/60 to-transparent pointer-events-none"></div>

              <div className="relative z-10 mb-3 group flex flex-col items-center">
                {avatarUrl && !imageError ? (
                  <img
                    id="avatar-preview"
                    src={avatarUrl}
                    alt={fullName}
                    onError={() => setImageError(true)}
                    className="w-32 h-32 rounded-full object-cover shadow-md ring-4 ring-[#d53e0b]/20"
                  />
                ) : (
                  <div
                    id="avatar-preview-fallback"
                    className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#ac2d00] to-[#ff9800] text-white flex items-center justify-center text-3xl font-bold ring-4 ring-[#d53e0b]/20 shadow-md"
                  >
                    {getInitials()}
                  </div>
                )}

                {/* Subir foto local button directly on preview */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-[#f5ece7] text-[#ac2d00] hover:bg-[#ac2d00] hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-[#e4beb4]/60 shadow-xs active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                  <span>{isUploading ? 'Comprimiendo...' : 'Subir foto local'}</span>
                </button>
              </div>

              <h2 id="display-name" className="text-xl font-bold text-[#1e1b18] mb-1">
                {fullName}
              </h2>
              <span className="bg-[#d53e0b] text-[#fffbff] px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-xs mb-2">
                {userProfile.plan || 'PERFIL PERSONAL'}
              </span>

              {bio && (
                <p className="text-xs text-[#5b4139] italic my-2 px-2 max-w-xs leading-relaxed break-words">
                  "{bio}"
                </p>
              )}

              {/* Preset Avatars quick selection */}

              <div className="w-full pt-4 border-t border-[#efe6e2] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#5b4139]">Avatares sugeridos:</span>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarUrl('');
                        setImageError(false);
                      }}
                      className="text-xs font-bold text-[#ac2d00] hover:underline cursor-pointer"
                    >
                      Usar iniciales
                    </button>
                  )}
                </div>
                <div className="flex justify-center gap-2">
                  {PRESET_AVATARS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatarUrl(preset.url);
                        setImageError(false);
                      }}
                      className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-[#ac2d00] transition-all cursor-pointer shadow-xs focus:ring-2 focus:ring-[#ac2d00]"
                      title={`Seleccionar ${preset.label}`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>


          {/* 2. Personal Information Form (Middle on Mobile, Right on Desktop) */}
          <div className="w-full lg:col-span-8 order-2 lg:order-2 lg:row-span-2">
            <form
              id="settings-form"
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col gap-6 border border-[#efe6e2]"
            >
              <div className="flex items-center gap-3 border-b border-[#efe6e2] pb-4">
                <div className="w-9 h-9 rounded-xl bg-[#f5ece7] text-[#ac2d00] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">badge</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1e1b18]">Datos Personales</h3>
                  <p className="text-xs text-[#5b4139]">Edita tu nombre, apellidos e imagen de avatar</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="input-nombre" className="text-xs font-bold text-[#5b4139] ml-1">
                    Nombre
                  </label>
                  <input
                    id="input-nombre"
                    name="nombre"
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full bg-[#fbf2ed] text-[#1e1b18] text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#ac2d00]/40 border border-transparent focus:border-[#ac2d00]"
                  />
                </div>

                {/* Apellidos */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="input-apellidos" className="text-xs font-bold text-[#5b4139] ml-1">
                    Apellidos
                  </label>
                  <input
                    id="input-apellidos"
                    name="apellidos"
                    type="text"
                    required
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    placeholder="Tus apellidos"
                    className="w-full bg-[#fbf2ed] text-[#1e1b18] text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#ac2d00]/40 border border-transparent focus:border-[#ac2d00]"
                  />
                </div>

                {/* Un poco sobre ti */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label htmlFor="input-bio" className="text-xs font-bold text-[#5b4139] ml-1">
                    Un poco sobre ti
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-[#5b4139]/60 pointer-events-none text-[20px]">
                      face
                    </span>
                    <textarea
                      id="input-bio"
                      name="bio"
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Escribe una breve presentación sobre ti (ej: Apasionado por la productividad y el diseño)..."
                      className="w-full bg-[#fbf2ed] text-[#1e1b18] text-sm rounded-xl pl-11 pr-4 py-3 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#ac2d00]/40 border border-transparent focus:border-[#ac2d00] resize-y"
                    />
                  </div>
                  <p className="text-[11px] text-[#5b4139] ml-1">
                    Esta información es opcional y sirve para personalizar tu tarjeta de perfil.
                  </p>
                </div>
              </div>

              {/* Apariencia y Tema Visual */}
              <div className="pt-6 border-t border-[#efe6e2] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ac2d00] text-[22px]">palette</span>
                  <div>
                    <h3 className="text-base font-bold text-[#1e1b18]">Apariencia y Tema Visual</h3>
                    <p className="text-xs text-[#5b4139]">Elige el tema que mejor se adapte a tu estilo visual</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* 1. Cálido (Terracota) */}
                  <div
                    onClick={() => setTheme('warm')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center gap-2 relative overflow-hidden ${
                      theme === 'warm'
                        ? 'border-[#ac2d00] bg-[#fff8f5] ring-2 ring-[#ac2d00]/20 shadow-md'
                        : 'border-[#efe6e2] bg-white hover:border-[#e4beb4]'
                    }`}
                  >
                    {theme === 'warm' && (
                      <span className="absolute top-2 right-2 text-[#ac2d00] material-symbols-outlined text-[18px]">check_circle</span>
                    )}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ac2d00] to-[#ff9800] text-white flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[20px]">wb_sunny</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1e1b18]">Cálido (Predeterminado)</div>
                      <div className="text-[10px] text-[#5b4139]">Tonos terracota & durazno</div>
                    </div>
                  </div>

                  {/* 2. Claro Neutro */}
                  <div
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center gap-2 relative overflow-hidden ${
                      theme === 'light'
                        ? 'border-[#4f46e5] bg-[#f8fafc] ring-2 ring-[#4f46e5]/20 shadow-md'
                        : 'border-[#efe6e2] bg-white hover:border-[#cbd5e1]'
                    }`}
                  >
                    {theme === 'light' && (
                      <span className="absolute top-2 right-2 text-[#4f46e5] material-symbols-outlined text-[18px]">check_circle</span>
                    )}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4f46e5] to-[#06b6d4] text-white flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[20px]">light_mode</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1e1b18]">Claro Neutro</div>
                      <div className="text-[10px] text-[#5b4139]">Índigo limpio & gris suave</div>
                    </div>
                  </div>

                  {/* 3. Oscuro Elegante */}
                  <div
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center gap-2 relative overflow-hidden ${
                      theme === 'dark'
                        ? 'border-[#f97316] bg-[#0f172a] text-white ring-2 ring-[#f97316]/20 shadow-md'
                        : 'border-[#efe6e2] bg-[#1e293b] text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    {theme === 'dark' && (
                      <span className="absolute top-2 right-2 text-[#f97316] material-symbols-outlined text-[18px]">check_circle</span>
                    )}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ea580c] to-[#eab308] text-white flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[20px]">dark_mode</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold">Oscuro Elegante</div>
                      <div className="text-[10px] opacity-80">Carbón profundo & ámbar</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}

              <div className="flex items-center justify-between pt-6 border-t border-[#efe6e2]">
                <button
                  type="button"
                  onClick={() => {
                    setNombre(userProfile.nombre);
                    setApellidos(userProfile.apellidos);
                    setAvatarUrl(userProfile.avatarUrl);
                    setBio(userProfile.bio || '');
                    setImageError(false);

                  }}
                  className="text-xs font-semibold text-[#5b4139] hover:text-[#1e1b18] cursor-pointer"
                >
                  Restablecer campos
                </button>

                <button
                  id="btn-submit"
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#ac2d00] text-white font-semibold text-sm px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md hover:bg-[#b02e00] active:scale-95 disabled:opacity-75 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">save</span>
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* 3. LocalStorage Status Card (Bottom on Mobile, Left on Desktop) */}
          <div className="w-full lg:col-span-4 order-3 lg:order-3">
            <div className="bg-[#f5ece7] rounded-2xl p-5 flex gap-3.5 items-start shadow-xs border border-[#e4beb4]/50">
              <div className="bg-white p-2.5 rounded-xl text-[#ac2d00] shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[22px]">sd_card</span>
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-xs font-bold text-[#1e1b18] uppercase tracking-wider">Persistencia Local</h4>
                <p className="text-xs text-[#5b4139] leading-relaxed">
                  Tus datos se guardan directamente en el <strong>LocalStorage</strong> de tu navegador. Permanecerán guardados cada vez que abras la aplicación.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

