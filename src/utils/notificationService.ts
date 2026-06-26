/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { toast } from 'react'; // React toast or custom state subscription

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  messages: boolean;
  alarms: boolean;
  agenda: boolean;
  recados: boolean;
  cartinhas: boolean;
}

export interface ToastMessage {
  id: string;
  title: string;
  body: string;
  type: 'message' | 'alarm' | 'agenda' | 'recado' | 'cartinha' | 'system';
  timestamp: Date;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  sound: true,
  messages: true,
  alarms: true,
  agenda: true,
  recados: true,
  cartinhas: true,
};

type ToastListener = (toast: ToastMessage) => void;
const listeners = new Set<ToastListener>();

export const notificationService = {
  getSettings(): NotificationSettings {
    const saved = localStorage.getItem('joao_notification_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: NotificationSettings) {
    localStorage.setItem('joao_notification_settings', JSON.stringify(settings));
  },

  subscribe(listener: ToastListener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.warn('Erro ao solicitar permissão de notificações:', err);
      return 'default';
    }
  },

  getPermissionState(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  },

  playChime() {
    const settings = this.getSettings();
    if (!settings.sound) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const playTone = (freq: number, start: number, duration: number, type: OscillatorType = 'sine') => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        
        // Custom envelope for soft attack and beautiful exponential decay (bell-like)
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(start);
        osc.stop(start + duration);
      };
      
      const now = ctx.currentTime;
      // Synthesize a beautiful, premium, 3-note harmonic chime (C Major Arpeggio)
      playTone(523.25, now, 0.4, 'triangle');       // C5 (Soft body)
      playTone(659.25, now + 0.08, 0.5, 'sine');     // E5 (Bright middle)
      playTone(783.99, now + 0.16, 0.7, 'sine');     // G5 (High pure bell resonance)
    } catch (err) {
      console.warn('AudioContext chime blocked by browser autoplace policy or unsupported:', err);
    }
  },

  trigger(
    title: string,
    body: string,
    type: 'message' | 'alarm' | 'agenda' | 'recado' | 'cartinha' | 'system'
  ) {
    const settings = this.getSettings();
    if (!settings.enabled) return;

    // Check individual category setting
    let isCategoryEnabled = true;
    if (type === 'message') isCategoryEnabled = settings.messages;
    else if (type === 'alarm') isCategoryEnabled = settings.alarms;
    else if (type === 'agenda') isCategoryEnabled = settings.agenda;
    else if (type === 'recado') isCategoryEnabled = settings.recados;
    else if (type === 'cartinha') isCategoryEnabled = settings.cartinhas;

    if (type !== 'system' && !isCategoryEnabled) {
      return;
    }

    // Play visual chime sound
    this.playChime();

    // Trigger in-app toast notifications first
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      body,
      type,
      timestamp: new Date(),
    };
    
    listeners.forEach((listener) => {
      try {
        listener(newToast);
      } catch (err) {
        console.error('Error in toast listener:', err);
      }
    });

    // Trigger browser system notification (Android, Samsung, iOS if in PWA/home screen, Desktop)
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: './logojoao.png',
          tag: `joao-${type}-${newToast.id}`,
          renotify: true,
        } as any);
      } catch (err) {
        // Fallback for mobile devices that require ServiceWorker registration for Notifications
        console.info('A notificação de sistema padrão falhou, usando ServiceWorker se disponível ou toast local:', err);
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, {
              body,
              icon: './logojoao.png',
              tag: `joao-${type}-${newToast.id}`,
            });
          }).catch(swErr => {
            console.debug('ServiceWorker não registrou notificação:', swErr);
          });
        }
      }
    }
  }
};
