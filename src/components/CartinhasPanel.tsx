/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Trash2, 
  Plus, 
  Clock, 
  Calendar, 
  User, 
  BookOpen, 
  X,
  Sparkles
} from 'lucide-react';
import { CartinhaItem } from '../types';

interface CartinhasPanelProps {
  letters: CartinhaItem[];
  onSendLetter: (item: Omit<CartinhaItem, 'id' | 'isOpened'>) => void;
  onOpenLetter: (id: string) => void;
  onDeleteLetter?: (id: string) => void;
  currentTab?: 'meu-mundo' | 'compartilhado';
}

const STAMP_STYLES = {
  floral: { char: '🌸', label: 'Floral Vintage', bg: 'bg-rose-50 border-rose-200' },
  crown: { char: '👑', label: 'Coroa Real', bg: 'bg-amber-50 border-amber-200' },
  anchor: { char: '⚓', label: 'Âncora Clássica', bg: 'bg-blue-50 border-blue-200' },
  heart: { char: '💖', label: 'Selo Amoroso', bg: 'bg-pink-50 border-pink-200' },
  retro: { char: '✉️', label: 'Estilo Retro', bg: 'bg-slate-50 border-slate-200' },
};

const SEAL_COLORS = {
  burgundy: { bg: 'bg-red-800', border: 'border-red-950', ring: 'ring-red-700/40', label: 'Borgonha' },
  gold: { bg: 'bg-yellow-600', border: 'border-yellow-800', ring: 'ring-yellow-500/40', label: 'Ouro Imperial' },
  navy: { bg: 'bg-blue-800', border: 'border-blue-950', ring: 'ring-blue-700/40', label: 'Azul Real' },
  emerald: { bg: 'bg-emerald-800', border: 'border-emerald-950', ring: 'ring-emerald-700/40', label: 'Esmeralda' },
  bronze: { bg: 'bg-amber-800', border: 'border-amber-950', ring: 'ring-amber-700/40', label: 'Bronze Antigo' },
};

export const CartinhasPanel: React.FC<CartinhasPanelProps> = ({
  letters: items,
  onSendLetter: onAddItem,
  onOpenLetter: onOpenItem,
  onDeleteLetter: onDeleteItem,
  currentTab,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [openedLetter, setOpenedLetter] = useState<CartinhaItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('João');
  const [deliverAt, setDeliverAt] = useState(new Date().toISOString().split('T')[0]);
  const [stampType, setStampType] = useState<CartinhaItem['stampType']>('floral');
  const [sealColor, setSealColor] = useState<CartinhaItem['sealColor']>('burgundy');

  const handleOpenEnvelope = (letter: CartinhaItem) => {
    // Check if delivery date is in the future
    const deliverDate = new Date(letter.deliverAt + 'T00:00:00');
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (deliverDate > today) {
      alert(`Esta carta está lacrada e a caminho! Só poderá ser aberta em: ${deliverDate.toLocaleDateString('pt-BR')}`);
      return;
    }

    onOpenItem(letter.id);
    setOpenedLetter(letter);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !sender.trim()) return;

    onAddItem({
      title,
      content,
      sender,
      recipient,
      date: new Date().toISOString().split('T')[0],
      deliverAt,
      stampType,
      sealColor
    });

    setTitle('');
    setContent('');
    setSender('');
    setRecipient('João');
    setDeliverAt(new Date().toISOString().split('T')[0]);
    setStampType('floral');
    setSealColor('burgundy');
    setIsAdding(false);
  };

  // Helper to check if delivery date has passed or is today
  const isDelivered = (letter: CartinhaItem) => {
    const deliverDate = new Date(letter.deliverAt + 'T00:00:00');
    const today = new Date();
    today.setHours(0,0,0,0);
    return deliverDate <= today;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Mail className="w-5 h-5" /></span>
            <span>Cartinhas Virtuais</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Espaço acolhedor e nostálgico de correspondência. Envie, agende entregas especiais e abra envelopes com lacres reais.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Escrever Cartinha</span>
        </button>
      </div>

      {/* Grid of Envelopes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map(letter => {
          const isAvailable = isDelivered(letter);
          const seal = SEAL_COLORS[letter.sealColor];
          const stamp = STAMP_STYLES[letter.stampType];

          return (
            <div
              key={letter.id}
              onClick={() => handleOpenEnvelope(letter)}
              className={`bg-[#fbf9f4] border border-[#e8e2d4] p-5 rounded-2xl shadow-xs hover:shadow-lg hover:-translate-y-1 transform transition-all duration-300 cursor-pointer flex flex-col justify-between h-[220px] relative overflow-hidden group ${
                !isAvailable ? 'opacity-80' : ''
              }`}
            >
              {/* Retro Postmark Lines */}
              <div className="absolute top-12 left-0 right-0 h-0.5 border-t border-dashed border-[#e3dac9] pointer-events-none opacity-40"></div>

              {/* Stamp in Top Right */}
              <div className={`absolute top-4 right-4 w-12 h-14 border-2 border-dashed flex flex-col items-center justify-center rounded-xs rotate-6 transition-transform group-hover:rotate-12 ${stamp.bg}`}>
                <span className="text-xl leading-none">{stamp.char}</span>
                <span className="text-[6px] font-mono font-bold tracking-tighter text-slate-400 mt-1">POSTAL</span>
              </div>

              {/* Main Envelope markings */}
              <div>
                <div className="text-[10px] font-mono font-semibold tracking-wider text-amber-800/60">
                  {letter.date.split('-').reverse().join('/')}
                </div>
                
                <h3 className="font-display font-bold text-slate-800 text-base mt-2 line-clamp-1 pr-14 leading-tight group-hover:text-emerald-700 transition-colors">
                  {letter.title}
                </h3>

                <div className="mt-4 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="font-semibold text-slate-400">De:</span>
                    <span className="font-sans font-medium text-slate-700 italic">{letter.sender}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="font-semibold text-slate-400">Para:</span>
                    <span className="font-sans font-medium text-slate-700 italic">{letter.recipient}</span>
                  </div>
                </div>
              </div>

              {/* Lacre de Cera (Wax Seal) or Countdown in the center-right bottom */}
              <div className="pt-3 border-t border-[#e8e2d4]/50 flex items-center justify-between">
                <div>
                  {!isAvailable ? (
                    <div className="flex items-center gap-1.5 text-amber-600 font-mono text-[10px] font-bold">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      <span>Chega dia {letter.deliverAt.split('-').reverse().slice(0,2).join('/')}</span>
                    </div>
                  ) : letter.isOpened ? (
                    <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                      Lido
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-bold">
                      Selado (Clique para ler)
                    </span>
                  )}
                </div>

                {/* Simulated Wax Seal on envelope */}
                {isAvailable ? (
                  <div className={`w-8 h-8 rounded-full border-2 ${seal.bg} ${seal.border} ring-4 ${seal.ring} flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110`} title={`Selo de Cera ${seal.label}`}>
                    <Sparkles className="w-3 h-3 text-white/50" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-slate-300 ring-4 ring-slate-100 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Envelope flap aesthetic */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-t from-emerald-600/5 to-transparent"></div>
            </div>
          );
        })}
      </div>

      {/* FORM: WRITING NEW LETTER */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#fcfbf9] rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-6">
              <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                <span>Escrever Correspondência Tradicional</span>
              </h3>
              <button 
                onClick={() => setIsAdding(false)}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Metadados */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Título / Assunto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carta de Encorajamento..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500 text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Remetente (Quem escreve)</label>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome ou apelido..."
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500 text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Destinatário</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João, Kimberly..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500 text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Lined Paper style box for message */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Conteúdo da Carta</label>
                <div className="rounded-2xl border border-slate-200 p-2 bg-[#fdfdfb] shadow-inner">
                  <textarea
                    required
                    placeholder="Escreva sua carta aqui com carinho e tranquilidade..."
                    rows={8}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full paper-lined text-sm p-4 rounded-xl focus:outline-hidden border-0 resize-none text-slate-800 font-serif leading-8 italic"
                    style={{ fontFamily: 'Georgia, serif' }}
                  />
                </div>
              </div>

              {/* Delivery and Aesthetics Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Stamp Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Selo Postal</label>
                  <div className="grid grid-cols-5 gap-1">
                    {(Object.keys(STAMP_STYLES) as CartinhaItem['stampType'][]).map(key => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setStampType(key)}
                        title={STAMP_STYLES[key].label}
                        className={`p-2 rounded-lg border text-lg flex items-center justify-center cursor-pointer transition-all ${
                          stampType === key 
                            ? 'bg-emerald-50 border-emerald-500 scale-105 shadow-2xs' 
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {STAMP_STYLES[key].char}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wax Seal Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Lacre de Cera</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(Object.keys(SEAL_COLORS) as CartinhaItem['sealColor'][]).map(key => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSealColor(key)}
                        title={SEAL_COLORS[key].label}
                        className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-all relative flex items-center justify-center ${
                          SEAL_COLORS[key].bg
                        } ${SEAL_COLORS[key].border} ${sealColor === key ? 'ring-4 ring-slate-800 scale-110' : 'hover:scale-105 opacity-80'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Delivery Date (Scheduling!) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Agendar Entrega (Entrega Futura)</label>
                  <input
                    type="date"
                    required
                    value={deliverAt}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDeliverAt(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-emerald-500 text-slate-700"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Correspondência</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL-SCREEN LETTER DETAIL MODAL (Vintage paper simulation!) */}
      {openedLetter && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#fcfbf9] rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl relative overflow-hidden flex flex-col h-[85vh]">
            
            {/* Top Bar inside modal */}
            <div className="bg-[#f2efe6] px-5 py-3 border-b border-[#e5decb] flex justify-between items-center shrink-0">
              <span className="font-display font-bold text-xs text-amber-900 tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-800" />
                <span>CARTA DE {openedLetter.sender.toUpperCase()}</span>
              </span>
              <button
                onClick={() => {
                  setOpenedLetter(null);
                }}
                className="p-1 rounded-md hover:bg-slate-200/50 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Vintage Styled Lined Paper Area */}
            <div className="flex-1 overflow-y-auto paper-pattern p-6 sm:p-10 text-slate-800 flex flex-col justify-between">
              
              {/* Header inside letter */}
              <div>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-serif italic font-bold text-slate-800 text-lg sm:text-xl">
                      {openedLetter.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Data de criação: {openedLetter.date.split('-').reverse().join('/')}
                    </p>
                  </div>
                  {/* Small stamp overlay in letter */}
                  <div className="w-10 h-10 border border-slate-300 rounded-xs flex items-center justify-center bg-white text-lg select-none">
                    {STAMP_STYLES[openedLetter.stampType]?.char || '🌸'}
                  </div>
                </div>

                {/* Letter Body text (with simulated handwriting cursive-like font/styling) */}
                <div 
                  className="mt-8 font-serif leading-7 text-sm whitespace-pre-wrap italic text-slate-700 max-w-lg mx-auto"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {openedLetter.content}
                </div>
              </div>

              {/* Signatures & Wax Seal at bottom */}
              <div className="pt-8 mt-10 border-t border-[#e2dcc5] flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-slate-400 font-bold uppercase">Sinceras saudações,</p>
                  <p className="font-serif italic font-bold text-sm text-slate-700">{openedLetter.sender}</p>
                </div>
                
                {/* Lacre de Cera as visual proof of receipt */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full border-2 ${SEAL_COLORS[openedLetter.sealColor].bg} ${SEAL_COLORS[openedLetter.sealColor].border} ring-4 ${SEAL_COLORS[openedLetter.sealColor].ring} flex items-center justify-center shadow-xs rotate-12`}>
                    <Sparkles className="w-3.5 h-3.5 text-white/40" />
                  </div>
                  <span className="text-[7px] text-slate-400 font-mono mt-1 font-bold uppercase tracking-wider">Lacrado</span>
                </div>
              </div>

            </div>

            {/* Bottom Controls */}
            <div className="bg-[#f2efe6] px-5 py-3 border-t border-[#e5decb] flex justify-between items-center shrink-0">
              <button
                onClick={() => {
                  onDeleteItem(openedLetter.id);
                  setOpenedLetter(null);
                }}
                className="flex items-center gap-1 text-xs text-rose-600 hover:bg-rose-50 border border-rose-100/50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Deletar Correspondência</span>
              </button>
              
              <button
                onClick={() => setOpenedLetter(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Fechar Carta
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
