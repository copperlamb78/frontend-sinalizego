import React, { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Smartphone, X, Download, Share, PlusSquare, Check } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already running as standalone PWA
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (checkStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Check if user dismissed recently
      const isDismissed = sessionStorage.getItem('@sinalizego:pwa_prompt_dismissed');
      if (!isDismissed) {
        setIsVisible(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setIsGuideOpen(false);
      toast.success('SinalizeGO instalado com sucesso!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Also listen to custom trigger from anywhere in the app (e.g. Minha Conta)
    const handleOpenInstallTrigger = () => {
      if (deferredPrompt) {
        handleInstallClick();
      } else {
        setIsGuideOpen(true);
      }
    };

    window.addEventListener('sinalizego:open-pwa-install', handleOpenInstallTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('sinalizego:open-pwa-install', handleOpenInstallTrigger);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setIsGuideOpen(true);
      return;
    }

    triggerHaptic('medium');
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === 'accepted') {
        setIsVisible(false);
        setIsInstalled(true);
      }
    } catch {
      setIsGuideOpen(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('@sinalizego:pwa_prompt_dismissed', 'true');
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Floating A2HS Banner */}
      {isVisible && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-auto bg-[#0F172A]/95 backdrop-blur-md border border-teal-500/40 p-4 rounded-2xl shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-tight">
                  Instalar o App SinalizeGO
                </h4>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  Acesso rápido aos seus agendamentos na tela inicial.
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              onClick={handleInstallClick}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="w-full h-8 text-xs font-bold shadow-md shadow-teal-500/20 cursor-pointer"
            >
              Instalar Agora
            </Button>
          </div>
        </div>
      )}

      {/* Manual Installation Guide Modal (For iOS / Desktop browsers without prompt) */}
      <Modal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        title="Instalar SinalizeGO no Celular"
        description="Tenha o aplicativo diretamente na sua tela de início sem ocupar memória"
        size="md"
      >
        <div className="space-y-5">
          {/* iOS Safari Guide */}
          <div className="p-4 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
              <Share className="w-4 h-4" />
              <span>No iPhone / iPad (Safari):</span>
            </div>
            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                Toque no botão de <strong>Compartilhar</strong> (ícone do meio no rodapé do Safari).
              </li>
              <li>
                Role as opções e toque em <strong>"Adicionar à Tela de Início"</strong> <PlusSquare className="w-3.5 h-3.5 inline text-teal-400" />.
              </li>
              <li>
                Toque em <strong>"Adicionar"</strong> no topo direito para concluir.
              </li>
            </ol>
          </div>

          {/* Android Chrome Guide */}
          <div className="p-4 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
              <Smartphone className="w-4 h-4" />
              <span>No Android (Google Chrome):</span>
            </div>
            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                Toque nos <strong>três pontos (Menu)</strong> no canto superior direito do Chrome.
              </li>
              <li>
                Selecione a opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
              </li>
              <li>
                Confirme em <strong>"Instalar"</strong>. O ícone aparecerá na sua lista de apps!
              </li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <Button
              size="sm"
              onClick={handleInstallClick}
              leftIcon={<Download className="w-4 h-4" />}
              className="font-bold text-xs h-10 shadow-md shadow-teal-500/20 cursor-pointer"
            >
              Instalar Agora
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsGuideOpen(false)}
              className="text-xs h-10 border-slate-700"
              leftIcon={<Check className="w-4 h-4 text-slate-400" />}
            >
              Fechar Guia
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

/**
 * Trigger install prompt or guide from anywhere in the application
 */
export const openPwaInstallModal = (): void => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sinalizego:open-pwa-install'));
  }
};
