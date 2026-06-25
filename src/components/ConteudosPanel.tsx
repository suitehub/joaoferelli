/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  FolderOpen, 
  Search, 
  Plus, 
  Trash2, 
  FileText, 
  FileCode, 
  BookOpen, 
  Download, 
  ChevronRight, 
  Grid, 
  List,
  Folder,
  ArrowLeft,
  X,
  Upload
} from 'lucide-react';
import { ConteudoFile } from '../types';

interface ConteudosPanelProps {
  files: ConteudoFile[];
  onAddFile: (file: Omit<ConteudoFile, 'id' | 'uploadDate'>) => void;
  onDeleteFile: (id: string) => void;
  isReadOnly?: boolean;
}

const CATEGORIES = [
  { id: 'all', label: 'Tudo', icon: FolderOpen, color: 'text-indigo-500' },
  { id: 'sermoes', label: 'Sermões', icon: BookOpen, color: 'text-emerald-500' },
  { id: 'estudos', label: 'Estudos Bíblicos', icon: FileText, color: 'text-blue-500' },
  { id: 'aulas', label: 'Aulas', icon: FileCode, color: 'text-pink-500' },
  { id: 'pdfs', label: 'PDFs', icon: FileText, color: 'text-rose-500' },
  { id: 'downloads', label: 'Downloads', icon: Download, color: 'text-amber-500' },
  { id: 'documentos', label: 'Documentos', icon: Folder, color: 'text-slate-500' },
];

export const ConteudosPanel: React.FC<ConteudosPanelProps> = ({
  files,
  onAddFile,
  onDeleteFile,
  isReadOnly = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Modals state
  const [isAdding, setIsAdding] = useState(false);
  const [viewingFile, setViewingFile] = useState<ConteudoFile | null>(null);

  // Form states
  const [newFileName, setNewFileName] = useState('');
  const [newFileCategory, setNewFileCategory] = useState<ConteudoFile['category']>('sermoes');
  const [newFileContent, setNewFileContent] = useState('');
  const [newFileAuthor, setNewFileAuthor] = useState('João');
  
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
    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      onAddFile({
        name: file.name,
        category: getCategoryFromExtension(file.name),
        size: sizeStr,
        content: typeof reader.result === 'string' ? reader.result : 'Conteúdo do arquivo não textual.',
        author: 'João'
      });
    };
  };

  const getCategoryFromExtension = (filename: string): ConteudoFile['category'] => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdfs';
    if (filename.toLowerCase().includes('sermon') || filename.toLowerCase().includes('sermao')) return 'sermoes';
    if (filename.toLowerCase().includes('estudo') || filename.toLowerCase().includes('biblia')) return 'estudos';
    if (filename.toLowerCase().includes('aula')) return 'aulas';
    return 'documentos';
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
    if (!newFileName.trim()) return;

    onAddFile({
      name: newFileName.endsWith('.txt') ? newFileName : `${newFileName}.txt`,
      category: newFileCategory,
      size: `${Math.round(newFileContent.length / 100) / 10} KB`,
      content: newFileContent || 'Arquivo vazio.',
      author: newFileAuthor || 'João'
    });

    setNewFileName('');
    setNewFileContent('');
    setNewFileAuthor('João');
    setIsAdding(false);
  };

  // Filter files
  const filteredFiles = files.filter(file => {
    const matchesCategory = activeCategory === 'all' || file.category === activeCategory;
    const matchesSearch = file.name.toLowerCase().includes(search.toLowerCase()) || 
                          (file.content && file.content.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><FolderOpen className="w-5 h-5" /></span>
            <span>Biblioteca de Conteúdos</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Seu acervo pessoal. Guarde e organize sermões, arquivos, esboços e anotações teológicas com facilidade.
          </p>
        </div>

        {/* Search and Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar arquivos e textos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-400 text-slate-700"
            />
          </div>

          {!isReadOnly && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Arquivo</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR CATEGORIES */}
        <div className="lg:col-span-1 space-y-1">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">Pastas / Categorias</h3>
          
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 gap-1 lg:space-y-1 select-none">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;
              const catCount = cat.id === 'all' 
                ? files.length 
                : files.filter(f => f.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left w-full shrink-0 lg:w-auto ${
                    isSelected 
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/45' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${cat.color}`} />
                    <span>{cat.label}</span>
                  </div>
                  <span className="bg-slate-100 text-slate-500 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold">
                    {catCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FILES MAIN SECTION */}
        <div className="lg:col-span-3">
          
          {/* Controls: view modes */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500">
              Mostrando {filteredFiles.length} de {files.length} arquivos
            </span>
            <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-slate-400">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md cursor-pointer ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-2xs' : 'hover:text-slate-600'}`}
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md cursor-pointer ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-2xs' : 'hover:text-slate-600'}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Grid View */}
          {filteredFiles.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFiles.map(file => {
                  return (
                    <div
                      key={file.id}
                      onClick={() => setViewingFile(file)}
                      className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:border-indigo-100 cursor-pointer transition-all flex flex-col justify-between h-[150px] relative group"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                            <FileText className="w-5 h-5" />
                          </div>
                          {!isReadOnly && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteFile(file.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                              title="Deletar arquivo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        
                        <h4 className="font-display font-bold text-xs text-slate-800 mt-3 truncate group-hover:text-indigo-600">
                          {file.createdByName && (
                            <span className="text-rose-600 font-bold mr-1">[{file.createdByName}]</span>
                          )}
                          {file.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono font-medium tracking-wide">
                          Pasta {CATEGORIES.find(c => c.id === file.category)?.label || file.category}
                        </p>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-3 border-t border-slate-50 mt-2">
                        <span>{file.size}</span>
                        <span>{file.uploadDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="space-y-2">
                {filteredFiles.map(file => (
                  <div
                    key={file.id}
                    onClick={() => setViewingFile(file)}
                    className="flex justify-between items-center bg-white border border-slate-100 p-3 rounded-xl hover:border-indigo-100 hover:bg-indigo-50/10 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-xs text-slate-800 group-hover:text-indigo-600">
                          {file.createdByName && (
                            <span className="text-rose-600 font-bold mr-1">[{file.createdByName}]</span>
                          )}
                          {file.name}
                        </h4>
                        <p className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">
                          {CATEGORIES.find(c => c.id === file.category)?.label || file.category} • {file.author}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 font-mono text-[10px] text-slate-400">
                      <span>{file.size}</span>
                      <span>{file.uploadDate}</span>
                      {!isReadOnly && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFile(file.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-md transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <FolderOpen className="w-10 h-10 text-slate-300" />
              <p className="text-sm font-semibold">Nenhum arquivo encontrado!</p>
              <p className="text-xs text-slate-300">
                {search ? 'Modifique seus termos de busca.' : 'Crie ou arraste arquivos para esta pasta para organizar seu acervo.'}
              </p>
            </div>
          )}

        </div>
      </div>

      {/* FORM: NEW DOCUMENT FILE */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-100 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-display font-bold text-lg text-slate-900 mb-4">Adicionar Documento à Biblioteca</h3>
            
            {/* Direct file Drag-Drop area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all mb-4 ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-50/20' 
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">Arraste e solte um arquivo de texto/PDF aqui</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Ou clique para procurar arquivos locais</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,.docx,.doc"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="text-center text-[9px] text-slate-400 font-bold mb-3">OU ESCREVA UM TEXTO DIRETO NO SISTEMA</div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nome do Documento</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Esboço_Sermão_Tema"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-indigo-500 text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Categoria / Pasta</label>
                  <select
                    value={newFileCategory}
                    onChange={(e) => setNewFileCategory(e.target.value as ConteudoFile['category'])}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-indigo-500 text-slate-700"
                  >
                    <option value="sermoes">Sermões</option>
                    <option value="estudos">Estudos Bíblicos</option>
                    <option value="aulas">Aulas</option>
                    <option value="pdfs">PDFs</option>
                    <option value="downloads">Downloads</option>
                    <option value="documentos">Documentos Gerais</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Autor</label>
                <input
                  type="text"
                  value={newFileAuthor}
                  onChange={(e) => setNewFileAuthor(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Conteúdo Textual do Arquivo</label>
                <textarea
                  placeholder="Escreva as notas teológicas, esboço de sermão ou resumo da aula aqui..."
                  value={newFileContent}
                  onChange={(e) => setNewFileContent(e.target.value)}
                  rows={6}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-indigo-500 text-slate-800 leading-relaxed font-mono"
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Criar Arquivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT DETAILED VIEWER (MODAL) */}
      {viewingFile && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[80vh]">
            
            {/* Header */}
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-sm">{viewingFile.name}</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-mono font-medium tracking-wide">
                    {CATEGORIES.find(c => c.id === viewingFile.category)?.label || viewingFile.category} • Por {viewingFile.author}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingFile(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content View */}
            <div className="flex-1 overflow-y-auto p-8 bg-[#fdfdfc] text-slate-800 leading-relaxed text-sm whitespace-pre-wrap font-sans">
              {viewingFile.content ? (
                <div className="max-w-xl mx-auto space-y-4">
                  {/* If it looks like a sermon/study, styled like an elegant sheet */}
                  <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-100 shadow-2xs font-serif italic text-slate-700 leading-8">
                    {viewingFile.content}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 font-medium">Este arquivo não possui conteúdo de visualização rápida.</div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center shrink-0 font-mono text-[10px] text-slate-400">
              <span>Tamanho: {viewingFile.size} • Sincronizado</span>
              <button
                onClick={() => setViewingFile(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Fechar Visualização
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
