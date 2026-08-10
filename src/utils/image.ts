/**
 * Lee un archivo de imagen, lo redimensiona mediante un Canvas HTML (máximo 256x256 px)
 * y devuelve una cadena Base64 comprimida (~20-40KB) lista para ser almacenada
 * de forma directa y segura en el LocalStorage del navegador.
 */
export function compressImageFile(file: File, maxSize: number = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Mantener la relación de aspecto dentro del tamaño máximo
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar la compresión de imagen.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a Data URL Base64 con compresión JPEG al 85% de calidad
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Error al procesar la imagen seleccionada.'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsDataURL(file);
  });
}
