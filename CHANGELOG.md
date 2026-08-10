# Registro de Cambios (CHANGELOG) - TaskFlow

Todas las modificaciones, mejoras y correcciones de **TaskFlow** se documentan en este archivo en orden cronológico inverso siguiendo las directrices de `changelog-generator` y el estándar de Versionado Semántico (SemVer).

---

## [2.1.4] - 2026-08-10

### 🔄 Sincronización de Versión de Service Worker (`public/sw.js`)
- **Actualización de Nombre de Caché (`taskflow-v2.1.4`)**: Sincronización de `CACHE_NAME` en [public/sw.js](file:///c:/Users/apokl/Desarrollo/Apps%20Curso/Tareas%20Personales/public/sw.js) con el número de versión oficial.
- **Activación del Modal de Actualización PWA**: Al cambiar el contenido del Service Worker byte a byte, el navegador detecta automáticamente la actualización disponible al desplegar la build y despliega el modal interactivo `PWAUpdateModal`.

---

## [2.1.3] - 2026-08-10


### 🛡️ Eliminación de Doble Carga & Aislamiento de Entorno Dev
- **Desactivación de SW en Desarrollo (`import.meta.env.DEV`)**: Configurado en [usePWAUpdate.ts](file:///c:/Users/apokl/Desarrollo/Apps%20Curso/Tareas%20Personales/src/hooks/usePWAUpdate.ts) la desinstalación automática de cualquier Service Worker en modo desarrollo, solucionando la interferencia con el servidor HMR de Vite y eliminando al 100% el parpadeo de "doble carga".
- **Removido `self.clients.claim()` de [sw.js](file:///c:/Users/apokl/Desarrollo/Apps%20Curso/Tareas%20Personales/public/sw.js)**: Evita que el Service Worker tome el control forzado de pestañas activas en segundo plano, garantizando una carga suave e instantánea.

---

## [2.1.2] - 2026-08-10


### 🛠️ Corrección Crítica de Service Worker & Bucle de Recarga PWA
- **Eliminación del Bucle de Recargas (`usePWAUpdate.ts`)**: Se eliminó la escucha automática de `controllerchange` que provocaba un bucle infinito de reinicios del navegador al cargar la PWA.
- **Registro Único del Service Worker**: Se consolidó el registro de `sw.js` evitando registros duplicados entre `index.html` y React.
- **Actualización Controlada**: La recarga de la aplicación se ejecuta **exclusivamente al presionar el botón `Actualizar Aplicación`** en el modal, protegiendo al 100% los datos de `LocalStorage`.

---

## [2.1.1] - 2026-08-10


### 🎯 Acordeón de Fecha Exclusivo (Un solo grupo abierto a la vez)
- **Modo Exclusivo en Completadas y Todas**: Configuración de `expandedGroupKey` en [MisTareasScreen.tsx](file:///c:/Users/apokl/Desarrollo/Apps%20Curso/Tareas%20Personales/src/components/MisTareasScreen.tsx#L130-L155) para que **únicamente el bloque de fecha más reciente esté descolapsado** por defecto.
- **Transición Dinámica al Abrir**: Al hacer clic en un grupo colapsado, este se despliega y cualquier otro grupo abierto se colapsa automáticamente, manteniendo la pantalla impecable y sin desbordamientos.

---

## [2.1.0] - 2026-08-10


### 📅 Agrupamiento Histórico por Fecha Colapsable (Estilo Banca Móvil)
- **Agrupación Automática por Día**: En las pestañas **Completadas** y **Todas**, las tareas se organizan en bloques según su fecha (`Hoy`, `Ayer`, o nombre del día de la semana).
- **Orden Histórico Descendente**: El bloque más reciente (ej. *Hoy*) se posiciona arriba del todo.
- **Secciones Colapsables (Acordeón)**:
  - **El primer día (más reciente)** está **descolapsado / abierto** por defecto.
  - **Los días más antiguos** se muestran **colapsados / cerrados** por defecto para evitar listas infinitas.
  - Cada bloque cuenta con su encabezado interactivo con icono de calendario, insignia con el conteo de tareas y flecha para abrir/cerrar.

---

## [2.0.0] - 2026-08-10


### 🚀 Versión Oficial de Producción & Auto-Actualizaciones PWA
- **Detección Automática de Actualizaciones PWA**: Creación de [usePWAUpdate.ts](file:///c:/Users/apokl/Desarrollo/Apps%20Curso/Tareas%20Personales/src/hooks/usePWAUpdate.ts) y [PWAUpdateModal.tsx](file:///c:/Users/apokl/Desarrollo/Apps%20Curso/Tareas%20Personales/src/components/PWAUpdateModal.tsx) para alertar al usuario inmediatamente cuando una nueva versión se despliega en el servidor.
- **Modal de Actualización Obligatorio**: Presenta la notificación **"¡Nueva Versión de TaskFlow Disponible!"** con un único botón de acción **`🔄 Actualizar Aplicación`** que activa el nuevo Service Worker y recarga la pestaña automáticamente.
- **Actualización del Service Worker (`taskflow-v2.0.0`)**: [sw.js](file:///c:/Users/apokl/Desarrollo/Apps%20Curso/Tareas%20Personales/public/sw.js) soporta el evento de mensaje `SKIP_WAITING` y la gestión limpia de caché.
- **Auditoría de Seguridad Exhaustiva**: Verificación de sanitización Anti-XSS en avatars y campos de texto, validación estricta de esquemas de datos en `LocalStorage` y gestión de errores con `ErrorBoundary.tsx`.

---

## [1.9.1] - 2026-08-10

### 🐛 Corrección de Sobrescrituras CSS de Temas (Parche Hotfix)
- **Transición de Temas en Vivo**: Añadido en [index.css](file:///c:/Users/apokl/Desarrollo/Apps%20Curso/Tareas%20Personales/src/index.css#L60-L170) el mapeo de clases de Tailwind fijos (`bg-[#fff8f5]`, `bg-white`, `text-[#1e1b18]`, `bg-[#fbf2ed]`, etc.) vinculado a `[data-theme="light"]` y `[data-theme="dark"]`.
- **Previsualización Instantánea en Ajustes**: Configurado en [AjustesScreen.tsx](file:///c:/Users/apokl/Desarrollo/Apps%20Curso/Tareas%20Personales/src/components/AjustesScreen.tsx#L290-L360) para aplicar y guardar el tema de inmediato al hacer clic en las tarjetas de previsualización.

---

## [1.9.0] - 2026-08-10


### 🎨 Sistema Multi-Tema (Cálido, Claro y Oscuro) & Sincronización PWA
- **Soporte de 3 Temas Visuales (`theme?: ThemeType`)**:
  - 🌅 **Cálido / Terracota (`'warm'`) [Predeterminado]**: Paleta original rica en tonos terracota, ámbar y durazno suave.
  - ☀️ **Claro Neutro (`'light'`)**: Estilo moderno limpio con acentos índigo (`#4f46e5`), tarjetas blancas puras y fondos neutros.
  - 🌙 **Oscuro Elegante (`'dark'`)**: Modo oscuro refinado con fondos carbón profundo (`#0f172a`), tarjetas pizarra y destellos de color naranja vibrante (`#f97316`).
- **Selector Visual en Ajustes**: Tarjetas interactivas con previsualizaciones de cada tema en [AjustesScreen.tsx](file:///c:/Users/apokl/Desarrollo/Apps%20Curso/Tareas%20Personales/src/components/AjustesScreen.tsx#L280-L360).
- **Conmutador Rápido en Header**: Botón de alternancia rápida con icono dinámico (Sol/Luna/Paleta) en la barra superior para cambiar de tema al instante desde cualquier pantalla.
- **Sincronización PWA Dinámica**: Actualización en tiempo real del atributo `data-theme` y de la meta etiqueta `<meta name="theme-color">` de la aplicación web y PWA.
- **Persistencia de Apariencia**: Guardado automático de la preferencia de tema en `LocalStorage`.

---

## [1.8.0] - 2026-08-10


### 📄 Descripción Larga de Tareas & Rediseño de Perfil ("Un poco sobre ti")
- **Campo de Descripción Opcional**: Añadido soporte para descripciones largas en la creación y edición de tareas (`description?: string`).
- **Formulario Expandible**: Botón **`+ Descripción`** en la barra de creación de tareas que despliega un área de texto multilínea.
- **Botón "Ver Descripción" en Tarjetas**: Si una tarea cuenta con descripción, se renderiza la insignia **`📄 Ver descripción`** en la tarjeta.
- **Modal de Lectura Dedicado (`TaskDescriptionModal`)**: Creación de [TaskDescriptionModal.tsx](file:///c:/Users/apokl/Desarrollo/Apps%20Curso/Tareas%20Personales/src/components/TaskDescriptionModal.tsx) para visualizar la descripción completa, prioridad, estado y sello de fechas en una ventana limpia y responsiva.
- **Eliminación del campo raw URL de Avatar**: Se retiró el campo de texto de URL de imagen del formulario de Ajustes para evitar confusiones con la cadena Base64 comprimida.
- **Nuevo campo "Un poco sobre ti" (`bio`)**: Reemplazado por un campo de biografía/presentación del usuario (`bio?: string`) que se muestra en la tarjeta de previsualización del perfil.


---

## [1.7.1] - 2026-08-10

### 🐛 Corrección de Excepciones React (Parche Hotfix)
- **Reordenamiento de React Hooks**: Corrección del error de reglas de hooks (`Rendered more/fewer hooks than expected`) en [OnboardingModal.tsx](file:///c:/Users/apokl/Desarrollo/Apps%20Curso/Tareas%20Personales/src/components/OnboardingModal.tsx#L80-L105) posicionando incondicionalmente todos los `useState` y `useRef` antes de cualquier retorno temprano `if (!isOpen) return null`.

---

## [1.7.0] - 2026-08-10


### 📷 Subida Directa de Foto de Perfil Local (Base64)
- **Compresión de Imágenes al Vuelo (`compressImageFile`)**: Creación del módulo [image.ts](file:///c:/Users/apokl/Desarrollo/Apps%20Curso/Tareas%20Personales/src/utils/image.ts) que redimensiona y comprime fotos seleccionadas por el usuario a 256x256 px en formato Base64 (~20-40KB).
- **Subida Directa desde el Dispositivo**: Integrado el botón **"Subir foto local"** (`add_a_photo`) en [AjustesScreen.tsx](file:///c:/Users/apokl/Desarrollo/Apps%20Curso/Tareas%20Personales/src/components/AjustesScreen.tsx#L95-L115) y en el tutorial inicial [OnboardingModal.tsx](file:///c:/Users/apokl/Desarrollo/Apps%20Curso/Tareas%20Personales/src/components/OnboardingModal.tsx#L335-L355).
- **Cero Enlaces Externos**: Los usuarios pueden elegir fotos directamente desde su teléfono o computadora sin depender de subir imágenes a servidores de terceros ni pegar enlaces web.
- **Persistencia en LocalStorage**: Las imágenes comprimidas se almacenan directamente en `LocalStorage` junto con el perfil de usuario.

---

## [1.6.0] - 2026-08-10


### ⏱️ Fecha/Hora Tope Opcional & Barra de Avance
- **Selector de Fecha y Hora Tope (`dueDate`)**: Añadido selector `<input type="datetime-local">` opcional en el formulario de edición de la tarea ([MisTareasScreen.tsx](file:///c:/Users/apokl/Desarrollo/Apps%20Curso/Tareas%20Personales/src/components/MisTareasScreen.tsx#L520-L545)). Enforza que la fecha tope sea posterior a la fecha de creación de la tarea (`min={createdAt}`).
- **Barra de Avance por Tiempo Transcurrido**: Barra visual interactiva que se llena dinámicamente a medida que avanza el tiempo entre la creación y la fecha tope.
- **Insignia y Estado de Vencimiento**:
  - Tareas en tiempo: Muestra la cuenta regresiva (ej. `Quedan 2h 15m`).
  - Tareas vencidas: Transiciona a color rojo con efecto de pulso e insignia `⚠️ Vencida hace ...`.
  - Tareas completadas: Barra verde al 100% con estado `Completada`.
- **Insignia en Extremo Derecho**: Añadida la etiqueta `Tope: [Fecha y Hora]` junto al sello de creación.

---

## [1.5.0] - 2026-08-09


### 🛡️ Auditoría de Seguridad & Resiliencia para Producción
- **Saneamiento Anti-XSS**: Implementación de `sanitizeAvatarUrl` en [storage.ts](file:///c:/Users/apokl/Desarrollo/Apps%20Curso/Tareas%20Personales/src/utils/storage.ts) para validar los esquemas de protocolos aceptados (`http://`, `https://`, `data:image/`) y prevenir inyecciones de código tipo `javascript:`.
- **Límite de Captura de Errores (ErrorBoundary)**: Creación de [ErrorBoundary.tsx](file:///c:/Users/apokl/Desarrollo/Apps%20Curso/Tareas%20Personales/src/components/ErrorBoundary.tsx) en la raíz de React para atrapar cualquier excepción de renderizado y presentar una pantalla interactiva de recuperación sin colapsar la app.
- **Validación de Esquema en LocalStorage**: Lectura y escritura protegida contra estructuras corruptas o excepciones `QuotaExceededError` mediante envoltorios seguros en `storage.ts`.
- **Optimización de Producción**: Verificación de compilación limpia y paso de pruebas de tipos `tsc --noEmit` sin errores.

---

## [1.4.0] - 2026-08-09


### 📱 Implementación PWA Completa
- **Iconos PWA**: Generados a partir del logo oficial con gradiente terracota/ámbar en resoluciones `192x192.png`, `512x512.png`, `apple-touch-icon.png`, `favicon.png` y `favicon.svg` (vectorial).
- **Manifest Web (`manifest.json`)**: Configuración PWA lista para instalar la app en pantalla de inicio de Android, iOS y Escritorio (modo *standalone*).
- **Service Worker (`sw.js`)**: Soporte offline para carga instantánea y caché de archivos principales.
- **Metaetiquetas en `index.html`**: Enlaces de iconos, color de tema `#ac2d00` y script de registro de Service Worker.

---

## [1.3.0] - 2026-08-09


### 📋 Orden de Pestañas & Filtros
- **Pestañas Reordenadas**: Las pestañas del selector de tareas se organizaron en el orden exacto: **Pendientes**, **Completadas** y **Todas**.
- **Filtro Predeterminado**: La aplicación abre ahora de forma predeterminada en la pestaña **Pendientes** en lugar de "Todas".

### ⏱️ Registro de Fecha y Hora al Completar
- **Sello de Hora Completada**: Al marcar una tarea como realizada, se almacena el sello de tiempo exacto (`completedAt`).
- **Insignia Visual**: Se añade la etiqueta destacada `Listo: [Fecha y Hora]` a la derecha de las tarjetas de tareas completadas, conservando también la fecha de creación original.

### 📱 Optimización Responsive Móvil
- **Cero Scroll Horizontal**: Ajuste del contenedor del modal a `w-[calc(100vw-1.5rem)]`, bloqueo de scroll del `body` mientras hay modales activos y regla global `overflow-x: hidden` para prevenir desplazamientos horizontales en smartphones.

---

## [1.2.0] - 2026-08-09

### 🎓 Tutorial Interactivo de Bienvenida (Onboarding)
- **Modal de 4 Pasos**: Guía paso a paso interactiva para nuevos navegadores sin tareas guardadas.
- **Demostraciones Interactivas**: Los usuarios pueden probar en vivo la selección de prioridades, tachado de tareas y arrastre dentro de las diapositivas del tutorial.
- **Acceso Directo**: Botón **Ver Tutorial Interactivo** integrado en la parte inferior de la barra lateral, justo encima de la tarjeta de *LocalStorage*.

### 👤 Personalización en el Tutorial
- **Configuración Inicial**: Formulario integrado en el Paso 4 del tutorial para guardar Nombre, Apellidos y Avatar de forma que la app inicie 100% personalizada.
- **Iniciales por Defecto**: Si no se selecciona foto de avatar o URL, la aplicación genera una insignia circular estética con las iniciales del usuario.

---

## [1.1.0] - 2026-08-09

### ⠿ Reordenación por Arrastre (Drag & Drop)
- **Soporte Táctil y Ratón**: Incorporación del icono de agarre `⠿` (`drag_indicator`) para reordenar tareas con el mouse en PC o gestos en pantallas táctiles.
- **Persistencia en LocalStorage**: El orden personalizado de las tareas se guarda automáticamente en el almacenamiento local del navegador.

### 📱 Mejoras en Ajustes Móviles
- **Orden de Ajustes**: Ajuste del diseño de la pantalla de Ajustes para ubicar la tarjeta de *Persistencia Local* al final de la página en dispositivos móviles.

---

## [1.0.0] - 2026-08-09

### ✨ Funcionalidades Principales
- **Gestión Completa de Tareas**: Crear, editar texto/prioridad, marcar como completadas y eliminar tareas.
- **Sello de Fecha de Creación**: Fecha y hora de creación de la tarea ubicada en el extremo derecho de cada tarjeta.
- **Persistencia en LocalStorage**: Almacenamiento transparente y privado en el navegador.
- **Pantalla de Ajustes**: Formulario de perfil con campos para Nombre, Apellidos y foto/URL de Avatar.
- **Estilo Cálido y Responsive**: Diseño en tonos terracota y rojos cálidos (`#ac2d00`, `#d53e0b`, `#fff8f5`) adaptado a móviles y escritorio.
