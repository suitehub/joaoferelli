/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Calendar, 
  Pin, 
  Image, 
  Mail, 
  MessageSquare, 
  FolderOpen, 
  TrendingUp, 
  ArrowRight,
  Clock,
  CheckSquare,
  Brain
} from 'lucide-react';
import { motion } from 'motion/react';
import { AgendaItem, RecadoItem, MemoriaItem, CartinhaItem, ConversaRoom, ConteudoFile } from '../types';

interface DashboardProps {
  currentTab: 'meu-mundo' | 'compartilhado';
  onSelectPanel: (panelId: string) => void;
  agenda: AgendaItem[];
  recados: RecadoItem[];
  memorias: MemoriaItem[];
  cartinhas: CartinhaItem[];
  conversas: ConversaRoom[];
  conteudos: ConteudoFile[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentTab,
  onSelectPanel,
  agenda,
  recados,
  memorias,
  cartinhas,
  conversas,
  conteudos,
}) => {
  // Compute some quick stats to display on cards
  const pendingTasks = agenda.filter(item => item.status !== 'done').length;
  const doneTasks = agenda.filter(item => item.status === 'done').length;
  const pinnedRecados = recados.filter(item => item.isPinned).length;
  const totalRecados = recados.length;
  const totalMemorias = memorias.length;
  const unreadCartinhas = cartinhas.filter(item => !item.isOpened && new Date(item.deliverAt) <= new Date()).length;
  const pendingCartinhas = cartinhas.filter(item => new Date(item.deliverAt) > new Date()).length;
  const totalConversas = conversas.length;
  const totalConteudos = conteudos.length;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Dynamic Intro Banner */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight flex flex-col sm:flex-row sm:items-center gap-2">
          <span>Olá, João!</span>
          <span className="text-slate-400 font-normal text-xl sm:text-2xl">
            {currentTab === 'meu-mundo' 
              ? 'Explorando o seu mundo privado.' 
              : 'Espaço compartilhado com conexões.'}
          </span>
        </h1>
        <p className="mt-2 text-slate-500 max-w-xl text-sm sm:text-base">
          {currentTab === 'meu-mundo'
            ? 'Organize sua rotina, rascunhe seus pensamentos, guarde seus estudos preciosos e registre suas memórias diárias com tranquilidade.'
            : 'Envie correspondências especiais, acesse links de conversas exclusivas e mantenha fotos compartilhadas com quem importa.'}
        </p>
      </div>

      {/* Grid Layout based on selected World */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        
        {currentTab === 'meu-mundo' ? (
          <>
            {/* PANEL: AGENDA */}
            <motion.div 
              variants={itemVariants}
              onClick={() => onSelectPanel('agenda')}
              className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-blue-100 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-[240px]"
              id="card-agenda"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">PAINEL 01</span>
                </div>
                <h3 className="font-display font-bold text-xl text-slate-800 mt-4 group-hover:text-blue-600 transition-colors">
                  Agenda & Tarefas
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Calendário mensal unificado com lista de tarefas e visão Kanban interativa.
                </p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs font-mono font-medium text-slate-500">
                    <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
                    <span>{pendingTasks} pendentes</span>
                  </div>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="text-xs font-mono text-emerald-600">{doneTasks} feitas</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>

            {/* PANEL: RECADOS */}
            <motion.div 
              variants={itemVariants}
              onClick={() => onSelectPanel('recados')}
              className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-amber-100 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-[240px]"
              id="card-recados"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                    <Pin className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">PAINEL 02</span>
                </div>
                <h3 className="font-display font-bold text-xl text-slate-800 mt-4 group-hover:text-amber-600 transition-colors">
                  Mural de Recados
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Grade de notas visuais coloridas com fixadores para você bater o olho e se lembrar.
                </p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs font-mono font-medium text-slate-500">
                    <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{pinnedRecados} fixados</span>
                  </div>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="text-xs font-mono text-slate-400">{totalRecados} notas total</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>

            {/* PANEL: MEMÓRIAS PRIVADAS */}
            <motion.div 
              variants={itemVariants}
              onClick={() => onSelectPanel('memorias')}
              className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-pink-100 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-[240px]"
              id="card-memorias"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl group-hover:bg-pink-500 group-hover:text-white transition-colors duration-300">
                    <Image className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">PAINEL 03</span>
                </div>
                <h3 className="font-display font-bold text-xl text-slate-800 mt-4 group-hover:text-pink-600 transition-colors">
                  Memórias Diárias
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Diário fotográfico privado de momentos especiais. Escolha guardar ou definir auto-expiração.
                </p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500">{totalMemorias} polaroids catalogadas</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-pink-500 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>

            {/* PANEL: CONTEÚDOS */}
            <motion.div 
              variants={itemVariants}
              onClick={() => onSelectPanel('conteudos')}
              className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-indigo-100 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-[240px]"
              id="card-conteudos"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">PAINEL 04</span>
                </div>
                <h3 className="font-display font-bold text-xl text-slate-800 mt-4 group-hover:text-indigo-600 transition-colors">
                  Biblioteca Pessoal
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Organizador pessoal de sermões, estudos bíblicos, anotações de aulas e materiais de apoio.
                </p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500">{totalConteudos} arquivos indexados</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          </>
        ) : (
          <>
            {/* PANEL: CARTINHAS */}
            <motion.div 
              variants={itemVariants}
              onClick={() => onSelectPanel('cartinhas')}
              className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-emerald-100 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-[240px]"
              id="card-cartinhas"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                    <Mail className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">COMPARTILHADO 01</span>
                </div>
                <h3 className="font-display font-bold text-xl text-slate-800 mt-4 group-hover:text-emerald-600 transition-colors">
                  Cartinhas Digitais
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Escreva e programe correspondências com design de papel tradicional, selos e lacres de cera fofos.
                </p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  {unreadCartinhas > 0 ? (
                    <div className="flex items-center gap-1 text-xs font-mono font-medium text-emerald-600">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      <span>{unreadCartinhas} novas para abrir!</span>
                    </div>
                  ) : (
                    <span className="text-xs font-mono text-slate-400">Sem cartas pendentes</span>
                  )}
                  {pendingCartinhas > 0 && (
                    <>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="text-xs font-mono text-slate-400">{pendingCartinhas} agendadas</span>
                    </>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>

            {/* PANEL: CONVERSAS */}
            <motion.div 
              variants={itemVariants}
              onClick={() => onSelectPanel('conversas')}
              className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-rose-100 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-[240px]"
              id="card-conversas"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-500 group-hover:text-white transition-colors duration-300">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">COMPARTILHADO 02</span>
                </div>
                <h3 className="font-display font-bold text-xl text-slate-800 mt-4 group-hover:text-rose-600 transition-colors">
                  Conversas & Canais
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Espaços independentes compartilhados através de links diretos e exclusivos para conexão direta.
                </p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500">{totalConversas} salas de bate-papo ativas</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>

            {/* PANEL: MEMÓRIAS COMPARTILHADAS */}
            <motion.div 
              variants={itemVariants}
              onClick={() => onSelectPanel('memorias-compartilhadas')}
              className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-pink-100 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-[240px]"
              id="card-memorias-compartilhadas"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl group-hover:bg-pink-500 group-hover:text-white transition-colors duration-300">
                    <Image className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">COMPARTILHADO 03</span>
                </div>
                <h3 className="font-display font-bold text-xl text-slate-800 mt-4 group-hover:text-pink-600 transition-colors">
                  Fotos Compartilhadas
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Mural visual público de memórias e momentos inesquecíveis que você optou por compartilhar.
                </p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500">
                    {memorias.filter(m => m.isShared).length} fotos públicas
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-pink-500 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          </>
        )}

      </motion.div>

      {/* Mindful Quotes or Mental Summary in Footer */}
      <div className="mt-16 bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-emerald-50/50 rounded-3xl p-6 sm:p-8 border border-slate-100/80 flex flex-col sm:flex-row items-center gap-6">
        <div className="bg-white p-3 rounded-2xl shadow-xs shrink-0">
          <Brain className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h4 className="font-display font-bold text-slate-800 text-sm">Organização Cerebral Equilibrada</h4>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            Seu cérebro guarda dados preciosos para você. Quando anotamos as preocupações na <strong className="text-blue-600 font-medium">Agenda</strong> ou nos <strong className="text-amber-600 font-medium">Recados</strong>, nossa mente relaxa. Ao guardarmos sentimentos em <strong className="text-emerald-600 font-medium">Cartinhas</strong> ou congelarmos o tempo nas <strong className="text-pink-600 font-medium">Memórias</strong>, fortalecemos nosso afeto e nossa paz espiritual.
          </p>
        </div>
      </div>

    </div>
  );
};
