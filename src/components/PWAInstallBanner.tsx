import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, ArrowUpRight, HelpCircle, Info, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('android');

  useEffect(() => {
    // Check if app is already running in standalone mode (PWA installed)
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    setIsStandalone(isRunningStandalone);

    // Detect if device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);
    if (isIOSDevice) {
      setActiveTab('ios');
    }

    // Listen to PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show banner if not already installed and not dismissed in this session
      const isDismissed = sessionStorage.getItem('pwa-dismissed') === 'true';
      if (!isRunningStandalone && !isDismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If it's iOS and not standalone, show a helpful hint after a small delay
    const isDismissed = sessionStorage.getItem('pwa-dismissed') === 'true';
    if (isIOSDevice && !isRunningStandalone && !isDismissed) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If no native prompt (e.g. iOS or custom Android browser), open the helper modal
      setShowModal(true);
      return;
    }

    // Show the native prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa-dismissed', 'true');
  };

  // If already installed (standalone mode), don't show anything
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Floating Mini Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-800 flex flex-col gap-3 font-sans"
            id="pwa-install-banner"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-600 rounded-xl text-white shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-tight text-white">Instalar Cabeça do João 📱</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Baixe o aplicativo para acessar direto da tela inicial, com maior rapidez e tela cheia!
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2.5 mt-1">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{deferredPrompt ? 'Instalar Agora' : 'Como Instalar'}</span>
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Ajuda</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating help trigger button if banner is hidden */}
      {!showBanner && (
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-4 right-4 z-40 bg-white border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-600 p-3 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 font-sans text-xs font-bold"
          id="pwa-help-trigger"
        >
          <Smartphone className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>Baixar App</span>
        </button>
      )}

      {/* PWA Installation Instructions Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden font-sans"
              id="pwa-instructions-modal"
            >
              {/* Modal Header */}
              <div className="p-6 bg-slate-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-600 rounded-xl text-white">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">Instalar Aplicativo</h3>
                    <p className="text-[11px] text-slate-400">Tenha o Segundo Cérebro sempre à mão no celular</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs Selector */}
              <div className="flex border-b border-slate-100 bg-slate-50 p-1">
                <button
                  onClick={() => setActiveTab('android')}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'android'
                      ? 'bg-white text-rose-600 shadow-3xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🤖 Android (Chrome)
                </button>
                <button
                  onClick={() => setActiveTab('ios')}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'ios'
                      ? 'bg-white text-rose-600 shadow-3xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🍎 iPhone (Safari)
                </button>
              </div>

              {/* Instructions Content */}
              <div className="p-6 space-y-4">
                {activeTab === 'android' ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-800 flex items-start gap-3">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p>
                        Para a melhor experiência no Android, use o navegador <strong>Google Chrome</strong>.
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-black shrink-0">1</div>
                        <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                          Abra o navegador <strong>Chrome</strong> no celular e acesse o link do aplicativo.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-black shrink-0">2</div>
                        <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                          Toque no ícone de <strong>três pontinhos (menu)</strong> no canto superior direito do Chrome.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-black shrink-0">3</div>
                        <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                          Procure e selecione a opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-black shrink-0">4</div>
                        <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                          Confirme a instalação. O ícone <strong>Cabeça do João</strong> aparecerá na tela inicial do seu celular, abrindo direto como um app nativo!
                        </p>
                      </div>
                    </div>

                    {deferredPrompt && (
                      <div className="pt-4 border-t border-slate-100 flex justify-center">
                        <button
                          onClick={() => {
                            handleInstallClick();
                            setShowModal(false);
                          }}
                          className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Instalar no meu Android
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-800 flex items-start gap-3">
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <p>
                        No iOS/iPhone, a instalação de PWAs é permitida exclusivamente pelo navegador oficial <strong>Safari</strong> da Apple.
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-black shrink-0">1</div>
                        <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                          Abra este site utilizando obrigatoriamente o navegador <strong>Safari</strong> do seu iPhone.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-black shrink-0">2</div>
                        <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                          Toque no botão de <strong>Compartilhar</strong> (o ícone de quadrado com uma seta para cima, localizado no menu inferior do Safari).
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-black shrink-0">3</div>
                        <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                          Role as opções que surgirem e toque em <strong>"Adicionar à Tela de Início"</strong>.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-black shrink-0">4</div>
                        <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                          Toque em <strong>"Adicionar"</strong> no canto superior direito para confirmar. Pronto! O app aparecerá na sua tela de aplicativos.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Pronto para uso offline e tela cheia
                </span>
                <button
                  onClick={() => setShowModal(false)}
                  className="font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
