/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Lock, User, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { Profile } from '../types';

interface EntranceProps {
  profiles: Profile[];
  onSelectProfile: (profile: Profile) => void;
}

export const Entrance: React.FC<EntranceProps> = ({ profiles, onSelectProfile }) => {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
    if (code.trim() === 'adm') {
      if (selectedProfile) {
        onSelectProfile(selectedProfile);
      }
    } else {
      setError('Código administrativo incorreto. Tente novamente.');
      setCode('');
    }
  };

  const handleProfileClick = (profile: Profile) => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
    if (profile.isAdmin) {
      setSelectedProfile(profile);
      setCode('');
      setError('');
    } else {
      // Non-admin profiles enter instantly from the landing portal
      onSelectProfile(profile);
    }
  };

  // Ensure João is always at the top of the list
  const sortedProfiles = [...profiles].sort((a, b) => {
    if (a.isAdmin && !b.isAdmin) return -1;
    if (!a.isAdmin && b.isAdmin) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 select-none antialiased font-sans">
      <div className="max-w-md w-full">
        
        {/* Logo and Greeting Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="w-20 h-20 bg-white border border-slate-100 rounded-3xl flex items-center justify-center mx-auto shadow-sm mb-4 p-1 overflow-hidden"
          >
            <img 
              src="./logojoao.png" 
              alt="Cabeça do João" 
              className="w-full h-full object-cover rounded-2xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = "w-full h-full rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center font-display font-black text-2xl";
                  fallback.innerText = "CJ";
                  parent.appendChild(fallback);
                }
              }}
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-display font-extrabold text-3xl text-slate-800 tracking-tight"
          >
            Cabeça do João
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed"
          >
            Segundo Cérebro Digital do João. Organize, compartilhe e conecte-se de forma inteligente.
          </motion.p>
        </div>

        {/* Profile Card View */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs"
        >
          <AnimatePresence mode="wait">
            {!selectedProfile ? (
              <motion.div
                key="profile-list"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <h2 className="font-display font-bold text-base text-slate-800 text-center mb-6">
                  Quem está acessando?
                </h2>

                <div className="space-y-3">
                  {sortedProfiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleProfileClick(p)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                        p.isAdmin
                          ? 'border-rose-100 hover:border-rose-300 hover:bg-rose-50/20 bg-rose-50/10'
                          : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
                      } group`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-slate-100 overflow-hidden flex items-center justify-center bg-slate-50 shrink-0">
                          <img 
                            src="./logojoao.png" 
                            alt={p.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const fallback = document.createElement('div');
                                fallback.className = `w-full h-full flex items-center justify-center font-bold text-xs ${
                                  p.isAdmin ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600'
                                }`;
                                fallback.innerText = p.name.substring(0, 2).toUpperCase();
                                parent.appendChild(fallback);
                              }
                            }}
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-800">{p.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {p.isAdmin ? 'Administrador Principal' : 'Conexão Convidada'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {p.isAdmin && <Lock className="w-3.5 h-3.5 text-rose-500" />}
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    <HelpCircle className="w-3 h-3" />
                    <span>Acesso privado com controle de áreas</span>
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="code-prompt"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <button 
                    onClick={() => setSelectedProfile(null)}
                    className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
                  >
                    ← Voltar aos perfis
                  </button>
                </div>

                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-base text-slate-800">Acesso Restrito</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Insira o código administrativo para entrar como <strong>{selectedProfile.name}</strong>.
                  </p>
                </div>

                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div>
                    <input
                      type="password"
                      required
                      placeholder="Código administrativo"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full text-center text-sm font-semibold tracking-widest bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-hidden focus:border-rose-500 text-slate-800"
                      autoFocus
                    />
                  </div>

                  {error && (
                    <p className="text-center text-[11px] font-medium text-rose-600">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirmar Identidade</span>
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Small footer credit */}
        <div className="text-center mt-6 text-[10px] font-mono text-slate-400">
          Desenvolvido com carinho para o João Ferelli • v1.1.0
        </div>
      </div>
    </div>
  );
};
