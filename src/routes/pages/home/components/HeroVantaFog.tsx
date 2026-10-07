import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import FOG from 'vanta/dist/vanta.fog.min';

interface HeroVantaFogProps {
  isDark?: boolean;
}

export const HeroVantaFog: React.FC<HeroVantaFogProps> = ({ isDark = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    // Destroi efeito prévio antes de recriar com a nova paleta de cor
    if (effectRef.current) {
      try {
        effectRef.current.destroy();
      } catch {
        // Ignora erros de teardown
      }
      effectRef.current = null;
    }

    try {
      // Garante que THREE esteja disponível no escopo do Vanta
      (window as unknown as { THREE: typeof THREE }).THREE = THREE;

      // Paleta temática personalizada para harmonizar com a identidade visual do SinalizeGO
      const fogOptions = isDark
        ? {
            highlightColor: 0x14b8a6, // Teal primário institucional (#14B8A6)
            midtoneColor: 0x0f766e,   // Petrol green profundo (#0F766E)
            lowlightColor: 0x0f172a,  // Surface slate dark (#0F172A)
            baseColor: 0x0b1120,      // Fundo oficial dark (#0B1120)
            blurFactor: 0.75,
            speed: 1.1,
            zoom: 0.9,
          }
        : {
            highlightColor: 0x99f6e4, // Teal suave light (#99F6E4)
            midtoneColor: 0xccfbf1,   // Mint muito claro (#CCFBF1)
            lowlightColor: 0xe2e8f0,  // Slate-200 border (#E2E8F0)
            baseColor: 0xe8e8e8,      // Fundo oficial light (#E8E8E8)
            blurFactor: 0.85,
            speed: 0.9,
            zoom: 0.85,
          };

      // FOG pode ser exportado como default direto ou objeto
      const initFog = (FOG as unknown as { default?: typeof FOG }).default || FOG;

      effectRef.current = initFog({
        el: containerRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 2.0,
        ...fogOptions,
      });
    } catch (err) {
      console.warn('[HeroVantaFog] Não foi possível inicializar Vanta Fog:', err);
    }

    return () => {
      if (effectRef.current) {
        try {
          effectRef.current.destroy();
        } catch {
          // Teardown silencioso
        }
        effectRef.current = null;
      }
    };
  }, [isDark]);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
    >
      {/* Canvas container do Vanta */}
      <div
        ref={containerRef}
        className="w-full h-full opacity-65 dark:opacity-85 transition-opacity duration-700"
      />

      {/* Máscara de gradiente suave para fundir a névoa com a página e assegurar legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none" />
      <div className="absolute inset-0 bg-radial-[circle_at_center] from-transparent via-transparent to-background/60 pointer-events-none" />
    </div>
  );
};
