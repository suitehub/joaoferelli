/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  Lock, 
  Eye, 
  Shield, 
  Link, 
  UserPlus, 
  Settings, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Profile, ProfilePermissions } from '../types';

interface ProfilePanelProps {
  profiles: Profile[];
  onAddProfile: (name: string, permissions: ProfilePermissions) => void;
  onUpdateProfilePermissions: (id: string, permissions: ProfilePermissions) => void;
  onDeleteProfile: (id: string) => void;
}

const INITIAL_PERMISSIONS: ProfilePermissions = {
  agenda: 'edit',
  recados: 'edit',
  memorias: 'edit',
  cartinhas: 'edit',
  conversas: 'edit',
  conteudos: 'edit',
  timezone: 'edit'
};

const PANEL_LABELS: Record<keyof ProfilePermissions, string> = {
  agenda: 'Agenda & Tarefas',
  recados: 'Mural de Recados',
  memorias: 'Memórias Diárias',
  cartinhas: 'Cartinhas Digitais',
  conversas: 'Conversas & Canais',
  conteudos: 'Biblioteca Pessoal',
  timezone: 'Fuso Horário & Alarmes'
};

export const ProfilePanel: React.FC<ProfilePanelProps> = ({
  profiles,
  onAddProfile,
  onUpdateProfilePermissions,
  onDeleteProfile,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPermissions, setNewPermissions] = useState<ProfilePermissions>({ ...INITIAL_PERMISSIONS });
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<ProfilePermissions>({ ...INITIAL_PERMISSIONS });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (profileId: string) => {
    const accessUrl = `${window.location.origin}${window.location.pathname}?profileId=${profileId}`;
    navigator.clipboard.writeText(accessUrl).then(() => {
      setCopiedId(profileId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddProfile(newName.trim(), newPermissions);
    setNewName('');
    setNewPermissions({ ...INITIAL_PERMISSIONS });
    setIsAdding(false);
  };

  const handleEditClick = (profile: Profile) => {
    setEditingProfileId(profile.id);
    setEditingPermissions({ ...profile.permissions });
  };

  const handleSavePermissions = (profileId: string) => {
    onUpdateProfilePermissions(profileId, editingPermissions);
    setEditingProfileId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            <span className="p-1.5 bg-rose-50 text-rose-500 rounded-lg"><Users className="w-5 h-5" /></span>
            <span>Gestão de Perfis & Acessos</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Como administrador principal, você pode criar conexões convidadas, gerar links de login automático e controlar quais painéis eles podem editar ou ver.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Criar Nova Conexão</span>
        </button>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 gap-6">
        {profiles.map((profile) => {
          const isEditing = editingProfileId === profile.id;
          const directLink = `${window.location.origin}${window.location.pathname}?profileId=${profile.id}`;

          return (
            <div 
              key={profile.id}
              className={`bg-white rounded-3xl border p-6 shadow-2xs hover:shadow-xs transition-all relative ${
                profile.isAdmin ? 'border-rose-100 bg-rose-50/5' : 'border-slate-100'
              }`}
            >
              {/* Profile card header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-white ${
                    profile.isAdmin ? 'bg-rose-500' : 'bg-slate-400'
                  }`}>
                    {profile.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-sm text-slate-800">{profile.name}</h3>
                      {profile.isAdmin && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md">
                          Admin Principal
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Criado em {new Date(profile.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {/* Actions & Links for non-admin profiles */}
                {!profile.isAdmin && (
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* Copy Link Button */}
                    <button
                      onClick={() => handleCopyLink(profile.id)}
                      className="flex items-center gap-1 text-[10px] font-semibold bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg border border-rose-100/40 cursor-pointer hover:bg-rose-100 transition-colors"
                      title="Copiar link de login automático"
                    >
                      {copiedId === profile.id ? <Check className="w-3.5 h-3.5" /> : <Link className="w-3.5 h-3.5" />}
                      <span>{copiedId === profile.id ? 'Copiado!' : 'Copiar Link de Login'}</span>
                    </button>

                    {/* Edit Permissions Toggle */}
                    {!isEditing ? (
                      <button
                        onClick={() => handleEditClick(profile)}
                        className="flex items-center gap-1 text-[10px] font-semibold bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Permissões</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSavePermissions(profile.id)}
                        className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-emerald-600 transition-colors shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Salvar</span>
                      </button>
                    )}

                    {/* Delete Profile */}
                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza de que deseja excluir o perfil de "${profile.name}"? Isso também excluirá o chat associado.`)) {
                          onDeleteProfile(profile.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                      title="Excluir Conexão"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Share info box for created non-admins */}
              {!profile.isAdmin && (
                <div className="mt-4 p-3 bg-slate-50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-slate-500">
                      <strong>Canal de Chat automático:</strong> Um chat exclusivo chamado "{profile.name}" foi criado e vinculado a este perfil.
                    </span>
                  </div>
                  <div className="font-mono text-slate-400 select-all overflow-x-auto max-w-full sm:max-w-xs whitespace-nowrap bg-white px-2 py-1 rounded border border-slate-100">
                    {directLink}
                  </div>
                </div>
              )}

              {/* Permissions matrix */}
              <div className="mt-6">
                <h4 className="font-display font-bold text-xs text-slate-700 mb-3 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-500" />
                  <span>Matriz de Acesso aos Painéis</span>
                </h4>

                {profile.isAdmin ? (
                  <p className="text-[11px] font-medium text-rose-600/80 bg-rose-50/30 p-3 rounded-2xl border border-rose-100/20">
                    👑 O Administrador Principal tem acesso irrestrito de visualização, criação, edição e exclusão em todas as áreas do aplicativo.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(Object.keys(profile.permissions) as Array<keyof ProfilePermissions>).map((key) => {
                      const value = isEditing ? editingPermissions[key] : profile.permissions[key];

                      return (
                        <div key={key} className="border border-slate-100/80 rounded-2xl p-3 bg-slate-50/30 flex flex-col justify-between">
                          <span className="text-xs font-semibold text-slate-700">{PANEL_LABELS[key]}</span>
                          
                          {isEditing ? (
                            <select
                              value={value}
                              onChange={(e) => {
                                setEditingPermissions({
                                  ...editingPermissions,
                                  [key]: e.target.value as any
                                });
                              }}
                              className="mt-2 text-[11px] font-bold bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-hidden text-slate-700"
                            >
                              <option value="edit">✍️ Acesso Total (Editar)</option>
                              <option value="view">👁️ Apenas Visualizar</option>
                              <option value="none">🚫 Bloqueado (Ocultar)</option>
                            </select>
                          ) : (
                            <span className={`mt-2 text-[10px] font-bold inline-flex items-center gap-1 px-2.5 py-1 rounded-md w-fit ${
                              value === 'edit'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : value === 'view'
                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                              {value === 'edit' && '✍️ Total (Editar)'}
                              {value === 'view' && '👁️ Apenas Visualizar'}
                              {value === 'none' && '🚫 Sem Acesso'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {profiles.length === 1 && (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <AlertCircle className="w-10 h-10 text-slate-300" />
            <p className="text-sm font-semibold">Nenhuma conexão convidada criada ainda.</p>
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
              Crie uma conexão para a Kimberly, amigos ou família clicando em "Criar Nova Conexão" acima e envie o link gerado para eles.
            </p>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-slate-100 shadow-xl overflow-y-auto max-h-[90vh]">
            <h3 className="font-display font-bold text-lg text-slate-900 mb-2">Criar Nova Conexão de Perfil</h3>
            <p className="text-xs text-slate-400 mb-6">
              Defina o nome da pessoa e configure quais painéis estarão disponíveis para ela.
            </p>
            
            <form onSubmit={handleAddSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nome Completo / Apelido</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Kimberly Ferelli, Mãe, Mateus..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:border-rose-400 text-slate-800 font-medium"
                />
              </div>

              {/* Permissions matrix inside creation */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-3">Definir Níveis de Permissão</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(Object.keys(newPermissions) as Array<keyof ProfilePermissions>).map((key) => (
                    <div key={key} className="border border-slate-100 rounded-2xl p-3 bg-slate-50/50 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-700">{PANEL_LABELS[key]}</span>
                      <select
                        value={newPermissions[key]}
                        onChange={(e) => {
                          setNewPermissions({
                            ...newPermissions,
                            [key]: e.target.value as any
                          });
                        }}
                        className="text-xs font-bold bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-hidden text-slate-700"
                      >
                        <option value="edit">✍️ Acesso Total</option>
                        <option value="view">👁️ Apenas Ver</option>
                        <option value="none">🚫 Sem Acesso</option>
                      </select>
                    </div>
                  ))}
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
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Confirmar Perfil & Criar Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
