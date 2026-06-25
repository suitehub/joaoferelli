/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { signInAnonymously } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';

import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AgendaPanel } from './components/AgendaPanel';
import { RecadosPanel } from './components/RecadosPanel';
import { MemoriasPanel } from './components/MemoriasPanel';
import { CartinhasPanel } from './components/CartinhasPanel';
import { ConversasPanel } from './components/ConversasPanel';
import { ConteudosPanel } from './components/ConteudosPanel';

import { auth, db, handleFirestoreError, OperationType } from './firebase';

import { 
  AgendaItem, 
  RecadoItem, 
  MemoriaItem, 
  CartinhaItem, 
  ConversaRoom, 
  ConteudoFile,
  ChatMessage
} from './types';

import {
  testConnection,
  seedDatabaseIfEmpty,
  addAgendaItemDb,
  updateAgendaItemDb,
  deleteAgendaItemDb,
  addRecadoItemDb,
  updateRecadoItemDb,
  deleteRecadoItemDb,
  addMemoriaItemDb,
  updateMemoriaItemDb,
  deleteMemoriaItemDb,
  addCartinhaItemDb,
  updateCartinhaItemDb,
  deleteCartinhaItemDb,
  addConversaRoomDb,
  deleteConversaRoomDb,
  addChatMessageDb,
  addConteudoFileDb,
  deleteConteudoFileDb,
  resetDatabaseDb
} from './utils/firebaseSync';

export default function App() {
  // Global States
  const [currentTab, setCurrentTab] = useState<'meu-mundo' | 'compartilhado'>('meu-mundo');
  const [activePanelId, setActivePanelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  // Splash Screen automatic entrance timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Panel State Collections (backed by Firestore with LocalStorage cache fallback)
  const [agenda, setAgenda] = useState<AgendaItem[]>(() => {
    const saved = localStorage.getItem('joao_agenda');
    return saved ? JSON.parse(saved) : [];
  });

  const [recados, setRecados] = useState<RecadoItem[]>(() => {
    const saved = localStorage.getItem('joao_recados');
    return saved ? JSON.parse(saved) : [];
  });

  const [memorias, setMemorias] = useState<MemoriaItem[]>(() => {
    const saved = localStorage.getItem('joao_memorias');
    return saved ? JSON.parse(saved) : [];
  });

  const [cartinhas, setCartinhas] = useState<CartinhaItem[]>(() => {
    const saved = localStorage.getItem('joao_cartinhas');
    return saved ? JSON.parse(saved) : [];
  });

  const [conversas, setConversas] = useState<ConversaRoom[]>(() => {
    const saved = localStorage.getItem('joao_conversas');
    return saved ? JSON.parse(saved) : [];
  });

  const [conteudos, setConteudos] = useState<ConteudoFile[]>(() => {
    const saved = localStorage.getItem('joao_conteudos');
    return saved ? JSON.parse(saved) : [];
  });

  // Chat Room-specific state
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestName, setGuestName] = useState<string>(() => {
    return localStorage.getItem('joao_guest_name') || '';
  });
  const [isResetting, setIsResetting] = useState(false);

  const handleResetData = async () => {
    if (confirm('Tem certeza de que deseja resetar completamente todos os dados do aplicativo para o estado original? Isso excluirá todas as suas alterações e restaurará os dados iniciais de fábrica.')) {
      setIsResetting(true);
      try {
        // Clear LocalStorage cache
        localStorage.removeItem('joao_agenda');
        localStorage.removeItem('joao_recados');
        localStorage.removeItem('joao_memorias');
        localStorage.removeItem('joao_cartinhas');
        localStorage.removeItem('joao_conversas');
        localStorage.removeItem('joao_conteudos');
        
        await resetDatabaseDb();
        alert('Dados resetados com sucesso! O aplicativo será recarregado.');
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert('Ocorreu um erro ao resetar os dados.');
      } finally {
        setIsResetting(false);
      }
    }
  };

  const ignoreHashChange = useRef(false);

  // 1. Firebase Authentication & DB Seeder
  useEffect(() => {
    const initFirebase = async () => {
      try {
        // Sign-in anonymously so every visitor has a valid uid for Zero-Trust rules
        try {
          await signInAnonymously(auth);
        } catch (authErr) {
          console.warn('Anonymous Auth is disabled in Firebase console, but continuing with unauthenticated access:', authErr);
        }
        setAuthReady(true);
        
        // Execute system-mandated connection check & seed empty DB collections
        await testConnection();
        await seedDatabaseIfEmpty();
      } catch (err) {
        console.error('Firebase Auth/Seed Error:', err);
        setAuthReady(true);
      }
    };
    initFirebase();
  }, []);

  // 2. Real-Time Snapshot Synchronization Listeners
  useEffect(() => {
    if (!authReady) return;

    const unsubAgenda = onSnapshot(collection(db, 'agenda'), (snap) => {
      const items: AgendaItem[] = [];
      snap.forEach(doc => {
        items.push(doc.data() as AgendaItem);
      });
      setAgenda(items);
      localStorage.setItem('joao_agenda', JSON.stringify(items));
    }, (err) => {
      console.error('Error listening to agenda:', err);
    });

    const unsubRecados = onSnapshot(collection(db, 'recados'), (snap) => {
      const items: RecadoItem[] = [];
      snap.forEach(doc => {
        items.push(doc.data() as RecadoItem);
      });
      setRecados(items);
      localStorage.setItem('joao_recados', JSON.stringify(items));
    }, (err) => {
      console.error('Error listening to recados:', err);
    });

    const unsubMemorias = onSnapshot(collection(db, 'memorias'), (snap) => {
      const items: MemoriaItem[] = [];
      snap.forEach(doc => {
        items.push(doc.data() as MemoriaItem);
      });
      setMemorias(items);
      localStorage.setItem('joao_memorias', JSON.stringify(items));
    }, (err) => {
      console.error('Error listening to memorias:', err);
    });

    const unsubCartinhas = onSnapshot(collection(db, 'cartinhas'), (snap) => {
      const items: CartinhaItem[] = [];
      snap.forEach(doc => {
        items.push(doc.data() as CartinhaItem);
      });
      setCartinhas(items);
      localStorage.setItem('joao_cartinhas', JSON.stringify(items));
    }, (err) => {
      console.error('Error listening to cartinhas:', err);
    });

    const unsubConteudos = onSnapshot(collection(db, 'conteudos'), (snap) => {
      const items: ConteudoFile[] = [];
      snap.forEach(doc => {
        items.push(doc.data() as ConteudoFile);
      });
      setConteudos(items);
      localStorage.setItem('joao_conteudos', JSON.stringify(items));
    }, (err) => {
      console.error('Error listening to conteudos:', err);
    });

    return () => {
      unsubAgenda();
      unsubRecados();
      unsubMemorias();
      unsubCartinhas();
      unsubConteudos();
    };
  }, [authReady]);

  // Real-Time Conversas (Rooms) Listener (Enforces guest mode privacy restriction)
  useEffect(() => {
    if (!authReady) return;

    if (isGuestMode) {
      if (!activeRoomId) return;
      // In Guest Mode, only subscribe to the single room they have a link for
      const roomDocRef = doc(db, 'conversas', activeRoomId);
      const unsubSingleRoom = onSnapshot(roomDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const roomData = docSnap.data();
          const singleRoom: ConversaRoom = {
            id: docSnap.id,
            name: roomData.name || '',
            avatarColor: roomData.avatarColor || '',
            description: roomData.description || '',
            createdAt: roomData.createdAt || '',
            personaPrompt: roomData.personaPrompt,
            messages: []
          };
          
          setConversas(prev => {
            const oldRoom = prev.find(r => r.id === singleRoom.id);
            const updatedSingle = {
              ...singleRoom,
              messages: oldRoom ? oldRoom.messages : []
            };
            const merged = [updatedSingle]; // Guest only gets to see/interact with this active room
            localStorage.setItem('joao_conversas', JSON.stringify(merged));
            return merged;
          });
        }
      }, (err) => {
        console.error(`Error listening to single room ${activeRoomId}:`, err);
      });

      return () => unsubSingleRoom();
    } else {
      // In Owner Mode, listen to all rooms
      const unsubConversas = onSnapshot(collection(db, 'conversas'), (snap) => {
        const items: ConversaRoom[] = [];
        snap.forEach(doc => {
          const roomData = doc.data();
          items.push({
            id: doc.id,
            name: roomData.name || '',
            avatarColor: roomData.avatarColor || '',
            description: roomData.description || '',
            createdAt: roomData.createdAt || '',
            personaPrompt: roomData.personaPrompt,
            messages: []
          } as ConversaRoom);
        });

        setConversas(prev => {
          const merged = items.map(room => {
            const oldRoom = prev.find(r => r.id === room.id);
            return {
              ...room,
              messages: oldRoom ? oldRoom.messages : []
            };
          });
          localStorage.setItem('joao_conversas', JSON.stringify(merged));
          return merged;
        });
      }, (err) => {
        console.error('Error listening to conversas:', err);
      });

      return () => unsubConversas();
    }
  }, [authReady, isGuestMode, activeRoomId]);

  // Real-Time Subcollection Messages Listener for Active Chat Room
  useEffect(() => {
    if (!authReady || !activeRoomId) return;

    const messagesColl = collection(db, 'conversas', activeRoomId, 'messages');

    const unsubMessages = onSnapshot(messagesColl, (snap) => {
      const msgs: ChatMessage[] = [];
      snap.forEach(doc => {
        msgs.push(doc.data() as ChatMessage);
      });

      // Robust in-memory sorting using chronological and monotonic ID properties
      msgs.sort((a, b) => {
        const getSortKey = (id: string) => {
          if (id.startsWith('msg-')) {
            const num = Number(id.replace('msg-', ''));
            return isNaN(num) ? Date.now() : num;
          }
          if (id.startsWith('msg')) {
            const num = Number(id.replace('msg', ''));
            return isNaN(num) ? 0 : num; // Ensure initial seeded messages are positioned chronologically first
          }
          return 0;
        };

        const keyA = getSortKey(a.id);
        const keyB = getSortKey(b.id);
        if (keyA !== keyB) {
          return keyA - keyB;
        }
        return a.timestamp.localeCompare(b.timestamp);
      });

      setConversas(prev => {
        const updated = prev.map(room => {
          if (room.id === activeRoomId) {
            return { ...room, messages: msgs };
          }
          return room;
        });
        localStorage.setItem('joao_conversas', JSON.stringify(updated));
        return updated;
      });
    }, (err) => {
      console.error(`Error listening to messages for active room ${activeRoomId}:`, err);
    });

    return () => unsubMessages();
  }, [authReady, activeRoomId]);

  useEffect(() => {
    if (guestName) {
      localStorage.setItem('joao_guest_name', guestName);
    }
  }, [guestName]);

  // Client-side Hash Router for direct link-based shared chats e.g. #/chat/familia
  useEffect(() => {
    const handleHashRoute = () => {
      if (ignoreHashChange.current) {
        ignoreHashChange.current = false;
        return;
      }
      const hash = window.location.hash;
      if (hash.startsWith('#/chat/')) {
        const roomId = hash.replace('#/chat/', '');
        setCurrentTab('compartilhado');
        setActivePanelId('conversas');
        setActiveRoomId(roomId);
        setIsGuestMode(true);
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
  }, [isGuestMode]);

  // Navigate panel
  const handleSelectPanel = (panelId: string | null) => {
    ignoreHashChange.current = true;
    setActivePanelId(panelId);
    // Sync hash URL
    if (panelId === 'conversas' && activeRoomId) {
      window.location.hash = `#/chat/${activeRoomId}`;
    } else if (!panelId) {
      window.location.hash = '';
    }
  };

  const handleSelectRoom = (roomId: string | null) => {
    ignoreHashChange.current = true;
    setActiveRoomId(roomId);
    if (roomId) {
      window.location.hash = `#/chat/${roomId}`;
    } else {
      window.location.hash = '';
    }
  };

  // State Updaters / Actions synchronized to Firestore DB

  // 1. Agenda actions
  const handleAddTask = (task: Omit<AgendaItem, 'id'>) => {
    const newTask: AgendaItem = {
      ...task,
      id: `task-${Date.now()}`
    };
    addAgendaItemDb(newTask);
  };

  const handleToggleTask = (id: string) => {
    const task = agenda.find(t => t.id === id);
    if (task) {
      const newStatus: AgendaItem['status'] = task.status === 'done' ? 'todo' : 'done';
      updateAgendaItemDb(id, { status: newStatus });
    }
  };

  const handleUpdateTaskStatus = (id: string, status: AgendaItem['status']) => {
    updateAgendaItemDb(id, { status });
  };

  const handleDeleteTask = (id: string) => {
    deleteAgendaItemDb(id);
  };

  // 2. Recados actions
  const handleAddRecado = (recado: Omit<RecadoItem, 'id' | 'createdAt' | 'isPinned'>) => {
    const newRecado: RecadoItem = {
      ...recado,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isPinned: false
    };
    addRecadoItemDb(newRecado);
  };

  const handlePinRecado = (id: string) => {
    const note = recados.find(r => r.id === id);
    if (note) {
      updateRecadoItemDb(id, { isPinned: !note.isPinned });
    }
  };

  const handleDeleteRecado = (id: string) => {
    deleteRecadoItemDb(id);
  };

  // 3. Memorias actions
  const handleAddMemoria = (memoria: Omit<MemoriaItem, 'id' | 'date' | 'createdAt'>) => {
    const newMemoria: MemoriaItem = {
      ...memoria,
      id: `mem-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      createdAt: new Date().toISOString()
    };
    addMemoriaItemDb(newMemoria);
  };

  const handleToggleMemoriaSharing = (id: string) => {
    const mem = memorias.find(m => m.id === id);
    if (mem) {
      updateMemoriaItemDb(id, { isShared: !mem.isShared });
    }
  };

  const handleDeleteMemoria = (id: string) => {
    deleteMemoriaItemDb(id);
  };

  // 4. Cartinhas actions
  const handleSendCartinha = (cartinha: Omit<CartinhaItem, 'id' | 'isOpened'>) => {
    const newCartinha: CartinhaItem = {
      ...cartinha,
      id: `letter-${Date.now()}`,
      isOpened: false
    };
    addCartinhaItemDb(newCartinha);
  };

  const handleOpenCartinha = (id: string) => {
    updateCartinhaItemDb(id, { isOpened: true });
  };

  const handleDeleteCartinha = (id: string) => {
    deleteCartinhaItemDb(id);
  };

  // 5. Conversas actions
  const handleAddRoom = (room: Omit<ConversaRoom, 'messages' | 'createdAt'>) => {
    const newRoom: Omit<ConversaRoom, 'messages'> = {
      ...room,
      createdAt: new Date().toLocaleDateString('pt-BR')
    };
    addConversaRoomDb(newRoom);
    setActiveRoomId(room.id);
  };

  const handleDeleteRoom = (roomId: string) => {
    deleteConversaRoomDb(roomId);
    if (activeRoomId === roomId) {
      setActiveRoomId(null);
    }
  };

  const handleSendMessage = (roomId: string, text: string, sender: 'owner' | 'guest', senderName: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender,
      senderName,
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    addChatMessageDb(roomId, newMessage);
  };

  // 6. Conteudos actions
  const handleAddFile = (file: Omit<ConteudoFile, 'id' | 'uploadDate'>) => {
    const newFile: ConteudoFile = {
      ...file,
      id: `file-${Date.now()}`,
      uploadDate: new Date().toLocaleDateString('pt-BR')
    };
    addConteudoFileDb(newFile);
  };

  const handleDeleteFile = (id: string) => {
    deleteConteudoFileDb(id);
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
        isGuestMode={isGuestMode}
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
                onDeleteRoom={handleDeleteRoom}
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
      <footer className="py-6 text-center text-[10px] text-slate-400 font-mono border-t border-slate-100 bg-white shrink-0 flex flex-col items-center gap-2">
        <div>Cabeça do João — Segundo Cérebro Digital © {new Date().getFullYear()}</div>
        <div className="text-slate-300">Construído em React com Inteligência Artificial Gemini</div>
        
        {!isGuestMode && (
          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="mt-2 text-[9px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
          >
            Resetar Mente (Dados de Fábrica)
          </button>
        )}
      </footer>

      {isResetting && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin" />
          </div>
          <p className="font-display font-bold text-lg">Resetando Mente do João...</p>
          <p className="text-xs text-slate-400 mt-2 font-mono">Restaurando dados iniciais de fábrica no Firestore</p>
        </div>
      )}

    </div>
  );
}
