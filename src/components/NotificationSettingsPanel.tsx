/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  MessageSquare, 
  Calendar, 
  Pin, 
  Mail, 
  Check,
  AlertCircle,
  Smartphone,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { notificationService, NotificationSettings } from '../utils/notificationService';

interface NotificationSettingsPanelProps {
  onBack: () => void;
}

export const NotificationSettingsPanel: React.FC<NotificationSettingsPanelProps> = ({
  onBack
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
  const [permission, setPermission] = useState<NotificationPermission>(notificationService.getPermissionState());
  const [testSuccess, setTestSuccess] = useState(false);

  useEffect(() => {
    setSettings(notificationService.getSettings());
    setPermission(notificationService.getPermissionState());
  }, []);

  const handleToggle = (key: keyof NotificationSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    notificationService.saveSettings(updated);
  };

  const handleRequestPermission = async () => {
    const res = await notificationService.requestPermission();
    setPermission(res);
  };

  const handleTestNotification = () => {
    notificationService.trigger(
      'Teste de Notificação 🔔',
      'As notificações do aplicativo "Cabeça do João" estão funcionando perfeitamente no seu dispositivo!',
      'system'
    );
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 3000);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto animate-fade-in select-none">
      
      {/* Header breadcrumb & navigation bar */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          <span>Voltar ao Dashboard</span>
        </button>

        <span className="text-xs font-mono font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">PAINEL 06</span>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 md:p-8 space-y-6">
        
        {/* Title */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
          <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl">
            <Bell className="w-6 h-6 animate-swing" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <h2 className="font-display font-black text-2xl text-slate-800 tracking-tight">
              Notificações Inteligentes
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Configure avisos e alertas em tempo real no seu dispositivo</p>
          </div>
        </div>

        {/* Permission Status Alert Banner */}
        <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 transition-colors ${
          permission === 'granted' 
            ? 'bg-emerald-50/45 border-emerald-100 text-emerald-800' 
            : permission === 'denied' 
            ? 'bg-red-50/45 border-red-100 text-red-800' 
            : 'bg-amber-50/45 border-amber-100 text-amber-800'
        }`}>
          <div className="shrink-0 mt-0.5">
            {permission === 'granted' ? (
              <Check className="w-4 h-4 text-emerald-500 font-bold" />
            ) : permission === 'denied' ? (
              <ShieldAlert className="w-4 h-4 text-red-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-bold">
              {permission === 'granted' 
                ? 'Notificações do Navegador Ativas!' 
                : permission === 'denied' 
                ? 'Notificações do Navegador Bloqueadas' 
                : 'Notificações Pendentes de Permissão'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              {permission === 'granted'
                ? 'Você receberá notificações nativas no celular (iOS/Android/Samsung) ou desktop mesmo com o aplicativo em segundo plano.'
                : permission === 'denied'
                ? 'O navegador bloqueou os alertas de push. Para ativar, clique no ícone de cadeado na barra de endereço do navegador e mude para "Permitir".'
                : 'Para habilitar o envio de alertas nativos do sistema no topo da tela do seu smartphone ou PC, autorize o envio.'}
            </p>

            {permission !== 'granted' && permission !== 'denied' && (
              <button
                onClick={handleRequestPermission}
                className="mt-3 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs hover:scale-101"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Ativar Notificações do Navegador</span>
              </button>
            )}
          </div>
        </div>

        {/* Core Settings Block */}
        <div className="space-y-4">
          
          {/* Master Enabled Switch */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/55">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl transition-colors ${settings.enabled ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-500'}`}>
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-700 block">Ativar Sistema de Notificações</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Controla todos os avisos sonoros e visuais (Geral)</span>
              </div>
            </div>
            <button
              onClick={() => handleToggle('enabled')}
              className={`w-11 h-6.5 flex items-center rounded-full p-1 transition-colors cursor-pointer duration-300 ${
                settings.enabled ? 'bg-rose-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-300 ${
                  settings.enabled ? 'translate-x-4.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sound Notification Switch */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/55">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl transition-colors ${settings.sound ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                {settings.sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-700 block">Avisos Sonoros (Chime)</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Toca um som suave ao receber uma novidade</span>
              </div>
            </div>
            <button
              onClick={() => handleToggle('sound')}
              className={`w-11 h-6.5 flex items-center rounded-full p-1 transition-colors cursor-pointer duration-300 ${
                settings.sound ? 'bg-blue-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-300 ${
                  settings.sound ? 'translate-x-4.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

        </div>

        {/* Custom Channels / Preferences Section */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest pl-1">PREFERÊNCIAS DE EVENTO</h4>
          
          <div className="divide-y divide-slate-50 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-3xs">
            
            {/* Messages Toggle */}
            <div className="flex items-center justify-between p-4 hover:bg-slate-50/40 transition-colors">
              <div className="flex items-center gap-3.5">
                <MessageSquare className="w-5 h-5 text-blue-500 shrink-0" />
                <div>
                  <span className="font-bold text-xs text-slate-700 block">Mensagens no Chat</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Novas mensagens de conversas em tempo real</span>
                </div>
              </div>
              <button
                disabled={!settings.enabled}
                onClick={() => handleToggle('messages')}
                className={`w-9 h-5.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer duration-200 ${
                  settings.messages && settings.enabled ? 'bg-blue-500' : 'bg-slate-200'
                } ${!settings.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${settings.messages && settings.enabled ? 'translate-x-3.5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Alarms Toggle */}
            <div className="flex items-center justify-between p-4 hover:bg-slate-50/40 transition-colors">
              <div className="flex items-center gap-3.5">
                <Bell className="w-5 h-5 text-rose-500 shrink-0" />
                <div>
                  <span className="font-bold text-xs text-slate-700 block">Alarmes de Fuso Horário</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Sincronia exata entre o Brasil e o Egito</span>
                </div>
              </div>
              <button
                disabled={!settings.enabled}
                onClick={() => handleToggle('alarms')}
                className={`w-9 h-5.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer duration-200 ${
                  settings.alarms && settings.enabled ? 'bg-rose-500' : 'bg-slate-200'
                } ${!settings.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${settings.alarms && settings.enabled ? 'translate-x-3.5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Agenda Toggle */}
            <div className="flex items-center justify-between p-4 hover:bg-slate-50/40 transition-colors">
              <div className="flex items-center gap-3.5">
                <Calendar className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <span className="font-bold text-xs text-slate-700 block">Agenda & Lembretes</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Reminiscência exata no horário das atividades</span>
                </div>
              </div>
              <button
                disabled={!settings.enabled}
                onClick={() => handleToggle('agenda')}
                className={`w-9 h-5.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer duration-200 ${
                  settings.agenda && settings.enabled ? 'bg-emerald-500' : 'bg-slate-200'
                } ${!settings.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${settings.agenda && settings.enabled ? 'translate-x-3.5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Recados Toggle */}
            <div className="flex items-center justify-between p-4 hover:bg-slate-50/40 transition-colors">
              <div className="flex items-center gap-3.5">
                <Pin className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <span className="font-bold text-xs text-slate-700 block">Mural de Recados</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Post-its novos deixados na mesa compartilhada</span>
                </div>
              </div>
              <button
                disabled={!settings.enabled}
                onClick={() => handleToggle('recados')}
                className={`w-9 h-5.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer duration-200 ${
                  settings.recados && settings.enabled ? 'bg-amber-500' : 'bg-slate-200'
                } ${!settings.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${settings.recados && settings.enabled ? 'translate-x-3.5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Cartinhas Toggle */}
            <div className="flex items-center justify-between p-4 hover:bg-slate-50/40 transition-colors">
              <div className="flex items-center gap-3.5">
                <Mail className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                  <span className="font-bold text-xs text-slate-700 block">Cartinhas Digitais</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Novas correspondências românticas recebidas</span>
                </div>
              </div>
              <button
                disabled={!settings.enabled}
                onClick={() => handleToggle('cartinhas')}
                className={`w-9 h-5.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer duration-200 ${
                  settings.cartinhas && settings.enabled ? 'bg-indigo-500' : 'bg-slate-200'
                } ${!settings.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${settings.cartinhas && settings.enabled ? 'translate-x-3.5' : 'translate-x-0'}`} />
              </button>
            </div>

          </div>
        </div>

        {/* Action Button: Go Back */}
        <div className="pt-4">
          <button
            onClick={onBack}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer hover:scale-[1.01] shadow-sm text-center"
          >
            Confirmar e Salvar Configurações
          </button>
        </div>

      </div>
    </div>
  );
};
