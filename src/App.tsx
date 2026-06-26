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
import { TimezonePanel } from './components/TimezonePanel';
import { Entrance } from './components/Entrance';
import { ProfilePanel } from './components/ProfilePanel';
import { NotificationSettingsPanel } from './components/NotificationSettingsPanel';
import { NotificationToastContainer } from './components/NotificationToastContainer';
import { notificationService } from './utils/notificationService';

import { auth, db, handleFirestoreError, OperationType } from './firebase';

import { 
  AgendaItem, 
  RecadoItem, 
  MemoriaItem, 
  CartinhaItem, 
  ConversaRoom, 
  ConteudoFile,
  ChatMessage,
  TimezoneAlarm,
  JoaoStatus,
  Profile,
  ProfilePermissions
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
  updateJoaoStatusDb,
  addTimezoneAlarmDb,
  deleteTimezoneAlarmDb,
  addProfileDb,
  updateProfileDb,
  deleteProfileDb
} from './utils/firebaseSync';

export default function App() {
  const appStartTime = useRef<number>(Date.now());

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

  const [joaoStatus, setJoaoStatus] = useState<JoaoStatus['status']>(() => {
    const saved = localStorage.getItem('joao_status');
    return (saved as JoaoStatus['status']) || 'acordado';
  });

  const [timezoneAlarms, setTimezoneAlarms] = useState<TimezoneAlarm[]>(() => {
    const saved = localStorage.getItem('joao_timezone_alarms');
    return saved ? JSON.parse(saved) : [];
  });

  // User Profile States
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem('joao_profiles');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentProfile, setCurrentProfile] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('joao_current_profile');
    return saved ? JSON.parse(saved) : null;
  });

  // Chat Room-specific state
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestName, setGuestName] = useState<string>(() => {
    return localStorage.getItem('joao_guest_name') || '';
  });

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

    const unsubProfiles = onSnapshot(collection(db, 'profiles'), (snap) => {
      const items: Profile[] = [];
      snap.forEach(doc => {
        items.push(doc.data() as Profile);
      });
      // Seed default admin if missing
      const hasAdmin = items.some(p => p.isAdmin);
      if (!hasAdmin && items.length === 0) {
        const defaultAdmin: Profile = {
          id: 'joao-ferelli',
          name: 'João Ferelli',
          code: 'adm',
          isAdmin: true,
          permissions: {
            agenda: 'edit',
            recados: 'edit',
            memorias: 'edit',
            cartinhas: 'edit',
            conversas: 'edit',
            conteudos: 'edit',
            timezone: 'edit'
          },
          createdAt: new Date().toISOString()
        };
        addProfileDb(defaultAdmin);
        items.push(defaultAdmin);
      }
      setProfiles(items);
      localStorage.setItem('joao_profiles', JSON.stringify(items));
    }, (err) => {
      console.error('Error listening to profiles:', err);
    });

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

      // Notify for newly added recados
      snap.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data() as RecadoItem;
          const createdTime = Date.parse(data.createdAt || '');
          if (!isNaN(createdTime) && createdTime > appStartTime.current) {
            notificationService.trigger(
              'Novo Recado no Mural! 📌',
              `"${data.title}" por ${data.createdByName || 'Convidado'}`,
              'recado'
            );
          }
        }
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

      // Notify for newly added cartinhas
      snap.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data() as CartinhaItem;
          let createdTime = Date.now();
          if (data.id && data.id.startsWith('letter-')) {
            const ts = Number(data.id.replace('letter-', ''));
            if (!isNaN(ts)) {
              createdTime = ts;
            }
          }
          if (createdTime > appStartTime.current) {
            notificationService.trigger(
              'Nova Cartinha de Amor! 💌',
              `Você recebeu a cartinha "${data.title}" de ${data.sender}`,
              'cartinha'
            );
          }
        }
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

    const unsubStatus = onSnapshot(doc(db, 'status_joao', 'current'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const statusVal = data.status || 'acordado';
        setJoaoStatus(statusVal);
        localStorage.setItem('joao_status', statusVal);
      } else {
        setJoaoStatus('acordado');
        localStorage.setItem('joao_status', 'acordado');
      }
    }, (err) => {
      console.error('Error listening to joao status:', err);
    });

    const unsubAlarms = onSnapshot(collection(db, 'fuso_horario_alarmes'), (snap) => {
      const items: TimezoneAlarm[] = [];
      snap.forEach(doc => {
        items.push(doc.data() as TimezoneAlarm);
      });
      // Sort newest first
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setTimezoneAlarms(items);
      localStorage.setItem('joao_timezone_alarms', JSON.stringify(items));
    }, (err) => {
      console.error('Error listening to timezone alarms:', err);
    });

    return () => {
      unsubProfiles();
      unsubAgenda();
      unsubRecados();
      unsubMemorias();
      unsubCartinhas();
      unsubConteudos();
      unsubStatus();
      unsubAlarms();
    };
  }, [authReady]);

  // 2.1 URL direct link login for created profiles
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const profileIdParam = params.get('profileId');
    if (profileIdParam && profiles.length > 0) {
      const matched = profiles.find(p => p.id === profileIdParam);
      if (matched) {
        setCurrentProfile(matched);
        localStorage.setItem('joao_current_profile', JSON.stringify(matched));
        // Clear query parameters nicely
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [profiles]);

  // Real-Time Conversas (Rooms) Listener (Enforces guest mode privacy restriction)
  useEffect(() => {
    if (!authReady) return;

    const isRestricted = isGuestMode || (currentProfile && !currentProfile.isAdmin);
    const targetRoomId = isRestricted 
      ? (activeRoomId || (currentProfile ? `room-${currentProfile.id}` : null))
      : null;

    if (isRestricted) {
      if (!targetRoomId) return;
      // In Guest Mode or non-admin Profile, only subscribe to their specific room
      const roomDocRef = doc(db, 'conversas', targetRoomId);
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
            const merged = [updatedSingle]; // Guest or non-admin only gets to see/interact with this room
            localStorage.setItem('joao_conversas', JSON.stringify(merged));
            return merged;
          });
        }
      }, (err) => {
        console.error(`Error listening to single room ${targetRoomId}:`, err);
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
  }, [authReady, isGuestMode, activeRoomId, currentProfile]);

  // Real-Time Subcollection Messages Listener for Active Chat Room
  useEffect(() => {
    if (!authReady) return;

    const isRestricted = isGuestMode || (currentProfile && !currentProfile.isAdmin);
    const targetRoomId = activeRoomId || (isRestricted && currentProfile ? `room-${currentProfile.id}` : null);

    if (!targetRoomId) return;

    const messagesColl = collection(db, 'conversas', targetRoomId, 'messages');

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
          if (room.id === targetRoomId) {
            return { ...room, messages: msgs };
          }
          return room;
        });
        localStorage.setItem('joao_conversas', JSON.stringify(updated));
        return updated;
      });
    }, (err) => {
      console.error(`Error listening to messages for active room ${targetRoomId}:`, err);
    });

    return () => unsubMessages();
  }, [authReady, activeRoomId, isGuestMode, currentProfile]);

  useEffect(() => {
    if (guestName) {
      localStorage.setItem('joao_guest_name', guestName);
    }
  }, [guestName]);

  // 3. Real-time notification listeners for new messages
  useEffect(() => {
    if (!authReady) return;

    // A map to store unsubscribe functions for each room's messages
    const roomMessageUnsubs: { [roomId: string]: () => void } = {};

    // Helper to setup snapshot listener for a room
    const listenToRoomMessages = (roomId: string) => {
      if (roomMessageUnsubs[roomId]) return; // Already listening

      const msgsColl = collection(db, 'conversas', roomId, 'messages');
      roomMessageUnsubs[roomId] = onSnapshot(msgsColl, (snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const msg = change.doc.data() as ChatMessage;
            
            // Check if this message was sent after the app loaded
            const msgTimeStr = msg.createdAt || msg.timestamp;
            const msgTime = Date.parse(msgTimeStr || '');
            const isHistorical = !msg.createdAt || isNaN(msgTime) || msgTime <= appStartTime.current;
            
            if (!isHistorical) {
              // Determine if we should notify
              // 1. Don't notify if the message was sent by the current user
              const currentUserRole = currentProfile?.isAdmin ? 'owner' : 'guest';
              const isFromSelf = msg.sender === currentUserRole && (
                currentUserRole === 'guest' ? msg.senderName === guestName : true
              );
              
              if (!isFromSelf) {
                // Find room name
                const room = conversas.find(r => r.id === roomId);
                const roomName = room ? room.name : 'Conversas';
                
                notificationService.trigger(
                  `Nova Mensagem em ${roomName} 💬`,
                  `${msg.senderName}: "${msg.text}"`,
                  'message'
                );
              }
            }
          }
        });
      }, (err) => {
        console.error(`Error listening notifications for room ${roomId}:`, err);
      });
    };

    const isRestricted = isGuestMode || (currentProfile && !currentProfile.isAdmin);
    
    if (isRestricted) {
      const guestRoomId = currentProfile ? `room-${currentProfile.id}` : (activeRoomId || '');
      if (guestRoomId) {
        listenToRoomMessages(guestRoomId);
      }
    } else {
      // Admin: listen to all loaded rooms
      conversas.forEach((room) => {
        listenToRoomMessages(room.id);
      });
    }

    return () => {
      // Clean up all message listeners
      Object.values(roomMessageUnsubs).forEach((unsub) => unsub());
    };
  }, [authReady, conversas.length, isGuestMode, currentProfile, activePanelId, activeRoomId]);

  // 4. Background interval for active alarms and agenda reminders
  useEffect(() => {
    let lastCheckedMinute = '';
    
    const checkInterval = setInterval(() => {
      const now = new Date();
      
      const formatterBraz = new Intl.DateTimeFormat('pt-BR', { 
        timeZone: 'America/Sao_Paulo', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });
      
      const formatterEgy = new Intl.DateTimeFormat('pt-BR', { 
        timeZone: 'Africa/Cairo', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });

      const dateParts = new Intl.DateTimeFormat('pt-BR', { 
        timeZone: 'America/Sao_Paulo', 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }).formatToParts(now);
      
      const year = dateParts.find(p => p.type === 'year')?.value;
      const month = dateParts.find(p => p.type === 'month')?.value;
      const day = dateParts.find(p => p.type === 'day')?.value;
      const todayBrazilStr = `${year}-${month}-${day}`;
      
      const timeBrazil = formatterBraz.format(now);
      const timeEgypt = formatterEgy.format(now);
      
      const currentMinuteKey = `${todayBrazilStr}-${timeBrazil}`;
      if (currentMinuteKey === lastCheckedMinute) return;
      lastCheckedMinute = currentMinuteKey;
      
      // Check alarms
      timezoneAlarms.forEach((alarm) => {
        const isBrazilMatch = alarm.timeBrazil === timeBrazil;
        const isEgyptMatch = alarm.timeEgypt === timeEgypt;
        
        if (isBrazilMatch || isEgyptMatch) {
          notificationService.trigger(
            `Alarme de Fuso Ativado! ⏰`,
            `Alarme: "${alarm.title}" (BR: ${alarm.timeBrazil} | EG: ${alarm.timeEgypt})`,
            'alarm'
          );
        }
      });

      // Check agenda
      agenda.forEach((item) => {
        if (item.date === todayBrazilStr && item.time === timeBrazil && item.status !== 'done') {
          notificationService.trigger(
            `Lembrete de Atividade! 📅`,
            `Está na hora: "${item.title}" (${item.priority === 'high' ? 'Prioridade Alta' : 'Atividade Agendada'})`,
            'agenda'
          );
        }
      });

    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkInterval);
  }, [timezoneAlarms, agenda]);

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
    if (panelId === 'conversas') {
      const targetId = (currentProfile && !currentProfile.isAdmin) 
        ? `room-${currentProfile.id}` 
        : activeRoomId;
      if (targetId) {
        setActiveRoomId(targetId);
        window.location.hash = `#/chat/${targetId}`;
      }
    } else if (!panelId) {
      window.location.hash = '';
    }
  };

  useEffect(() => {
    if (activePanelId === 'conversas' && currentProfile && !currentProfile.isAdmin) {
      const dedicatedRoomId = `room-${currentProfile.id}`;
      if (activeRoomId !== dedicatedRoomId) {
        setActiveRoomId(dedicatedRoomId);
        window.location.hash = `#/chat/${dedicatedRoomId}`;
      }
    }
  }, [activePanelId, currentProfile, activeRoomId]);

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
      id: `task-${Date.now()}`,
      createdByName: currentProfile?.name || 'Anônimo'
    };
    addAgendaItemDb(newTask);
  };

  const handleToggleTask = (id: string) => {
    const task = agenda.find(t => t.id === id);
    if (task) {
      const newStatus: AgendaItem['status'] = task.status === 'done' ? 'todo' : 'done';
      updateAgendaItemDb(id, { 
        status: newStatus,
        updatedByName: currentProfile?.name || 'Anônimo'
      });
    }
  };

  const handleUpdateTaskStatus = (id: string, status: AgendaItem['status']) => {
    updateAgendaItemDb(id, { 
      status,
      updatedByName: currentProfile?.name || 'Anônimo'
    });
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
      isPinned: false,
      createdByName: currentProfile?.name || 'Anônimo'
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
      createdAt: new Date().toISOString(),
      createdByName: currentProfile?.name || 'Anônimo'
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
      isOpened: false,
      createdByName: currentProfile?.name || 'Anônimo'
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
    const currentName = currentProfile ? currentProfile.name : senderName;
    const currentSender = currentProfile?.isAdmin ? 'owner' : 'guest';

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: currentSender,
      senderName: currentName || 'Visitante',
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };
    addChatMessageDb(roomId, newMessage);
  };

  // 6. Conteudos actions
  const handleAddFile = (file: Omit<ConteudoFile, 'id' | 'uploadDate'>) => {
    const newFile: ConteudoFile = {
      ...file,
      id: `file-${Date.now()}`,
      uploadDate: new Date().toLocaleDateString('pt-BR'),
      createdByName: currentProfile?.name || 'Anônimo'
    };
    addConteudoFileDb(newFile);
  };

  const handleDeleteFile = (id: string) => {
    deleteConteudoFileDb(id);
  };

  // 7. Joao Status and Timezone Alarms Actions
  const handleUpdateStatus = async (newStatus: JoaoStatus['status']) => {
    setJoaoStatus(newStatus);
    localStorage.setItem('joao_status', newStatus);
    await updateJoaoStatusDb(newStatus);
  };

  const handleAddTimezoneAlarm = async (alarmData: Omit<TimezoneAlarm, 'id' | 'createdAt'>) => {
    const newAlarm: TimezoneAlarm = {
      ...alarmData,
      id: `alarm-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdByName: currentProfile?.name || 'Anônimo'
    };
    setTimezoneAlarms(prev => [newAlarm, ...prev]);
    localStorage.setItem('joao_timezone_alarms', JSON.stringify([newAlarm, ...timezoneAlarms]));
    await addTimezoneAlarmDb(newAlarm);
  };

  const handleDeleteTimezoneAlarm = async (id: string) => {
    const filtered = timezoneAlarms.filter(a => a.id !== id);
    setTimezoneAlarms(filtered);
    localStorage.setItem('joao_timezone_alarms', JSON.stringify(filtered));
    await deleteTimezoneAlarmDb(id);
  };

  // 8. Profiles Administration actions
  const handleAddProfile = (name: string, permissions: ProfilePermissions) => {
    const profileId = `profile-${Date.now()}`;
    const newProfile: Profile = {
      id: profileId,
      name,
      isAdmin: false,
      permissions,
      createdAt: new Date().toISOString()
    };
    addProfileDb(newProfile);

    // Auto generate chat room for new profile!
    const roomSlug = `room-${profileId}`;
    handleAddRoom({
      id: roomSlug,
      name: `Conversa com ${name}`,
      avatarColor: 'bg-emerald-500',
      description: `Canal de comunicação dedicado com ${name}`
    });
  };

  const handleUpdateProfilePermissions = (id: string, permissions: ProfilePermissions) => {
    updateProfileDb(id, { permissions });
  };

  const handleDeleteProfile = (id: string) => {
    deleteProfileDb(id);
    // Delete associated room
    const roomSlug = `room-${id}`;
    handleDeleteRoom(roomSlug);
  };

  const handleLogout = () => {
    setCurrentProfile(null);
    localStorage.removeItem('joao_current_profile');
    window.location.search = '';
    window.location.hash = '';
  };


  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white p-6 overflow-hidden select-none">
        {/* Background design elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,58,138,0.25)_0%,rgba(2,6,23,1)_80%)] pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col items-center max-w-sm w-full text-center z-10">
          {/* Glowing outer ring for the big logo */}
          <div className="relative mb-6">
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
          </div>

          <div>
            <h2 className="font-display font-black text-3xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent mb-1.5 animate-pulse">
              Cabeça do João
            </h2>
            <p className="text-[11px] text-blue-400 font-mono font-bold tracking-widest uppercase mb-6 animate-pulse">
              Carregando mente e memórias...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <Entrance 
        profiles={profiles}
        onSelectProfile={(profile) => {
          setIsLoading(true);
          setCurrentProfile(profile);
          localStorage.setItem('joao_current_profile', JSON.stringify(profile));
          setTimeout(() => {
            setIsLoading(false);
          }, 1800);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none antialiased">
      
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
        currentProfileName={currentProfile?.name}
        onLogout={handleLogout}
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
            timezoneAlarms={timezoneAlarms}
            joaoStatus={joaoStatus}
            onUpdateStatus={handleUpdateStatus}
            isGuestMode={isGuestMode || !currentProfile?.isAdmin}
            isAdmin={currentProfile?.isAdmin === true}
            permissions={currentProfile?.permissions}
          />
        ) : (
          <div className="animate-fade-in">
            {activePanelId === 'agenda' && (
              <AgendaPanel 
                items={agenda}
                onAddItem={handleAddTask}
                onUpdateStatus={handleUpdateTaskStatus}
                onDeleteItem={handleDeleteTask}
                isReadOnly={currentProfile?.permissions.agenda === 'view'}
              />
            )}

            {activePanelId === 'recados' && (
              <RecadosPanel 
                notes={recados}
                onAddNote={handleAddRecado}
                onPinNote={handlePinRecado}
                onDeleteNote={handleDeleteRecado}
                currentTab={currentTab}
                isReadOnly={currentProfile?.permissions.recados === 'view'}
              />
            )}

            {activePanelId === 'memorias' && (
              <MemoriasPanel 
                memorias={memorias}
                onAddMemoria={handleAddMemoria}
                onToggleSharing={handleToggleMemoriaSharing}
                onDeleteMemoria={handleDeleteMemoria}
                currentTab={currentTab}
                isReadOnly={currentProfile?.permissions.memorias === 'view'}
              />
            )}

            {activePanelId === 'cartinhas' && (
              <CartinhasPanel 
                letters={cartinhas}
                onSendLetter={handleSendCartinha}
                onOpenLetter={handleOpenCartinha}
                onDeleteLetter={handleDeleteCartinha}
                currentTab={currentTab}
                isReadOnly={currentProfile?.permissions.cartinhas === 'view'}
              />
            )}

            {activePanelId === 'conversas' && (
              <ConversasPanel 
                rooms={conversas}
                activeRoomId={activeRoomId}
                onSelectRoom={handleSelectRoom}
                onAddRoom={handleAddRoom}
                onSendMessage={handleSendMessage}
                isGuestMode={isGuestMode || !currentProfile?.isAdmin}
                guestName={currentProfile ? currentProfile.name : guestName}
                onSetGuestName={setGuestName}
                onDeleteRoom={handleDeleteRoom}
                joaoStatus={joaoStatus}
                isReadOnly={currentProfile?.permissions.conversas === 'view'}
              />
            )}

            {activePanelId === 'conteudos' && (
              <ConteudosPanel 
                files={conteudos}
                onAddFile={handleAddFile}
                onDeleteFile={handleDeleteFile}
                isReadOnly={currentProfile?.permissions.conteudos === 'view'}
              />
            )}

            {activePanelId === 'fuso-horario' && (
              <TimezonePanel 
                alarms={timezoneAlarms}
                onAddAlarm={handleAddTimezoneAlarm}
                onDeleteAlarm={handleDeleteTimezoneAlarm}
                isReadOnly={currentProfile?.permissions.timezone === 'view'}
              />
            )}

            {activePanelId === 'perfis' && currentProfile?.isAdmin && (
              <ProfilePanel 
                profiles={profiles}
                onAddProfile={handleAddProfile}
                onUpdateProfilePermissions={handleUpdateProfilePermissions}
                onDeleteProfile={handleDeleteProfile}
              />
            )}

            {activePanelId === 'notificacoes' && (
              <NotificationSettingsPanel 
                onBack={() => handleSelectPanel(null)}
              />
            )}
          </div>
        )}
      </main>

      {/* Tiny clean footer credit */}
      <footer className="py-6 text-center text-[10px] text-slate-400 font-mono border-t border-slate-100 bg-white shrink-0 flex flex-col items-center gap-2">
        <div>Cabeça do João — Segundo Cérebro Digital © {new Date().getFullYear()}</div>
      </footer>

      <NotificationToastContainer />
    </div>
  );
}
