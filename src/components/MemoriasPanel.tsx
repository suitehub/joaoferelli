/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Clock, 
  Eye, 
  EyeOff, 
  Upload, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { MemoriaItem } from '../types';

interface MemoriasPanelProps {
  memorias: MemoriaItem[];
  onAddMemoria: (item: Omit<MemoriaItem, 'id' | 'createdAt'>) => void;
  onDeleteMemoria: (id: string) => void;
  onToggleSharing: (id: string) => void;
  currentTab?: 'meu-mundo' | 'compartilhado';
  defaultSharedOnly?: boolean; // If opened from the "Fotos Compartilhadas" card
}

export const MemoriasPanel: React.FC<MemoriasPanelProps> = ({
  memorias: items,
  onAddMemoria: onAddItem,
  onDeleteMemoria: onDeleteItem,
  onToggleSharing: onToggleShare,
  currentTab,
  defaultSharedOnly = false,
}) => {
  const [showSharedOnly, setShowSharedOnly] = useState<boolean>(defaultSharedOnly);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiration, setExpiration] = useState<MemoriaItem['expiration']>('permanent');
  const [isShared, setIsShared] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido.');
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || !caption.trim()) return;

    onAddItem({
      imageUrl,
      caption,
      date,
      expiration,
      isShared,
    });

    setCaption('');
    setImageUrl('');
    setDate(new Date().toISOString().split('T')[0]);
    setExpiration('permanent');
    setIsShared(false);
    setIsAdding(false);
  };

  // Helper to check if a memory has expired
  const isExpired = (item: MemoriaItem) => {
    if (item.expiration === 'permanent') return false;
    
    const createdTime = new Date(item.createdAt).getTime();
    const now = new Date().getTime();
    const diffMs = now - createdTime;
    
    if (item.expiration === '24h') {
      return diffMs > 24 * 60 * 60 * 1000;
    }
    if (item.expiration === '7d') {
      return diffMs > 7 * 24 * 60 * 60 * 1000;
    }
    return false;
  };

  // Filter memories
  const activeMemories = items.filter(item => !isExpired(item));
  const filteredMemories = activeMemories.filter(item => {
    if (showSharedOnly) return item.isShared;
    return true; // Show all (private and shared) in João's general diary
  });

  // Calculate remaining time helper
  const getExpirationText = (item: MemoriaItem) => {
    if (item.expiration === 'permanent') return 'Permanente';
    
    const createdTime = new Date(item.createdAt).getTime();
    const now = new Date().getTime();
    const diffMs = now - createdTime;

    if (item.expiration === '24h') {
      const msLeft = 24 * 60 * 60 * 1000 - diffMs;
      if (msLeft <= 0) return 'Expirado';
      const hoursLeft = Math.ceil(msLeft / (1000 * 60 * 60));
      return `Expira em ${hoursLeft}h`;
    }

    if (item.expiration === '7d') {
      const msLeft = 7 * 24 * 60 * 60 * 1000 - diffMs;
      if (msLeft <= 0) return 'Expirado';
      const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
      return `Expira em ${daysLeft}d`;
    }
    return '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            <span className="p-1.5 bg-pink-50 text-pink-500 rounded-lg"><ImageIcon className="w-5 h-5" /></span>
            <span>Diário Visual de Memórias</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gele instantes da vida. Sua rede social privada e segura, onde os momentos têm o tempo que você determinar.
          </p>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-medium shrink-0">
            <button
              onClick={() => setShowSharedOnly(false)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                !showSharedOnly ? 'bg-white text-pink-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Minhas Memórias
            </button>
            <button
              onClick={() => setShowSharedOnly(true)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                showSharedOnly ? 'bg-white text-pink-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Fotos Compartilhadas
            </button>
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0 ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Memória</span>
          </button>
        </div>
      </div>

      {/* Polaroid Gallery */}
      {filteredMemories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredMemories.map(item => {
            return (
              <div
                key={item.id}
                className="bg-white p-4 pb-6 rounded-xs border border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform flex flex-col justify-between group"
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
                {/* Polaroid Picture Slot */}
                <div className="relative aspect-square w-full bg-slate-50 overflow-hidden border border-slate-100 rounded-2xs">
                  <img
                    src={item.imageUrl}
                    alt={item.caption}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';
                    }}
                  />
                  
                  {/* Share indicator */}
                  <span className="absolute top-2 left-2 flex items-center gap-1 text-[9px] font-semibold bg-white/95 text-slate-800 px-2 py-1 rounded-full shadow-2xs backdrop-blur-xs">
                    {item.isShared ? (
                      <>
                        <Eye className="w-3 h-3 text-emerald-500" />
                        <span>Compartilhado</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 text-slate-400" />
                        <span>Privado</span>
                      </>
                    )}
                  </span>

                  {/* Expiration warning indicator */}
                  {item.expiration !== 'permanent' && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-mono font-bold bg-pink-600 text-white px-2 py-1 rounded-full shadow-2xs">
                      <Clock className="w-3 h-3 text-white" />
                      <span>{getExpirationText(item)}</span>
                    </span>
                  )}
                </div>

                {/* Polaroid Text & Date Description */}
                <div className="mt-4 flex flex-col justify-between flex-1">
                  <p className="text-xs font-medium text-slate-700 italic leading-relaxed line-clamp-3">
                    "{item.caption}"
                  </p>
                  
                  <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 font-mono">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onToggleShare(item.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                        title={item.isShared ? "Tornar Privado" : "Compartilhar no mural"}
                      >
                        {item.isShared ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Deletar Memória"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <AlertCircle className="w-10 h-10 text-slate-300" />
          <p className="text-sm font-semibold">Nenhuma memória por aqui!</p>
          <p className="text-xs text-slate-300">
            {showSharedOnly 
              ? 'Nenhuma foto foi compartilhada com amigos ainda.' 
              : 'Clique em "Nova Memória" para imortalizar um momento importante da sua vida hoje.'}
          </p>
        </div>
      )}

      {/* FORM MODAL FOR NEW MEMORY */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-xl">
            <h3 className="font-display font-bold text-lg text-slate-900 mb-4">Adicionar Nova Memória</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Photo Upload Zone */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Escolha uma Foto</label>
                
                {imageUrl ? (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-200">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 bg-slate-900/75 hover:bg-slate-900 text-white p-1.5 rounded-full text-xs font-bold shadow-md cursor-pointer"
                    >
                      Remover foto
                    </button>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      dragActive 
                        ? 'border-pink-500 bg-pink-50/20' 
                        : 'border-slate-300 hover:border-pink-400 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">Arraste e solte uma imagem aqui</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Ou clique para procurar arquivos</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* URL fallback option */}
              {!imageUrl && (
                <div>
                  <div className="text-center text-[10px] text-slate-400 font-bold mb-1">OU INSIRA O LINK DA IMAGEM</div>
                  <input
                    type="url"
                    placeholder="Cole a URL da imagem aqui (Unsplash, etc.)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-hidden focus:border-pink-500 text-slate-700"
                  />
                </div>
              )}

              {/* Caption */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Legenda Curta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Passeio no parque com a família..."
                  maxLength={120}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-pink-500 text-slate-800 font-medium"
                />
              </div>

              {/* Date & Sharing options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-pink-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Duração da Memória</label>
                  <select
                    value={expiration}
                    onChange={(e) => setExpiration(e.target.value as MemoriaItem['expiration'])}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-pink-500 text-slate-700"
                  >
                    <option value="permanent">Manter permanentemente</option>
                    <option value="24h">Expirar após 24 horas</option>
                    <option value="7d">Expirar após 7 dias</option>
                  </select>
                </div>
              </div>

              {/* Share Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isShared"
                  checked={isShared}
                  onChange={(e) => setIsShared(e.target.checked)}
                  className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-slate-300 rounded-sm cursor-pointer"
                />
                <label htmlFor="isShared" className="text-xs font-medium text-slate-600 select-none cursor-pointer">
                  Compartilhar no mural "Fotos Compartilhadas"?
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!imageUrl || !caption.trim()}
                  className={`px-4 py-2 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                    imageUrl && caption.trim()
                      ? 'bg-pink-600 hover:bg-pink-700'
                      : 'bg-slate-300 cursor-not-allowed opacity-75'
                  }`}
                >
                  Gravar Lembrança
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
