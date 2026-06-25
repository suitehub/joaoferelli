import React, { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  Smartphone, 
  Info, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Monitor
} from 'lucide-react';

export const PWABanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('pwa_banner_dismissed') === 'true';
  });
  const [platform, setPlatform] = useState<'android' | 'ios' | 'samsung' | 'other'>('other');
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    if (/samsung/i.test(userAgent)) {
      setPlatform('samsung');
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/i.test(userAgent)) {
      setPlatform('android');
    } else {
      setPlatform('other');
    }

    // Check if already running in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    if (isStandalone) {
      setInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser's default bar
      e.preventDefault();
      // Save event
      setDeferredPrompt(e);
      // Show custom banner
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA instalado com sucesso!');
      setInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger the browser's install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA install choice: ${outcome}`);
      setDeferredPrompt(null);
      setIsInstallable(false);
    } else {
      // If prompt is not available, show manual instructions
      setShowInstructions(true);
    }
  };

  const dismissBanner = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa_banner_dismissed', 'true');
  };

  const showBannerAgain = () => {
    setIsDismissed(false);
    localStorage.removeItem('pwa_banner_dismissed');
  };

  if (installed) {
    return null; // Don't show anything if already installed
  }

  if (isDismissed && !showInstructions) {
    // Provide a small floating re-open button or return null.
    // Let's return a very subtle link at the bottom or let users activate it if they want, 
    // but a small floating "Instalar App" icon is awesome.
    return (
      <button 
        onClick={showBannerAgain}
        className="fixed bottom-4 right-4 z-40 bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer border border-slate-800"
        title="Instalar como Aplicativo"
      >
        <Download className="w-4 h-4 text-emerald-400 animate-bounce" />
        <span className="hidden sm:inline">Instalar App</span>
      </button>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4" id="pwa-installer-container">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden border border-slate-800/80">
        {/* Glow effect */}
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          
          {/* Logo & Content */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-white/20 shadow-md bg-slate-950">
              <img 
                src="./logojoao.png" 
                alt="Logo Cabeça do João" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider font-mono">
                  Compatível com Samsung & Android
                </span>
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider font-mono">
                  PWA Ativo
                </span>
              </div>
              <h3 className="font-display font-bold text-base md:text-lg text-slate-100 mt-1 flex items-center gap-1.5 leading-tight">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Instalar o Segundo Cérebro no Celular</span>
              </h3>
              <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
                Adicione o aplicativo diretamente à tela inicial do seu celular para acesso rápido e offline, com visual limpo de tela inteira (sem barras do navegador!).
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex-1 md:flex-initial px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all hover:shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>{isInstallable ? 'Instalar Agora' : 'Como Instalar'}</span>
            </button>

            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-white/5"
            >
              <Info className="w-4 h-4" />
              <span>Instruções</span>
            </button>

            <button
              onClick={dismissBanner}
              className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer shrink-0"
              title="Fechar lembrete"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Expandable Manual Instructions Panel */}
        {showInstructions && (
          <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in text-slate-300">
            
            {/* SAMSUNG / ANDROID CHROME CARD */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm mb-2.5">
                <span className="text-base">📱</span>
                <span>Samsung Internet</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-400 pl-1 list-none">
                <li className="flex gap-1.5">
                  <span className="text-amber-400">1.</span>
                  <span>Procure o ícone de <strong>instalar (seta para baixo)</strong> na barra de endereços ou topo da tela.</span>
                </li>
                <li className="flex gap-1.5">
                  <span className="text-amber-400">2.</span>
                  <span>Ou toque no menu (3 linhas <strong className="text-slate-200">☰</strong> no canto inferior direito).</span>
                </li>
                <li className="flex gap-1.5">
                  <span className="text-amber-400">3.</span>
                  <span>Selecione <strong className="text-slate-200">"Adicionar página a"</strong> e escolha <strong className="text-slate-200">"Tela de início"</strong>.</span>
                </li>
              </ul>
            </div>

            {/* CHROME ANDROID CARD */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs sm:text-sm mb-2.5">
                <span className="text-base">🤖</span>
                <span>Google Chrome (Android)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-400 pl-1 list-none">
                <li className="flex gap-1.5">
                  <span className="text-blue-400">1.</span>
                  <span>Toque nos <strong>três pontinhos (⋮)</strong> no canto superior direito do navegador.</span>
                </li>
                <li className="flex gap-1.5">
                  <span className="text-blue-400">2.</span>
                  <span>Procure e selecione a opção <strong className="text-slate-200">"Instalar aplicativo"</strong> ou <strong className="text-slate-200">"Adicionar à tela inicial"</strong>.</span>
                </li>
                <li className="flex gap-1.5">
                  <span className="text-blue-400">3.</span>
                  <span>Confirme a instalação e o ícone do João aparecerá no seu celular.</span>
                </li>
              </ul>
            </div>

            {/* IOS SAFARI CARD */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-pink-400 font-bold text-xs sm:text-sm mb-2.5">
                <span className="text-base">🍎</span>
                <span>Safari (iPhone/iOS)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-400 pl-1 list-none">
                <li className="flex gap-1.5">
                  <span className="text-pink-400">1.</span>
                  <span>Toque no botão de <strong>Compartilhar (ícone com quadrado e seta para cima 📤)</strong>.</span>
                </li>
                <li className="flex gap-1.5">
                  <span className="text-pink-400">2.</span>
                  <span>Role a lista de opções para baixo e selecione <strong className="text-slate-200">"Adicionar à Tela de Início"</strong>.</span>
                </li>
                <li className="flex gap-1.5">
                  <span className="text-pink-400">3.</span>
                  <span>Toque em <strong className="text-slate-200">"Adicionar"</strong> no canto superior direito para confirmar.</span>
                </li>
              </ul>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
