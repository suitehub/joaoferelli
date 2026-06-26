/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Bell, 
  Calendar, 
  Pin, 
  Mail, 
  X, 
  Volume2, 
  VolumeX, 
  AlertCircle
} from 'lucide-react';
import { notificationService, ToastMessage } from '../utils/notificationService';

export const NotificationToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    // Subscribe to new notifications triggered globally
    const unsubscribe = notificationService.subscribe((newToast) => {
      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep last 5 toasts

      // Auto-dismiss after 6 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 6000);
    });

    return unsubscribe;
  }, []);

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getToastIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'alarm':
        return <Bell className="w-5 h-5 text-rose-500" />;
      case 'agenda':
        return <Calendar className="w-5 h-5 text-emerald-500" />;
      case 'recado':
        return <Pin className="w-5 h-5 text-amber-500 font-bold" />;
      case 'cartinha':
        return <Mail className="w-5 h-5 text-indigo-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  const getToastBg = (type: ToastMessage['type']) => {
    switch (type) {
      case 'message': return 'border-blue-100 bg-blue-50/50';
      case 'alarm': return 'border-rose-100 bg-rose-50/50';
      case 'agenda': return 'border-emerald-100 bg-emerald-50/50';
      case 'recado': return 'border-amber-100 bg-amber-50/50';
      case 'cartinha': return 'border-indigo-100 bg-indigo-50/50';
      default: return 'border-slate-100 bg-slate-50/50';
    }
  };

  const getCategoryLabel = (type: ToastMessage['type']) => {
    switch (type) {
      case 'message': return 'Nova Mensagem';
      case 'alarm': return 'Alarme Fuso';
      case 'agenda': return 'Remendador Agenda';
      case 'recado': return 'Mural de Recados';
      case 'cartinha': return 'Cartinha de Amor';
      default: return 'Aviso do Sistema';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] max-w-sm w-full pointer-events-none flex flex-col gap-2 px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
            className={`w-full pointer-events-auto bg-white/95 backdrop-blur-md border rounded-2xl p-4 shadow-xl flex items-start gap-3 relative overflow-hidden group ${getToastBg(toast.type)}`}
          >
            {/* Left accent color bar */}
            <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
              toast.type === 'message' ? 'bg-blue-500' :
              toast.type === 'alarm' ? 'bg-rose-500' :
              toast.type === 'agenda' ? 'bg-emerald-500' :
              toast.type === 'recado' ? 'bg-amber-500' :
              toast.type === 'cartinha' ? 'bg-indigo-500' : 'bg-slate-500'
            }`} />

            {/* Icon */}
            <div className="shrink-0 p-1 bg-white rounded-lg shadow-2xs border border-slate-50">
              {getToastIcon(toast.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">
                {getCategoryLabel(toast.type)}
              </span>
              <h4 className="font-bold text-sm text-slate-800 leading-tight truncate">
                {toast.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-normal line-clamp-2">
                {toast.body}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => handleDismiss(toast.id)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            
            {/* Bottom animated active life indicator */}
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 6, ease: 'linear' }}
              className={`absolute bottom-0 left-0 right-0 h-1 opacity-40 ${
                toast.type === 'message' ? 'bg-blue-500' :
                toast.type === 'alarm' ? 'bg-rose-500' :
                toast.type === 'agenda' ? 'bg-emerald-500' :
                toast.type === 'recado' ? 'bg-amber-500' :
                toast.type === 'cartinha' ? 'bg-indigo-500' : 'bg-slate-500'
              }`}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
