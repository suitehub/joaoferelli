/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  CheckCheck, 
  Plus, 
  User, 
  Users, 
  Share2, 
  ChevronLeft, 
  Info,
  Sparkles,
  Lock
} from 'lucide-react';
import { ConversaRoom, ChatMessage } from '../types';

interface ConversasPanelProps {
  rooms: ConversaRoom[];
  activeRoomId: string | null;
  onSelectRoom: (roomId: string | null) => void;
  onAddRoom: (room: Omit<ConversaRoom, 'messages' | 'createdAt'>) => void;
  onSendMessage: (roomId: string, text: string, sender: 'owner' | 'guest', senderName: string) => void;
  isGuestMode?: boolean;
  guestName?: string;
  onSetGuestName?: (name: string) => void;
}

export const ConversasPanel: React.FC<ConversasPanelProps> = ({
  rooms,
  activeRoomId,
  onSelectRoom,
  onAddRoom,
  onSendMessage,
  isGuestMode = false,
  guestName = '',
  onSetGuestName,
}) => {
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Room Form
  const [roomName, setRoomName] = useState('');
  const [roomDesc, setRoomDesc] = useState('');
  const [roomPrompt, setRoomPrompt] = useState('');
  const [roomAvatar, setRoomAvatar] = useState('bg-blue-500');

  // Input message
  const [typedMessage, setTypedMessage] = useState('');
  const [isTypingSimulated, setIsTypingSimulated] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  // Auto-scroll to bottom of chats
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeRoom?.messages, isTypingSimulated]);

  const handleCopyLink = () => {
    if (!activeRoom) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}#/chat/${activeRoom.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCreateRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    const slug = roomName
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-');

    const avatars = ['bg-blue-500', 'bg-rose-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-indigo-500'];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    onAddRoom({
      id: slug || `chat-${Date.now()}`,
      name: roomName,
      description: roomDesc,
      avatarColor: randomAvatar,
      personaPrompt: roomPrompt || undefined
    });

    setRoomName('');
    setRoomDesc('');
    setRoomPrompt('');
    setIsCreating(false);
  };

  // Automated responses (Complies with Server-side AI + local fallback smart responses)
  const triggerAutoReply = async (roomId: string, userText: string) => {
    setIsTypingSimulated(true);

    // Call server API for intelligent response or fallback locally
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          roomId: roomId,
          history: activeRoom?.messages.slice(-6).map(m => ({
            role: m.sender === 'owner' ? 'user' : 'model',
            parts: [{ text: m.text }]
          })) || []
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Mimic natural typing delay
        setTimeout(() => {
          setIsTypingSimulated(false);
          const replySenderName = activeRoomId === 'familia' ? 'Mãe' : activeRoomId === 'estudos' ? 'Mateus' : activeRoom?.name.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').trim() || 'Companion';
          onSendMessage(roomId, data.reply, 'guest', replySenderName);
        }, 1200);
        return;
      }
    } catch (err) {
      console.log('API call unavailable, using local smart responder:', err);
    }

    // LOCAL SMART RESPONDER FALLBACK (extremely realistic, in Portuguese)
    setTimeout(() => {
      setIsTypingSimulated(false);
      let replyText = 'Que legal! Me conta mais sobre isso.';
      let replyName = 'Mãe';

      const lowerText = userText.toLowerCase();

      if (roomId === 'familia') {
        const isDad = Math.random() > 0.5;
        if (isDad) {
          replyName = 'Pai';
          replyText = lowerText.includes('olá') || lowerText.includes('oi') 
            ? 'Oi filho, tudo bem? Deus te abençoe! 👍'
            : 'Muito bom, filho. Orgulho de você! 👍';
        } else {
          replyName = 'Mãe';
          if (lowerText.includes('jantar') || lowerText.includes('comer') || lowerText.includes('lasanha')) {
            replyText = 'Ai que ótimo, filho! Já vou comprar os ingredientes da lasanha. Lembra de trazer sua namorada também se ela puder! Beijos ❤️';
          } else if (lowerText.includes('oi') || lowerText.includes('olá')) {
            replyText = 'Oi meu lindo! Tudo bem? Como está seu dia? Não esquece de comer direito, viu? 😘';
          } else {
            replyText = 'Glória a Deus, filho! Estou orando por você hoje. Se precisar de alguma coisa me avisa! 🌸';
          }
        }
      } else if (roomId === 'kimberly') {
        replyName = 'Kimberly';
        if (lowerText.includes('te amo') || lowerText.includes('amo você')) {
          replyText = 'Ah meu amor! Eu também te amo infinitamente! Obrigada por me fazer tão feliz ❤️';
        } else if (lowerText.includes('oi') || lowerText.includes('olá') || lowerText.includes('linda')) {
          replyText = 'Oi meu lindo! Que bom falar com você. Como está sendo seu dia de trabalho por aí?';
        } else if (lowerText.includes('sermão') || lowerText.includes('esboço') || lowerText.includes('estudo')) {
          replyText = 'Nossa, que assunto lindo! Você fala com tanta sabedoria sobre isso, tenho certeza que vai tocar muitos corações no Domingo! Quer que eu leia quando estiver pronto?';
        } else {
          replyText = 'Que fofo, meu amor! Estou aqui na torcida por você. Mal posso esperar para o final de semana para nos vermos 🥰';
        }
      } else if (roomId === 'estudos') {
        const isClara = Math.random() > 0.5;
        if (isClara) {
          replyName = 'Clara';
          replyText = 'Concordo plenamente! Essa aplicação prática muda totalmente a forma como vivemos nossa fé no dia a dia. Obrigado por compartilhar!';
        } else {
          replyName = 'Mateus';
          replyText = 'Incrível! Fui pesquisar aqui e no grego original o termo traz essa conotação de aliança eterna. Vale a pena explorarmos isso na próxima aula.';
        }
      } else {
        // Custom created room response
        replyName = activeRoom?.name || 'Amigo';
        replyText = `Recebi sua mensagem! "${userText.substring(0, 15)}..." faz muito sentido dentro do nosso contexto. Vamos conversando! ✨`;
      }

      onSendMessage(roomId, replyText, 'guest', replyName);
    }, 1800);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeRoomId) return;

    const messageText = typedMessage.trim();
    const currentSenderName = isGuestMode ? (guestName || 'Visitante') : 'João';
    const currentSenderType = isGuestMode ? 'guest' : 'owner';

    onSendMessage(activeRoomId, messageText, currentSenderType, currentSenderName);
    setTypedMessage('');

    // If owner wrote the message, trigger AI/simulated response after a delay
    if (!isGuestMode) {
      triggerAutoReply(activeRoomId, messageText);
    }
  };

  // Guest name prompt screen
  if (isGuestMode && !guestName) {
    const [tempGuestName, setTempGuestName] = useState('');
    
    const handleSetGuestNameSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!tempGuestName.trim()) return;
      onSetGuestName?.(tempGuestName.trim());
    };

    return (
      <div className="max-w-md mx-auto my-12 px-6 py-8 bg-white border border-slate-100 rounded-3xl shadow-xl text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4 text-rose-500">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="font-display font-bold text-lg text-slate-800">Espaço de Conversa Exclusivo</h3>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          Você acessou um link de conversa privado da Cabeça do João. Por favor, insira seu nome para se identificar e enviar mensagens.
        </p>
        
        <form onSubmit={handleSetGuestNameSubmit} className="space-y-4">
          <input
            type="text"
            required
            placeholder="Ex: Kimberly, Mãe, Mateus, Tio Pedro..."
            value={tempGuestName}
            onChange={(e) => setTempGuestName(e.target.value)}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-hidden focus:border-rose-500 text-slate-800 font-medium text-center"
          />
          <button
            type="submit"
            className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            Entrar na Conversa Privada
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-10rem)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full border border-slate-100 rounded-3xl bg-white shadow-xs overflow-hidden">
        
        {/* ROOMS SIDE LIST (Hidden on mobile if a room is active) */}
        <div className={`md:col-span-1 border-r border-slate-100 flex flex-col h-full bg-slate-50/50 ${
          activeRoomId ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-display font-bold text-slate-800 text-sm">Canais de Conversa</h3>
              <p className="text-[10px] text-slate-400">Clique para abrir ou copiar o link</p>
            </div>
            {!isGuestMode && (
              <button
                onClick={() => setIsCreating(true)}
                className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                title="Novo canal de conversa"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Rooms scroll list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {rooms.map(room => {
              const isSelected = room.id === activeRoomId;
              const lastMsg = room.messages[room.messages.length - 1];

              return (
                <div
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-rose-50 text-rose-950 border border-rose-100/30 shadow-2xs' 
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full ${room.avatarColor} text-white flex items-center justify-center font-bold shadow-2xs text-sm shrink-0 uppercase`}>
                    {room.name.substring(0, 2)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-display font-bold text-xs truncate">{room.name}</h4>
                      {lastMsg && <span className="text-[9px] font-mono text-slate-400">{lastMsg.timestamp}</span>}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {lastMsg ? `${lastMsg.senderName}: ${lastMsg.text}` : room.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTIVE CHAT SCREEN */}
        {activeRoomId && activeRoom ? (
          <div className="md:col-span-2 flex flex-col h-full bg-[#fdfdfc]">
            
            {/* Active chat header */}
            <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <button
                  onClick={() => onSelectRoom(null)}
                  className="md:hidden p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className={`w-9 h-9 rounded-full ${activeRoom.avatarColor} text-white flex items-center justify-center font-bold text-xs uppercase shrink-0`}>
                  {activeRoom.name.substring(0,2)}
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-sm truncate">{activeRoom.name}</h3>
                  <p className="text-[9px] text-slate-400 truncate">{activeRoom.description}</p>
                </div>
              </div>

              {/* Share & Info */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 text-[10px] font-semibold bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg border border-rose-100/40 cursor-pointer hover:bg-rose-100 transition-colors"
                  title="Copiar link exclusivo do chat"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
                </button>
              </div>
            </div>

            {/* Chat Room Instructions banner */}
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center gap-2 shrink-0">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <p className="text-[10px] text-slate-500 leading-normal">
                {isGuestMode 
                  ? `Você entrou como visitante "${guestName}". Suas mensagens aparecem em tempo real.`
                  : 'Link privado de conversa gerado! Compartilhe o link acima para que outras pessoas entrem direto.'}
              </p>
            </div>

            {/* MESSAGES VIEW GRID */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF9F5]">
              {activeRoom.messages.map(msg => {
                const isMyMessage = isGuestMode 
                  ? msg.sender === 'guest' 
                  : msg.sender === 'owner';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[75%] rounded-2xl px-4 py-2 text-xs relative ${
                      isMyMessage
                        ? 'ml-auto bg-rose-500 text-white rounded-br-none shadow-3xs'
                        : 'mr-auto bg-white border border-slate-100 text-slate-800 rounded-bl-none shadow-3xs'
                    }`}
                  >
                    {!isMyMessage && (
                      <span className="font-semibold text-[9px] text-rose-500 mb-0.5">
                        {msg.senderName}
                      </span>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    
                    <div className="flex items-center justify-end gap-1 mt-1 shrink-0">
                      <span className={`text-[8px] font-mono ${isMyMessage ? 'text-white/70' : 'text-slate-400'}`}>
                        {msg.timestamp}
                      </span>
                      {isMyMessage && (
                        <CheckCheck className="w-3 h-3 text-white/80" />
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Real-time looking typing indicator */}
              {isTypingSimulated && (
                <div className="mr-auto bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-bl-none px-4 py-2.5 shadow-3xs max-w-[75%]">
                  <span className="font-semibold text-[9px] text-rose-500 block mb-1">
                    {activeRoomId === 'familia' ? 'Mãe' : activeRoomId === 'estudos' ? 'Mateus' : activeRoom.name.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').trim()} está digitando...
                  </span>
                  <div className="flex gap-1 items-center h-2">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* MESSAGE ENTRY BAR */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
              <input
                type="text"
                required
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder="Escreva uma mensagem..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-rose-500"
              />
              <button
                type="submit"
                className="p-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-2xs cursor-pointer transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        ) : (
          <div className="md:col-span-2 hidden md:flex flex-col items-center justify-center text-center p-8 text-slate-400 h-full bg-slate-50/20">
            <MessageSquare className="w-12 h-12 text-slate-200 mb-3" />
            <h4 className="font-display font-bold text-sm text-slate-700">Selecione uma Conversa</h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1 leading-normal">
              Escolha um dos canais na barra lateral esquerda para bater papo em tempo real ou copiar links de convite privados.
            </p>
          </div>
        )}

      </div>

      {/* FORM: NEW CHANNEL ROOM */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-xl">
            <h3 className="font-display font-bold text-lg text-slate-900 mb-4">Criar Novo Canal de Conversa</h3>
            
            <form onSubmit={handleCreateRoomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nome do Canal</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Família, Kimberly, Amigos, Trabalho..."
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-rose-500 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição Curta</label>
                <input
                  type="text"
                  placeholder="Ex: Grupo para discutir o jantar de natal..."
                  value={roomDesc}
                  onChange={(e) => setRoomDesc(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-rose-500 text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Instruções de Personalidade (IA)</label>
                <textarea
                  placeholder="Defina as características de quem responderá João por IA neste canal..."
                  value={roomPrompt}
                  onChange={(e) => setRoomPrompt(e.target.value)}
                  rows={3}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-rose-500 text-slate-700 leading-normal"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Criar Canal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
