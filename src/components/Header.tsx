/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Users, Brain, RefreshCw, ChevronLeft } from 'lucide-react';

interface HeaderProps {
  currentTab: 'meu-mundo' | 'compartilhado';
  onTabChange: (tab: 'meu-mundo' | 'compartilhado') => void;
  activePanel: string | null;
  onBack: () => void;
  isGuestMode?: boolean;
  currentProfileName?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  activePanel,
  onBack,
  isGuestMode = false,
  currentProfileName,
  onLogout,
}) => {

  // Map panel keys to friendly display names in Portuguese
  const getPanelDisplayName = (panel: string | null) => {
    if (!panel) return '';
    switch (panel) {
      case 'agenda': return 'Agenda & Tarefas';
      case 'recados': return 'Mural de Recados';
      case 'memorias': return 'Caixa de Memórias';
      case 'cartinhas': return 'Cartinhas no Tempo';
      case 'conversas': return 'Canais de Conversa';
      case 'conteudos': return 'Biblioteca de Conteúdos';
      case 'fuso-horario': return 'Fuso Horário & Alarmes';
      default: return panel.charAt(0).toUpperCase() + panel.slice(1);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        
        {/* Brand Logo & Name (Enlarged and highlighted) */}
        <div 
          onClick={isGuestMode ? undefined : onBack}
          className={`flex items-center gap-2 sm:gap-3 md:gap-4 select-none min-w-0 ${isGuestMode ? 'cursor-default' : 'cursor-pointer group'}`}
        >
          <div className="relative shrink-0">
            {/* Glowing outer ring to showcase active brain state */}
            {!isGuestMode && <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-500 rounded-full blur-xs opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 animate-pulse" style={{ animationDuration: '4s' }}></div>}
            <div className={`relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-slate-900 border-2 border-white shadow-md overflow-hidden flex items-center justify-center`}>
              <img 
                src="./logojoao.png" 
                alt="Cabeça do João" 
                className={`w-full h-full object-cover ${!isGuestMode ? 'group-hover:scale-110 transition-transform duration-500' : ''}`}
                onError={(e) => {
                  // Fallback to stylized initials if image not found
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = "w-full h-full rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center font-display font-black text-xs sm:text-sm md:text-lg";
                    fallback.innerText = "CJ";
                    parent.appendChild(fallback);
                  }
                }}
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
              <h1 className="font-display font-black text-sm sm:text-lg md:text-2xl tracking-tight bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 bg-clip-text text-transparent leading-none">
                Cabeça do João
              </h1>
              <span className="text-[7px] sm:text-[8px] md:text-[9px] font-mono font-extrabold bg-blue-50 text-blue-600 border border-blue-100 px-1 sm:px-1.5 py-0.5 rounded-full select-none shrink-0">
                PRO v1.0
              </span>
            </div>
            <p className="text-[10px] md:text-xs text-slate-400 font-sans mt-0.5 md:mt-1 font-medium flex items-center gap-1 truncate">
              {activePanel ? (
                <>
                  <span className="text-blue-500 font-semibold truncate">{getPanelDisplayName(activePanel)}</span>
                  <span className="text-slate-300 shrink-0">•</span>
                  <span className="shrink-0">{currentProfileName ? `Perfil: ${currentProfileName}` : (isGuestMode ? 'Convidado' : 'Mente Ativa')}</span>
                </>
              ) : (
                currentProfileName ? `Segundo Cérebro • Perfil: ${currentProfileName}` : 'Segundo Cérebro Digital'
              )}
            </p>
          </div>
        </div>

        {/* Action/Selector Controls */}
        <div className="shrink-0 flex items-center gap-2">
          {isGuestMode ? (
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100/50 text-rose-600 px-3 py-2 rounded-xl text-[10px] font-bold tracking-wider font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              CONVERSA PRIVADA
            </div>
          ) : !activePanel ? (
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-0.5 select-none shadow-3xs">
              <button
                onClick={() => onTabChange('meu-mundo')}
                className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[36px] ${
                  currentTab === 'meu-mundo'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/40'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Meu Mundo</span>
              </button>
              <button
                onClick={() => onTabChange('compartilhado')}
                className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[36px] ${
                  currentTab === 'compartilhado'
                    ? 'bg-white text-emerald-600 shadow-xs border border-slate-200/40'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Compartilhado</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onBack}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0 min-h-[36px]"
            >
              <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
              <span>Voltar</span>
            </button>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 cursor-pointer transition-all"
              title="Sair do perfil"
            >
              Sair
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
