/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AgendaPanel } from './components/AgendaPanel';
import { RecadosPanel } from './components/RecadosPanel';
import { MemoriasPanel } from './components/MemoriasPanel';
import { CartinhasPanel } from './components/CartinhasPanel';
import { ConversasPanel } from './components/ConversasPanel';
import { ConteudosPanel } from './components/ConteudosPanel';

import { 
  initialAgenda, 
  initialRecados, 
  initialMemorias, 
  initialCartinhas, 
  initialConversas, 
  initialConteudos 
} from './data/initialData';

import { 
  AgendaItem, 
  RecadoItem, 
  MemoriaItem, 
  CartinhaItem, 
  ConversaRoom, 
  ConteudoFile 
} from './types';

export default function App() {
  // Global States
  const [currentTab, setCurrentTab] = useState<'meu-mundo' | 'compartilhado'>('meu-mundo');
  const [activePanelId, setActivePanelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Splash Screen automatic entrance timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Panel State Collections (with localStorage persistence fallback)
  const [agenda, setAgenda] = useState<AgendaItem[]>(() => {
    const saved = localStorage.getItem('joao_agenda');
    return saved ? JSON.parse(saved) : initialAgenda;
  });

  const [recados, setRecados] = useState<RecadoItem[]>(() => {
    const saved = localStorage.getItem('joao_recados');
    return saved ? JSON.parse(saved) : initialRecados;
  });

  const [memorias, setMemorias] = useState<MemoriaItem[]>(() => {
    const saved = localStorage.getItem('joao_memorias');
    return saved ? JSON.parse(saved) : initialMemorias;
  });

  const [cartinhas, setCartinhas] = useState<CartinhaItem[]>(() => {
    const saved = localStorage.getItem('joao_cartinhas');
    return saved ? JSON.parse(saved) : initialCartinhas;
  });

  const [conversas, setConversas] = useState<ConversaRoom[]>(() => {
    const saved = localStorage.getItem('joao_conversas');
    return saved ? JSON.parse(saved) : initialConversas;
  });

  const [conteudos, setConteudos] = useState<ConteudoFile[]>(() => {
    const saved = localStorage.getItem('joao_conteudos');
    return saved ? JSON.parse(saved) : initialConteudos;
  });

  // Chat Room-specific state
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestName, setGuestName] = useState<string>(() => {
    return localStorage.getItem('joao_guest_name') || '';
  });

  // LocalStorage Auto-Syncing
  useEffect(() => {
    localStorage.setItem('joao_agenda', JSON.stringify(agenda));
  }, [agenda]);

  useEffect(() => {
    localStorage.setItem('joao_recados', JSON.stringify(recados));
  }, [recados]);

  useEffect(() => {
    localStorage.setItem('joao_memorias', JSON.stringify(memorias));
  }, [memorias]);

  useEffect(() => {
    localStorage.setItem('joao_cartinhas', JSON.stringify(cartinhas));
  }, [cartinhas]);

  useEffect(() => {
    localStorage.setItem('joao_conversas', JSON.stringify(conversas));
  }, [conversas]);

  useEffect(() => {
    localStorage.setItem('joao_conteudos', JSON.stringify(conteudos));
  }, [conteudos]);

  useEffect(() => {
    if (guestName) {
      localStorage.setItem('joao_guest_name', guestName);
    }
  }, [guestName]);

  // Client-side Hash Router for direct link-based shared chats e.g. #/chat/familia
  useEffect(() => {
    const handleHashRoute = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/chat/')) {
        const roomId = hash.replace('#/chat/', '');
        const exists = conversas.some(room => room.id === roomId);
        if (exists) {
          setCurrentTab('compartilhado');
          setActivePanelId('conversas');
          setActiveRoomId(roomId);
          setIsGuestMode(true);
        }
      } else if (hash === '' || hash === '#/') {
        // Only reset if previously in guest mode, to allow normal internal navigation
        if (isGuestMode) {
          setIsGuestMode(false);
          setActivePanelId(null);
          setActiveRoomId(null);
        }
      }
    };

    // Run on mount and listen to changes
    handleHashRoute();
    window.addEventListener('hashchange', handleHashRoute);
    return () => window.removeEventListener('hashchange', handleHashRoute);
  }, [conversas, isGuestMode]);

  // Navigate panel
  const handleSelectPanel = (panelId: string | null) => {
    setActivePanelId(panelId);
    // Sync hash URL
    if (panelId === 'conversas' && activeRoomId) {
      window.location.hash = `#/chat/${activeRoomId}`;
    } else if (!panelId) {
      window.location.hash = '';
    }
  };

  const handleSelectRoom = (roomId: string | null) => {
    setActiveRoomId(roomId);
    if (roomId) {
      window.location.hash = `#/chat/${roomId}`;
    } else {
      window.location.hash = '';
    }
  };

  // State Updaters / Actions
  
  // 1. Agenda actions
  const handleAddTask = (task: Omit<AgendaItem, 'id'>) => {
    const newTask: AgendaItem = {
      ...task,
      id: `task-${Date.now()}`
    };
    setAgenda(prev => [newTask, ...prev]);
  };

  const handleToggleTask = (id: string) => {
    setAgenda(prev => prev.map(task => 
      task.id === id ? { ...task, status: task.status === 'done' ? 'todo' : 'done' } : task
    ));
  };

  const handleUpdateTaskStatus = (id: string, status: AgendaItem['status']) => {
    setAgenda(prev => prev.map(task => 
      task.id === id ? { ...task, status } : task
    ));
  };

  const handleDeleteTask = (id: string) => {
    setAgenda(prev => prev.filter(task => task.id !== id));
  };

  // 2. Recados actions
  const handleAddRecado = (recado: Omit<RecadoItem, 'id' | 'createdAt' | 'isPinned'>) => {
    const newRecado: RecadoItem = {
      ...recado,
      id: `note-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      isPinned: false
    };
    setRecados(prev => [newRecado, ...prev]);
  };

  const handlePinRecado = (id: string) => {
    setRecados(prev => prev.map(note => 
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    ));
  };

  const handleDeleteRecado = (id: string) => {
    setRecados(prev => prev.filter(note => note.id !== id));
  };

  // 3. Memorias actions
  const handleAddMemoria = (memoria: Omit<MemoriaItem, 'id' | 'date'>) => {
    const newMemoria: MemoriaItem = {
      ...memoria,
      id: `mem-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
    };
    setMemorias(prev => [newMemoria, ...prev]);
  };

  const handleToggleMemoriaSharing = (id: string) => {
    setMemorias(prev => prev.map(mem => 
      mem.id === id ? { ...mem, isShared: !mem.isShared } : mem
    ));
  };

  const handleDeleteMemoria = (id: string) => {
    setMemorias(prev => prev.filter(mem => mem.id !== id));
  };

  // 4. Cartinhas actions
  const handleSendCartinha = (cartinha: Omit<CartinhaItem, 'id' | 'isOpened'>) => {
    const newCartinha: CartinhaItem = {
      ...cartinha,
      id: `letter-${Date.now()}`,
      isOpened: false
    };
    setCartinhas(prev => [newCartinha, ...prev]);
  };

  const handleOpenCartinha = (id: string) => {
    setCartinhas(prev => prev.map(letter => 
      letter.id === id ? { ...letter, isOpened: true } : letter
    ));
  };

  const handleDeleteCartinha = (id: string) => {
    setCartinhas(prev => prev.filter(letter => letter.id !== id));
  };

  // 5. Conversas actions
  const handleAddRoom = (room: Omit<ConversaRoom, 'messages' | 'createdAt'>) => {
    const newRoom: ConversaRoom = {
      ...room,
      messages: [],
      createdAt: new Date().toLocaleDateString('pt-BR')
    };
    setConversas(prev => [...prev, newRoom]);
    setActiveRoomId(room.id);
  };

  const handleSendMessage = (roomId: string, text: string, sender: 'owner' | 'guest', senderName: string) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender,
      senderName,
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setConversas(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          messages: [...room.messages, newMessage]
        };
      }
      return room;
    }));
  };

  // 6. Conteudos actions
  const handleAddFile = (file: Omit<ConteudoFile, 'id' | 'uploadDate'>) => {
    const newFile: ConteudoFile = {
      ...file,
      id: `file-${Date.now()}`,
      uploadDate: new Date().toLocaleDateString('pt-BR')
    };
    setConteudos(prev => [newFile, ...prev]);
  };

  const handleDeleteFile = (id: string) => {
    setConteudos(prev => prev.filter(file => file.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none antialiased">
      
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="splash-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white p-6 overflow-hidden select-none"
          >
            {/* Background design elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,58,138,0.25)_0%,rgba(2,6,23,1)_80%)] pointer-events-none" />
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl" />

            <div className="relative flex flex-col items-center max-w-sm w-full text-center z-10">
              {/* Glowing outer ring for the big logo */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
                className="relative mb-6"
              >
                <div className="absolute -inset-2 bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-500 rounded-full blur-sm opacity-80 animate-pulse" style={{ animationDuration: '3s' }} />
                <div className="relative w-32 h-32 rounded-full bg-slate-900 border-4 border-slate-950 shadow-2xl overflow-hidden flex items-center justify-center">
                  <img 
                    src="./logojoao.png" 
                    alt="Cabeça do João" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = "w-full h-full rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center font-display font-black text-4xl";
                        fallback.innerText = "CJ";
                        parent.appendChild(fallback);
                      }
                    }}
                    referrerPolicy="no-referrer"
                  />
                </div>
              </motion.div>

              {/* Dynamic Welcoming Header */}
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <h2 className="font-display font-black text-3xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent mb-1.5">
                  Seja Bem-Vindo, João!
                </h2>
                <p className="text-[11px] text-blue-400 font-mono font-bold tracking-widest uppercase mb-6">
                  Segundo Cérebro Digital
                </p>
              </motion.div>

              {/* Fancy loading bar */}
              <div className="w-40 bg-white/10 h-1 rounded-full overflow-hidden mb-3 relative">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full"
                />
              </div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="text-[10px] text-slate-400 font-sans font-semibold tracking-wide"
              >
                Carregando mente e memórias...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header element controls */}
      <Header 
        currentTab={currentTab}
        activePanel={activePanelId}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          setActivePanelId(null);
          window.location.hash = '';
        }}
        onBack={() => handleSelectPanel(null)}
      />

      {/* Main app viewport content */}
      <main className="flex-1">
        {activePanelId === null ? (
          <Dashboard 
            currentTab={currentTab}
            onSelectPanel={handleSelectPanel}
            agenda={agenda}
            recados={recados}
            memorias={memorias}
            cartinhas={cartinhas}
            conversas={conversas}
            conteudos={conteudos}
          />
        ) : (
          <div className="animate-fade-in">
            {activePanelId === 'agenda' && (
              <AgendaPanel 
                items={agenda}
                onAddItem={handleAddTask}
                onUpdateStatus={handleUpdateTaskStatus}
                onDeleteItem={handleDeleteTask}
              />
            )}

            {activePanelId === 'recados' && (
              <RecadosPanel 
                notes={recados}
                onAddNote={handleAddRecado}
                onPinNote={handlePinRecado}
                onDeleteNote={handleDeleteRecado}
                currentTab={currentTab}
              />
            )}

            {activePanelId === 'memorias' && (
              <MemoriasPanel 
                memorias={memorias}
                onAddMemoria={handleAddMemoria}
                onToggleSharing={handleToggleMemoriaSharing}
                onDeleteMemoria={handleDeleteMemoria}
                currentTab={currentTab}
              />
            )}

            {activePanelId === 'cartinhas' && (
              <CartinhasPanel 
                letters={cartinhas}
                onSendLetter={handleSendCartinha}
                onOpenLetter={handleOpenCartinha}
                onDeleteLetter={handleDeleteCartinha}
                currentTab={currentTab}
              />
            )}

            {activePanelId === 'conversas' && (
              <ConversasPanel 
                rooms={conversas}
                activeRoomId={activeRoomId}
                onSelectRoom={handleSelectRoom}
                onAddRoom={handleAddRoom}
                onSendMessage={handleSendMessage}
                isGuestMode={isGuestMode}
                guestName={guestName}
                onSetGuestName={setGuestName}
              />
            )}

            {activePanelId === 'conteudos' && (
              <ConteudosPanel 
                files={conteudos}
                onAddFile={handleAddFile}
                onDeleteFile={handleDeleteFile}
              />
            )}
          </div>
        )}
      </main>

      {/* Tiny clean footer credit */}
      <footer className="py-6 text-center text-[10px] text-slate-400 font-mono border-t border-slate-100 bg-white shrink-0">
        <div>Cabeça do João — Segundo Cérebro Digital © {new Date().getFullYear()}</div>
        <div className="mt-1 text-slate-300">Construído em React com Inteligência Artificial Gemini</div>
      </footer>

    </div>
  );
}
