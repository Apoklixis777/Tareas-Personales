import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { compressImageFile } from '../utils/image';


interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

interface StepContent {
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  description: string;
  demoType: 'welcome' | 'priority' | 'drag' | 'profile';
}

const PRESET_AVATARS = [
  { label: 'Avatar 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' },
  { label: 'Avatar 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' },
  { label: 'Avatar 3', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300' },
  { label: 'Avatar 4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300' },
];

const STEPS: StepContent[] = [
  {
    title: '¡Bienvenido a TaskFlow!',
    subtitle: 'Tu gestor de tareas personal, rápido y elegante.',
    icon: 'task_alt',
    badge: 'Paso 1 de 4',
    description:
      'Diseñado para ayudarte a concentrarte en lo importante con un estilo cálido, responsive y con persistencia automática en tu navegador (LocalStorage).',
    demoType: 'welcome',
  },
  {
    title: 'Crea, Prioriza y Filtra',
    subtitle: 'Organiza tus actividades con etiquetas de prioridad.',
    icon: 'checklist',
    badge: 'Paso 2 de 4',
    description:
      'Asigna prioridades (Alta, Media, Baja) a tus tareas y usa las pestañas para ver tus tareas pendientes o completadas en cualquier momento.',
    demoType: 'priority',
  },
  {
    title: 'Reordena por Arrastre',
    subtitle: 'Arrastra y suelta en PC o teléfonos móviles.',
    icon: 'drag_indicator',
    badge: 'Paso 3 de 4',
    description:
      'Mantén presionado el icono ⠿ a la izquierda de cualquier tarjeta de tarea para arrastrarla y cambiar su posición instantáneamente.',
    demoType: 'drag',
  },
  {
    title: 'Personaliza tu Cuenta',
    subtitle: 'Ingresa tus datos para empezar con tu perfil listo.',
    icon: 'badge',
    badge: 'Paso 4 de 4',
    description:
      'Configura tu nombre, apellidos y avatar ahora mismo para que la aplicación esté personalizada desde tu primer ingreso.',
    demoType: 'profile',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [demoPriority, setDemoPriority] = useState<'baja' | 'media' | 'alta'>('alta');
  const [demoChecked, setDemoChecked] = useState(false);

  // Profile customization state inside tutorial

  const [nombre, setNombre] = useState(userProfile.nombre || '');
  const [apellidos, setApellidos] = useState(userProfile.apellidos || '');
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatarUrl || '');
  const [bio, setBio] = useState(userProfile.bio || '');
  const [imageError, setImageError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNombre(userProfile.nombre || '');
    setApellidos(userProfile.apellidos || '');
    setAvatarUrl(userProfile.avatarUrl || '');
    setBio(userProfile.bio || '');
    setImageError(false);
  }, [userProfile]);

  // Lock body scroll when modal is active to prevent horizontal/vertical page shift
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

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
    } catch (err: any) {
      alert(err?.message || 'Error al procesar la imagen.');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleFinish = () => {
    onSaveProfile({
      nombre: nombre.trim() || 'Carlos',
      apellidos: apellidos.trim() || 'García',
      avatarUrl: avatarUrl.trim() || '',
      bio: bio.trim() || undefined,
      plan: userProfile.plan || 'PERFIL PERSONAL',
    });
    onClose();
  };


  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-x-hidden overflow-y-auto">
      <div className="bg-white w-[calc(100vw-1.5rem)] sm:w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-[#efe6e2] overflow-hidden flex flex-col relative transition-all max-h-[90vh] my-auto shrink-0">

        {/* Top ambient color bar */}
        <div className="h-1.5 sm:h-2 w-full bg-gradient-to-r from-[#ac2d00] via-[#d53e0b] to-[#ff9800] shrink-0" />

        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-[#efe6e2]/40 shrink-0">
          <span className="bg-[#f5ece7] text-[#ac2d00] font-bold text-[11px] sm:text-xs px-2.5 py-0.5 sm:py-1 rounded-full uppercase tracking-wider">
            {step.badge}
          </span>
          <button
            type="button"
            onClick={handleFinish}
            className="text-[#5b4139]/70 hover:text-[#1e1b18] text-xs font-semibold px-2 py-1 rounded-lg hover:bg-[#efe6e2] transition-colors cursor-pointer"
          >
            Omitir
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col items-center text-center space-y-3 overflow-y-auto max-h-[65vh] w-full">
          {/* Main Step Icon */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#ac2d00] to-[#ff9800] text-white flex items-center justify-center shadow-md shadow-[#ac2d00]/20 transform transition-transform hover:scale-105 shrink-0">
            <span className="material-symbols-outlined text-[28px] sm:text-[32px]">{step.icon}</span>
          </div>

          <div className="space-y-0.5 sm:space-y-1 w-full">
            <h2 className="text-lg sm:text-2xl font-bold text-[#1e1b18] tracking-tight">{step.title}</h2>
            <p className="text-[11px] sm:text-xs font-semibold text-[#ac2d00]">{step.subtitle}</p>
          </div>

          <p className="text-xs sm:text-sm text-[#5b4139] leading-relaxed max-w-md px-1">{step.description}</p>

          {/* Interactive Demo Box per Step */}
          <div className="w-full bg-[#fbf2ed] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#e4beb4]/40 text-left my-1 shadow-inner overflow-hidden">
            {step.demoType === 'welcome' && (
              <div className="flex items-center justify-between gap-2 bg-white p-2.5 sm:p-3 rounded-xl border border-[#efe6e2] shadow-xs max-w-full overflow-hidden">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-5 h-5 rounded-full bg-[#ac2d00] text-white flex items-center justify-center text-xs shrink-0">
                    ✓
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#1e1b18] truncate">¡Tu primera tarea te espera!</div>
                    <div className="text-[10px] text-[#5b4139] truncate">Creada hace un momento &bull; Alta</div>
                  </div>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-[#ac2d00] bg-[#ffdad6] px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                  EJEMPLO
                </span>
              </div>
            )}

            {step.demoType === 'priority' && (
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-[#5b4139]">Prueba cambiar la prioridad:</div>
                <div className="flex gap-1.5 sm:gap-2 justify-center flex-wrap">
                  {(['baja', 'media', 'alta'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDemoPriority(p)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                        demoPriority === p
                          ? 'bg-[#ac2d00] text-white shadow-xs'
                          : 'bg-white text-[#5b4139] border border-[#efe6e2]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#efe6e2] flex items-center justify-between gap-2 text-xs">
                  <span className="truncate">Tarea interactiva</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border shrink-0 ${
                      demoPriority === 'alta'
                        ? 'bg-[#ffdad6] text-[#93000a] border-[#ffb5a0]'
                        : demoPriority === 'baja'
                        ? 'bg-[#e6e2d9] text-[#4d4739] border-[#c9c6be]'
                        : 'bg-[#ffdcbe] text-[#653900] border-[#ffb870]'
                    }`}
                  >
                    {demoPriority}
                  </span>
                </div>
              </div>
            )}

            {step.demoType === 'drag' && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#5b4139]">Haz clic en el check o arrastra:</div>
                <div
                  onClick={() => setDemoChecked((prev) => !prev)}
                  className="bg-white p-2.5 sm:p-3 rounded-xl border border-[#efe6e2] flex items-center gap-2.5 cursor-pointer select-none hover:border-[#ac2d00] transition-colors"
                >
                  <span className="material-symbols-outlined text-gray-400 shrink-0">drag_indicator</span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all shrink-0 ${
                      demoChecked ? 'bg-[#ac2d00] text-white' : 'border-2 border-[#8f7068]'
                    }`}
                  >
                    {demoChecked && <span className="material-symbols-outlined text-[14px]">check</span>}
                  </div>
                  <span className={`text-xs font-medium truncate ${demoChecked ? 'line-through text-gray-400' : 'text-[#1e1b18]'}`}>
                    Probar interactividad del tutorial
                  </span>
                </div>
              </div>
            )}

            {step.demoType === 'profile' && (
              <div className="space-y-2.5 bg-white p-3 sm:p-4 rounded-xl border border-[#efe6e2] shadow-xs">
                {/* Live Preview Header */}
                <div className="flex items-center gap-2.5 border-b border-[#efe6e2] pb-2.5 overflow-hidden">
                  {avatarUrl && !imageError ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      onError={() => setImageError(true)}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-[#ac2d00] shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-[#ac2d00] to-[#ff9800] text-white flex items-center justify-center font-bold text-xs sm:text-sm ring-2 ring-[#ac2d00] shrink-0">
                      {getInitials()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1 text-left">
                    <div className="text-xs sm:text-sm font-bold text-[#1e1b18] truncate">{fullName}</div>
                    <div className="text-[9px] sm:text-[10px] text-[#ac2d00] font-bold uppercase tracking-wider truncate">
                      Vista Previa de tu Perfil
                    </div>
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-[#5b4139]">Nombre</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full bg-[#fbf2ed] text-xs text-[#1e1b18] rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#ac2d00]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-bold text-[#5b4139]">Apellidos</label>
                    <input
                      type="text"
                      value={apellidos}
                      onChange={(e) => setApellidos(e.target.value)}
                      placeholder="Tus apellidos"
                      className="w-full bg-[#fbf2ed] text-xs text-[#1e1b18] rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#ac2d00]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] sm:text-[11px] font-bold text-[#5b4139]">Un poco sobre ti (Opcional)</label>
                    <input
                      type="text"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Ej: Amante del café y de organizar proyectos..."
                      className="w-full bg-[#fbf2ed] text-xs text-[#1e1b18] rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#ac2d00]"
                    />
                  </div>
                </div>


                {/* Preset Avatars Selection & Initials Toggle */}
                <div className="space-y-1.5 text-left">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] sm:text-[11px] font-bold text-[#5b4139] truncate">Elige tu Avatar o sube una foto:</span>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarUrl('');
                          setImageError(false);
                        }}
                        className="text-[10px] font-bold text-[#ac2d00] hover:underline cursor-pointer shrink-0"
                      >
                        Usar iniciales
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#f5ece7] text-[#ac2d00] hover:bg-[#ac2d00] hover:text-white rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer border border-[#e4beb4]/60 shadow-xs"
                      title="Subir foto desde tu dispositivo"
                    >
                      <span className="material-symbols-outlined text-[14px]">add_a_photo</span>
                      <span>{isUploading ? 'Procesando...' : 'Subir foto local'}</span>
                    </button>

                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAvatarUrl(preset.url);
                          setImageError(false);
                        }}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                          avatarUrl === preset.url ? 'border-[#ac2d00] scale-110 shadow-xs' : 'border-transparent opacity-80'
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Step Dots & Navigation Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-[#efe6e2] flex items-center justify-between gap-2 bg-[#fbf2ed]/50 shrink-0">
          {/* Dots Indicator */}
          <div className="flex gap-1.5 shrink-0">
            {STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                aria-label={`Ir al paso ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentStep === idx ? 'w-5 sm:w-6 bg-[#ac2d00]' : 'w-2 bg-[#e4beb4]'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-[#5b4139] hover:text-[#1e1b18] hover:bg-[#efe6e2] rounded-xl transition-colors cursor-pointer"
              >
                Anterior
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="bg-[#ac2d00] text-white text-xs font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-xs hover:shadow-md hover:bg-[#b02e00] transition-all flex items-center gap-1 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <span>{isLastStep ? '¡Comenzar ahora!' : 'Siguiente'}</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


