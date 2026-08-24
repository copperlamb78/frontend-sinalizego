/**
 * Utility to optimize and compress image files on the client side
 * using HTML Canvas before uploading or converting to Base64.
 *
 * Designed to keep Base64 strings ultra-compact (< 50KB total)
 * so they easily fit within default backend body-parser limits (100KB).
 */

export interface CompressionResult {
  file: File;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
}

export async function compressImageFile(
  file: File,
  maxWidth = 800,
  maxHeight = 600,
  quality = 0.75
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    // If SVG, keep as is
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve({
          file,
          dataUrl,
          originalSize: file.size,
          compressedSize: file.size
        });
      };
      reader.onerror = () => reject(new Error('Falha ao processar SVG.'));
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      let { width, height } = img;

      // Constrain dimensions to prevent huge resolutions
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Não foi possível inicializar o processador gráfico do navegador.'));
        return;
      }

      // Smooth bicubic resampling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Always output high-efficiency JPEG to keep payload ultra-small (< 40KB)
      const outputType = 'image/jpeg';
      const dataUrl = canvas.toDataURL(outputType, quality);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Falha ao otimizar a imagem.'));
            return;
          }

          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
            type: outputType,
            lastModified: Date.now()
          });

          resolve({
            file: compressedFile,
            dataUrl,
            originalSize: file.size,
            compressedSize: compressedFile.size
          });
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Não foi possível ler o arquivo de imagem selecionado.'));
    };

    reader.onerror = () => {
      reject(new Error('Falha ao abrir a imagem.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Specifically optimizes a Logo/Avatar image to ~10KB - 20KB
 */
export async function compressLogoFile(file: File): Promise<CompressionResult> {
  return compressImageFile(file, 250, 250, 0.78);
}

/**
 * Specifically optimizes a Cover Banner image to ~30KB - 50KB
 */
export async function compressBannerFile(file: File): Promise<CompressionResult> {
  return compressImageFile(file, 750, 300, 0.72);
}
