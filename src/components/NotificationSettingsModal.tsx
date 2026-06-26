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
  X, 
  Check,
  AlertCircle,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { motion } from 'motion/react';
import { notificationService, NotificationSettings } from '../utils/notificationService';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
  const [permission, setPermission] = useState<NotificationPermission>(notificationService.getPermissionState());
  const [testSuccess, setTestSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(notificationService.getSettings());
      setPermission(notificationService.getPermissionState());
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-white rounded-3xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden z-10"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
              <Bell className="w-5 h-5 animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-800 leading-tight">
                Notificações Inteligentes
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Configure alertas em tempo real no seu dispositivo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Permission Status Alert */}
          <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
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
                  ? 'Você receberá notificações nativas no celular (iOS/Samsung) ou desktop mesmo com o aplicativo em segundo plano.'
                  : permission === 'denied'
                  ? 'O navegador bloqueou os alertas de push. Para ativar, clique no ícone de cadeado na barra de endereço do navegador e mude para "Permitir".'
                  : 'Para habilitar o envio de alertas nativos do sistema no topo da tela do seu smartphone ou PC, autorize o envio.'}
              </p>

              {permission !== 'granted' && permission !== 'denied' && (
                <button
                  onClick={handleRequestPermission}
                  className="mt-3 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[11px] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Ativar Notificações do Navegador</span>
                </button>
              )}
            </div>
          </div>

          {/* Master Enabled Switch */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100/50">
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${settings.enabled ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-500'}`}>
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-700 block">Ativar Sistema de Notificações</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Controla os avisos sonoros e visuais (Geral)</span>
              </div>
            </div>
            <button
              onClick={() => handleToggle('enabled')}
              className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer duration-300 ${
                settings.enabled ? 'bg-rose-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  settings.enabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sound Notification Switch */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100/50">
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${settings.sound ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                {settings.sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div>
                <span className="font-bold text-xs text-slate-700 block">Avisos Sonoros (Chime)</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Toca um som suave ao receber uma novidade</span>
              </div>
            </div>
            <button
              onClick={() => handleToggle('sound')}
              className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer duration-300 ${
                settings.sound ? 'bg-blue-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  settings.sound ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Custom Channels / Preferences */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest pl-1">PREFERÊNCIAS DE EVENTO</h4>
            
            <div className="divide-y divide-slate-50 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-3xs">
              
              {/* Messages Toggle */}
              <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-blue-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-xs text-slate-700 block">Mensagens no Chat</span>
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
              <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-xs text-slate-700 block">Alarmes de Fuso Horário</span>
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
              <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-xs text-slate-700 block">Agenda & Lembretes</span>
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
              <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Pin className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-xs text-slate-700 block">Mural de Recados</span>
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
              <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-xs text-slate-700 block">Cartinhas Digitais</span>
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

        </div>

        {/* Action Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={handleTestNotification}
            className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{testSuccess ? 'Enviado com Sucesso!' : 'Enviar Teste 🔔'}</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </motion.div>
    </div>
  );
};
