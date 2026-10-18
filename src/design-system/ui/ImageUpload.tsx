import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/core/utils/cn';

export interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<{ url: string; publicId?: string }>;
  label?: string;
  description?: string;
  maxSizeBytes?: number;
  acceptedFormats?: string[];
  shape?: 'circle' | 'square';
  disabled?: boolean;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onUpload,
  label = 'Foto de Perfil',
  description = 'Formatos aceitos: JPG, PNG ou WEBP. Tamanho máximo: 5MB.',
  maxSizeBytes = 5 * 1024 * 1024,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  shape = 'circle',
  disabled = false,
  className,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayImage = previewUrl || value || null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limpa estados prévios
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validação de formato no frontend
    if (!acceptedFormats.includes(file.type)) {
      setErrorMessage('Formato de arquivo inválido. Selecione uma imagem JPG, PNG ou WEBP.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validação de tamanho no frontend
    if (file.size > maxSizeBytes) {
      const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
      setErrorMessage(`O arquivo excede o limite máximo permitido de ${maxMb}MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Pré-visualização local imediata
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload seguro para o backend/Cloudinary
    setIsUploading(true);
    try {
      const result = await onUpload(file);
      onChange(result.url);
      setSuccessMessage('Foto enviada com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(
        errObj.response?.data?.message || errObj.message || 'Falha ao realizar upload da imagem. Tente novamente.'
      );
      // Reverte pré-visualização em caso de falha
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileInput = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-xs font-semibold text-text-primary">
          {label}
        </label>
      )}

      <div className="flex items-center gap-4">
        {/* Área de Preview / Avatar */}
        <div
          onClick={triggerFileInput}
          role="button"
          tabIndex={0}
          aria-label={displayImage ? 'Alterar foto' : 'Enviar foto'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              triggerFileInput();
            }
          }}
          className={cn(
            'relative group overflow-hidden bg-surface-raised border-2 border-dashed border-border transition-all duration-150 flex items-center justify-center shrink-0 cursor-pointer hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
            shape === 'circle' ? 'h-20 w-20 rounded-full' : 'h-20 w-28 rounded-lg',
            disabled && 'opacity-60 cursor-not-allowed pointer-events-none',
            isUploading && 'border-primary animate-pulse'
          )}
        >
          {displayImage ? (
            <img
              src={displayImage}
              alt="Pré-visualização"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-text-muted group-hover:text-primary transition-colors">
              <Camera className="h-6 w-6 stroke-[1.75]" />
              <span className="text-[10px] font-medium mt-1">Foto</span>
            </div>
          )}

          {/* Overlay de carregamento */}
          {isUploading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          )}

          {/* Overlay no hover para alteração quando já tem imagem */}
          {displayImage && !isUploading && !disabled && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-semibold gap-1">
              <Upload className="h-3.5 w-3.5" />
              <span>Trocar</span>
            </div>
          )}
        </div>

        {/* Controles e Informações */}
        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
            data-testid="image-upload-input"
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerFileInput}
              disabled={disabled || isUploading}
              leftIcon={isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              className="cursor-pointer"
              data-testid="select-image-button"
            >
              {isUploading ? 'Enviando ao Cloudinary...' : displayImage ? 'Alterar Imagem' : 'Selecionar Foto'}
            </Button>

            {displayImage && !isUploading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={disabled}
                leftIcon={<Trash2 className="h-3.5 w-3.5 text-danger" />}
                className="text-danger hover:text-danger hover:bg-danger/10 cursor-pointer"
                data-testid="remove-image-button"
              >
                Remover
              </Button>
            )}
          </div>

          {description && (
            <p className="text-[11px] text-text-muted leading-tight">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Feedback de Erro */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-1.5 p-2 rounded-md bg-danger/10 border border-danger/20 text-danger text-xs"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Feedback de Sucesso */}
      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-1.5 p-2 rounded-md bg-success/10 border border-success/20 text-success text-xs animate-in fade-in duration-150"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
};
