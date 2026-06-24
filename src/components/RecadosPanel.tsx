/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Pin, 
  Plus, 
  Trash2, 
  Search, 
  AlertCircle, 
  Grid,
  Check
} from 'lucide-react';
import { RecadoItem } from '../types';

interface RecadosPanelProps {
  notes: RecadoItem[];
  onAddNote: (item: Omit<RecadoItem, 'id' | 'createdAt'>) => void;
  onPinNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  currentTab?: 'meu-mundo' | 'compartilhado';
}

const COLOR_MAP = {
  yellow: { bg: 'bg-amber-100 border-amber-200/50 text-amber-900', border: 'border-amber-300', dot: 'bg-amber-500' },
  blue: { bg: 'bg-sky-100 border-sky-200/50 text-sky-900', border: 'border-sky-300', dot: 'bg-sky-500' },
  green: { bg: 'bg-emerald-100 border-emerald-200/50 text-emerald-900', border: 'border-emerald-300', dot: 'bg-emerald-500' },
  pink: { bg: 'bg-rose-100 border-rose-200/50 text-rose-900', border: 'border-rose-300', dot: 'bg-rose-500' },
  purple: { bg: 'bg-purple-100 border-purple-200/50 text-purple-900', border: 'border-purple-300', dot: 'bg-purple-500' },
  orange: { bg: 'bg-orange-100 border-orange-200/50 text-orange-900', border: 'border-orange-300', dot: 'bg-orange-500' },
  slate: { bg: 'bg-slate-100 border-slate-200/50 text-slate-900', border: 'border-slate-300', dot: 'bg-slate-500' },
};

export const RecadosPanel: React.FC<RecadosPanelProps> = ({
  notes: items,
  onAddNote: onAddItem,
  onPinNote: onTogglePin,
  onDeleteNote: onDeleteItem,
  currentTab,
}) => {
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [newColor, setNewColor] = useState<RecadoItem['color']>('yellow');
  const [newPriority, setNewPriority] = useState<RecadoItem['priority']>('medium');
  const [newIsPinned, setNewIsPinned] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) return;

    onAddItem({
      title: newTitle,
      text: newText,
      color: newColor,
      priority: newPriority,
      isPinned: newIsPinned,
    });

    setNewTitle('');
    setNewText('');
    setNewColor('yellow');
    setNewPriority('medium');
    setNewIsPinned(false);
    setIsAdding(false);
  };

  // Filter and sort items: Pinned notes always come first, followed by date
  const filteredItems = items
    .filter(item => 
      item.title.toLowerCase().includes(search.toLowerCase()) || 
      item.text.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const getPriorityText = (p: 'low' | 'medium' | 'high') => {
    switch (p) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Dashboard Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            <span className="p-1.5 bg-amber-50 text-amber-500 rounded-lg"><Pin className="w-5 h-5 fill-amber-500" /></span>
            <span>Mural de Recados</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Seus lembretes rápidos, pensamentos e notas visuais organizados lado a lado em formato de grade.
          </p>
        </div>

        {/* Search & Add */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar recados..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-400 text-slate-700"
            />
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lembrete</span>
          </button>
        </div>
      </div>

      {/* Recados Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => {
            const colorScheme = COLOR_MAP[item.color] || COLOR_MAP.yellow;
            return (
              <div
                key={item.id}
                className={`rounded-2xl p-5 border shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between h-[230px] relative overflow-hidden group ${colorScheme.bg}`}
              >
                {/* Visual Pin Overlay */}
                {item.isPinned && (
                  <div className="absolute top-2.5 right-2.5 text-amber-600/60 rotate-45">
                    <Pin className="w-4 h-4 fill-amber-500 text-amber-600" />
                  </div>
                )}

                {/* Card Content */}
                <div className="overflow-hidden">
                  <div className="flex items-start justify-between pr-4 mb-2">
                    <h4 className="font-display font-bold text-sm tracking-tight text-slate-900 leading-snug line-clamp-1">
                      {item.title}
                    </h4>
                  </div>
                  {/* Text Content */}
                  <p className="text-xs text-slate-700 leading-relaxed overflow-y-auto max-h-[120px] whitespace-pre-line pr-1 font-sans">
                    {item.text}
                  </p>
                </div>

                {/* Card Footer controls */}
                <div className="pt-4 border-t border-black/5 mt-3 flex justify-between items-center bg-transparent">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${colorScheme.dot}`}></span>
                    <span className="text-[10px] font-mono font-medium text-slate-500">
                      Prioridade {getPriorityText(item.priority)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onTogglePin(item.id)}
                      className={`p-1 rounded-md transition-all cursor-pointer ${
                        item.isPinned 
                          ? 'bg-slate-200/50 hover:bg-slate-200 text-slate-700' 
                          : 'hover:bg-black/5 text-slate-500'
                      }`}
                      title={item.isPinned ? "Desafixar recado" : "Fixar no topo"}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all cursor-pointer"
                      title="Deletar recado"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <AlertCircle className="w-10 h-10 text-slate-300" />
          <p className="text-sm font-semibold">Nenhum recado encontrado!</p>
          <p className="text-xs text-slate-300">
            {search ? 'Tente buscar com termos diferentes.' : 'Crie seu primeiro recado de restaurante clicando em "Novo Lembrete".'}
          </p>
        </div>
      )}

      {/* FORM MODAL FOR NEW RECADO */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-xl">
            <h3 className="font-display font-bold text-lg text-slate-900 mb-4">Criar Novo Recado</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Título</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 💡 Ideia de ilustração..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-amber-400 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Conteúdo do Recado</label>
                <textarea
                  required
                  placeholder="Escreva suas anotações ou lembretes rápidos..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  rows={4}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-amber-400 text-slate-800 leading-relaxed"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Escolha a Cor do Cartão</label>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(COLOR_MAP) as RecadoItem['color'][]).map(colorKey => (
                    <button
                      key={colorKey}
                      type="button"
                      onClick={() => setNewColor(colorKey)}
                      className={`w-7 h-7 rounded-full border transition-all cursor-pointer relative flex items-center justify-center ${
                        COLOR_MAP[colorKey].bg
                      } ${newColor === colorKey ? 'ring-2 ring-slate-800 scale-110' : 'hover:scale-105'}`}
                    >
                      {newColor === colorKey && <Check className="w-3.5 h-3.5 text-slate-800 font-bold" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Prioridade</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as RecadoItem['priority'])}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-hidden focus:border-amber-400 text-slate-700"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 mt-5">
                  <input
                    type="checkbox"
                    id="newIsPinned"
                    checked={newIsPinned}
                    onChange={(e) => setNewIsPinned(e.target.checked)}
                    className="w-4 h-4 text-amber-500 focus:ring-amber-400 border-slate-300 rounded-sm cursor-pointer"
                  />
                  <label htmlFor="newIsPinned" className="text-xs font-medium text-slate-600 select-none cursor-pointer">
                    Fixar no topo?
                  </label>
                </div>
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
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  Adicionar Recado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
