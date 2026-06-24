/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  List, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  AlertCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { AgendaItem } from '../types';

interface AgendaPanelProps {
  items: AgendaItem[];
  onAddItem: (item: Omit<AgendaItem, 'id'>) => void;
  onUpdateStatus: (id: string, newStatus: 'todo' | 'doing' | 'done') => void;
  onDeleteItem: (id: string) => void;
}

export const AgendaPanel: React.FC<AgendaPanelProps> = ({
  items,
  onAddItem,
  onUpdateStatus,
  onDeleteItem,
}) => {
  const [activeView, setActiveView] = useState<'calendar' | 'list' | 'kanban'>('calendar');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Calendar state
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-indexed

  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDescription, setNewDescription] = useState('');
  const [formDate, setFormDate] = useState(selectedDate);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Calendar rendering math
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday, etc.
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Pad previous month days
  const prevMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonthIndex);

  const calendarDays: { dateString: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const mStr = String(prevMonthIndex + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    calendarDays.push({
      dateString: `${prevYear}-${mStr}-${dStr}`,
      dayNum: d,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    calendarDays.push({
      dateString: `${currentYear}-${mStr}-${dStr}`,
      dayNum: d,
      isCurrentMonth: true
    });
  }

  // Next month padding to fill full weeks (usually 42 grids)
  const remainingCells = 42 - calendarDays.length;
  const nextMonthIndex = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  for (let d = 1; d <= remainingCells; d++) {
    const mStr = String(nextMonthIndex + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    calendarDays.push({
      dateString: `${nextYear}-${mStr}-${dStr}`,
      dayNum: d,
      isCurrentMonth: false
    });
  }

  const handleDayClick = (dateString: string) => {
    setSelectedDate(dateString);
    setFormDate(dateString);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddItem({
      title: newTitle,
      date: formDate,
      time: newTime || undefined,
      status: 'todo',
      priority: newPriority,
      description: newDescription || undefined
    });

    setNewTitle('');
    setNewTime('');
    setNewPriority('medium');
    setNewDescription('');
    setIsAdding(false);
  };

  // Get items for the currently selected date (useful for side panel in Calendar)
  const itemsForSelectedDate = items.filter(item => item.date === selectedDate);

  const getPriorityBadge = (p: 'low' | 'medium' | 'high') => {
    switch (p) {
      case 'high': return <span className="bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-full text-[10px] font-medium font-sans">Alta</span>;
      case 'medium': return <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full text-[10px] font-medium font-sans">Média</span>;
      case 'low': return <span className="bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-full text-[10px] font-medium font-sans">Baixa</span>;
    }
  };

  const getStatusBadge = (s: 'todo' | 'doing' | 'done') => {
    switch (s) {
      case 'todo': return <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-medium font-sans">A Fazer</span>;
      case 'doing': return <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full text-[10px] font-medium font-sans">Fazendo</span>;
      case 'done': return <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-medium font-sans">Concluído</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Panel Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><CalendarIcon className="w-5 h-5" /></span>
            <span>Agenda Mental</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Seus prazos, sermões e atividades diárias integrados e sincronizados em três visualizações.
          </p>
        </div>

        {/* View Switches */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-medium w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => setActiveView('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'calendar' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendário</span>
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'list' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista de Tarefas</span>
            </button>
            <button
              onClick={() => setActiveView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'kanban' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          <button
            onClick={() => {
              setFormDate(selectedDate);
              setIsAdding(true);
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* VIEW: CALENDAR */}
      {activeView === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Calendar Grid Box */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
            {/* Calendar Month Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-bold text-lg text-slate-800">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    const today = new Date();
                    setCurrentMonth(today.getMonth());
                    setCurrentYear(today.getFullYear());
                    setSelectedDate(today.toISOString().split('T')[0]);
                  }}
                  className="px-2.5 py-1.5 border border-slate-100 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-600 cursor-pointer"
                >
                  Hoje
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of week Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <span key={day} className="text-xs font-medium text-slate-400 font-sans py-1">
                  {day}
                </span>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map(({ dateString, dayNum, isCurrentMonth }, idx) => {
                const isSelected = selectedDate === dateString;
                const isToday = new Date().toISOString().split('T')[0] === dateString;
                const dayTasks = items.filter(item => item.date === dateString);
                const hasTasks = dayTasks.length > 0;
                const hasPending = dayTasks.some(t => t.status !== 'done');

                return (
                  <button
                    key={`${dateString}-${idx}`}
                    onClick={() => handleDayClick(dateString)}
                    className={`min-h-[70px] sm:min-h-[85px] p-2 flex flex-col justify-between items-start rounded-2xl border transition-all relative cursor-pointer group text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/20'
                        : isToday
                        ? 'border-slate-300 bg-slate-50'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/30'
                    }`}
                  >
                    {/* Day number */}
                    <span className={`text-xs font-semibold leading-none rounded-md px-1 py-0.5 ${
                      isCurrentMonth ? 'text-slate-700' : 'text-slate-300'
                    } ${isToday ? 'bg-slate-800 text-white' : ''}`}>
                      {dayNum}
                    </span>

                    {/* Task Indicators inside calendar cells */}
                    {hasTasks && (
                      <div className="w-full mt-2 space-y-1">
                        {/* Mobile dot indicator */}
                        <div className="sm:hidden flex gap-1 justify-center w-full">
                          <span className={`w-1.5 h-1.5 rounded-full ${hasPending ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                        </div>
                        {/* Desktop small badge / snippets */}
                        <div className="hidden sm:block space-y-0.5">
                          {dayTasks.slice(0, 2).map(task => (
                            <div 
                              key={task.id} 
                              className={`text-[9px] truncate font-medium rounded-md px-1 py-0.5 border ${
                                task.status === 'done' 
                                  ? 'bg-emerald-50/40 text-emerald-600 border-emerald-100/50 line-through' 
                                  : task.priority === 'high'
                                  ? 'bg-rose-50 text-rose-600 border-rose-100'
                                  : 'bg-blue-50 text-blue-600 border-blue-100'
                              }`}
                            >
                              {task.title}
                            </div>
                          ))}
                          {dayTasks.length > 2 && (
                            <div className="text-[8px] text-slate-400 font-mono text-center">
                              +{dayTasks.length - 2} mais
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Activities / Detail Side panel */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-base">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long' })}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="bg-white px-2 py-1 rounded-lg border border-slate-200 text-xs font-mono font-medium text-blue-600 shadow-2xs">
                  {itemsForSelectedDate.length} {itemsForSelectedDate.length === 1 ? 'evento' : 'eventos'}
                </div>
              </div>

              {/* Day item list */}
              <div className="mt-5 space-y-3 overflow-y-auto max-h-[300px] pr-1">
                {itemsForSelectedDate.length > 0 ? (
                  itemsForSelectedDate.map(item => (
                    <div 
                      key={item.id}
                      className="bg-white border border-slate-100 p-3 rounded-2xl shadow-2xs hover:shadow-xs transition-all relative group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() => onUpdateStatus(item.id, item.status === 'done' ? 'todo' : 'done')}
                            className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                              item.status === 'done' 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'border-slate-300 hover:border-blue-500'
                            }`}
                          >
                            {item.status === 'done' && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                          <div>
                            <p className={`text-xs font-semibold text-slate-700 leading-tight ${
                              item.status === 'done' ? 'line-through text-slate-400' : ''
                            }`}>
                              {item.title}
                            </p>
                            {item.time && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-slate-400 mt-1">
                                <Clock className="w-3 h-3" />
                                <span>{item.time}</span>
                              </span>
                            )}
                            {item.description && (
                              <p className="text-[10px] text-slate-400 mt-1 leading-normal max-w-[180px]">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center gap-1.5 mt-1.5">
                              {getPriorityBadge(item.priority)}
                              {getStatusBadge(item.status)}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-400 flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-6 h-6 text-slate-300" />
                    <p className="text-xs font-medium">Tranquilo por aqui hoje!</p>
                    <p className="text-[10px] text-slate-300">Nenhuma tarefa ou evento agendado.</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setFormDate(selectedDate);
                setIsAdding(true);
              }}
              className="mt-6 w-full flex items-center justify-center gap-1.5 py-2.5 bg-white hover:bg-slate-100 text-blue-600 rounded-xl text-xs font-semibold border border-slate-200 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar atividade para este dia</span>
            </button>
          </div>

        </div>
      )}

      {/* VIEW: LIST OF TASKS */}
      {activeView === 'list' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-bold text-lg text-slate-800">
              Todas as Tarefas
            </h3>
            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded-lg text-slate-500">
              {items.length} itens cadastrados
            </span>
          </div>

          <div className="space-y-3 max-w-4xl">
            {items.length > 0 ? (
              [...items].sort((a,b) => a.date.localeCompare(b.date)).map(item => (
                <div 
                  key={item.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-slate-100 hover:border-slate-200 bg-slate-50/30 rounded-2xl gap-3 group relative transition-all"
                >
                  <div className="flex items-start gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => onUpdateStatus(item.id, item.status === 'done' ? 'todo' : 'done')}
                      className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                        item.status === 'done' 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-slate-300 hover:border-blue-500'
                      }`}
                    >
                      {item.status === 'done' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <div>
                      <p className={`text-sm font-semibold text-slate-800 leading-tight ${
                        item.status === 'done' ? 'line-through text-slate-400' : ''
                      }`}>
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            {item.time ? ` às ${item.time}` : ''}
                          </span>
                        </span>
                        {getPriorityBadge(item.priority)}
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    {item.status !== 'done' && (
                      <select
                        value={item.status}
                        onChange={(e) => onUpdateStatus(item.id, e.target.value as 'todo' | 'doing' | 'done')}
                        className="text-xs bg-white border border-slate-200 rounded-lg p-1 font-sans text-slate-500 cursor-pointer"
                      >
                        <option value="todo">A Fazer</option>
                        <option value="doing">Fazendo</option>
                        <option value="done">Concluir</option>
                      </select>
                    )}
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-slate-400 flex flex-col items-center justify-center gap-3">
                <AlertCircle className="w-8 h-8 text-slate-300" />
                <p className="text-sm font-medium">Nenhuma tarefa cadastrada!</p>
                <p className="text-xs text-slate-300">Dê início a sua organização clicando em "Nova Tarefa" acima.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: KANBAN BOARD */}
      {activeView === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* COLUMN: A FAZER */}
          <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100 flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                <h3 className="font-display font-bold text-slate-800 text-sm">A Fazer</h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-lg">
                {items.filter(item => item.status === 'todo').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {items.filter(item => item.status === 'todo').map(item => (
                <div key={item.id} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-2xs hover:shadow-xs transition-all relative group">
                  <h4 className="text-xs font-bold text-slate-700 leading-tight">{item.title}</h4>
                  {item.description && <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">{item.description}</p>}
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-[9px] font-mono text-slate-400">
                      {new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {getPriorityBadge(item.priority)}
                      <button 
                        onClick={() => onUpdateStatus(item.id, 'doing')}
                        className="p-1 rounded-md border border-slate-100 text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Mover para Fazendo"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {items.filter(item => item.status === 'todo').length === 0 && (
                <div className="text-center py-10 text-xs text-slate-300">Nenhuma tarefa pendente.</div>
              )}
            </div>
          </div>

          {/* COLUMN: FAZENDO */}
          <div className="bg-amber-50/20 rounded-3xl p-4 border border-amber-100/50 flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></span>
                <h3 className="font-display font-bold text-slate-800 text-sm">Fazendo</h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-lg">
                {items.filter(item => item.status === 'doing').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {items.filter(item => item.status === 'doing').map(item => (
                <div key={item.id} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-2xs hover:shadow-xs border-l-2 border-l-amber-400 transition-all relative group">
                  <h4 className="text-xs font-bold text-slate-700 leading-tight">{item.title}</h4>
                  {item.description && <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">{item.description}</p>}
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-[9px] font-mono text-slate-400">
                      {new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {getPriorityBadge(item.priority)}
                      <div className="flex gap-1">
                        <button 
                          onClick={() => onUpdateStatus(item.id, 'todo')}
                          className="p-1 rounded-md border border-slate-100 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                          title="Voltar para A Fazer"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => onUpdateStatus(item.id, 'done')}
                          className="p-1 rounded-md border border-slate-100 text-emerald-500 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Mover para Concluído"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {items.filter(item => item.status === 'doing').length === 0 && (
                <div className="text-center py-10 text-xs text-slate-300">Nenhum projeto em andamento.</div>
              )}
            </div>
          </div>

          {/* COLUMN: CONCLUÍDO */}
          <div className="bg-emerald-50/20 rounded-3xl p-4 border border-emerald-100/50 flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                <h3 className="font-display font-bold text-slate-800 text-sm">Concluído</h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-lg">
                {items.filter(item => item.status === 'done').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {items.filter(item => item.status === 'done').map(item => (
                <div key={item.id} className="bg-white/80 border border-slate-100 p-4 rounded-2xl shadow-2xs hover:shadow-xs transition-all opacity-80 hover:opacity-100 line-through text-slate-400">
                  <h4 className="text-xs font-bold leading-tight">{item.title}</h4>
                  {item.description && <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">{item.description}</p>}
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-[9px] font-mono text-slate-300">
                      {new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                    <button 
                      onClick={() => onUpdateStatus(item.id, 'doing')}
                      className="p-1 rounded-md border border-slate-100 text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Voltar para Fazendo"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              {items.filter(item => item.status === 'done').length === 0 && (
                <div className="text-center py-10 text-xs text-slate-300">Nenhuma tarefa concluída ainda.</div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* FORM MODAL FOR NEW TASK */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-xl">
            <h3 className="font-display font-bold text-lg text-slate-900 mb-4">Adicionar Nova Atividade</h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Título da Atividade</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Preparar esboços de sermão..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-blue-500 text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-blue-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Hora (Opcional)</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-blue-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Prioridade</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all cursor-pointer ${
                        newPriority === p
                          ? p === 'high'
                            ? 'bg-rose-50 border-rose-300 text-rose-600 font-bold'
                            : p === 'medium'
                            ? 'bg-amber-50 border-amber-300 text-amber-600 font-bold'
                            : 'bg-slate-100 border-slate-300 text-slate-600 font-bold'
                          : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {p === 'low' ? 'Baixa' : p === 'medium' ? 'Média' : 'Alta'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição detalhada (Opcional)</label>
                <textarea
                  placeholder="Instruções, contatos, notas teológicas ou observações relevantes..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-blue-500 text-slate-800 leading-normal"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
