/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AgendaItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  status: 'todo' | 'doing' | 'done';
  priority: 'low' | 'medium' | 'high';
  description?: string;
  createdByName?: string;
  updatedByName?: string;
}

export interface RecadoItem {
  id: string;
  title: string;
  text: string;
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange' | 'slate';
  priority: 'low' | 'medium' | 'high';
  isPinned: boolean;
  createdAt: string;
  createdByName?: string;
}

export interface MemoriaItem {
  id: string;
  imageUrl: string; // base64 or link
  caption: string;
  date: string; // YYYY-MM-DD
  expiration: 'permanent' | '24h' | '7d';
  createdAt: string; // ISO string
  isShared: boolean;
  createdByName?: string;
}

export interface CartinhaItem {
  id: string;
  title: string;
  content: string;
  sender: string;
  recipient: string;
  date: string; // YYYY-MM-DD
  deliverAt: string; // YYYY-MM-DD
  stampType: 'floral' | 'crown' | 'anchor' | 'heart' | 'retro';
  sealColor: 'burgundy' | 'gold' | 'navy' | 'emerald' | 'bronze';
  isOpened: boolean;
  createdByName?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'owner' | 'guest';
  senderName: string;
  text: string;
  timestamp: string; // HH:MM or ISO string
}

export interface ConversaRoom {
  id: string; // URL slug, e.g. "familia" or "kimberly"
  name: string;
  avatarColor: string;
  description: string;
  createdAt: string;
  messages: ChatMessage[];
  personaPrompt?: string; // Prompt for simulated responses
  participantIds?: string[]; // IDs of profiles allowed to view/chat
}

export interface ConteudoFile {
  id: string;
  name: string;
  category: 'sermoes' | 'estudos' | 'aulas' | 'pdfs' | 'downloads' | 'documentos';
  size: string;
  uploadDate: string;
  content?: string; // Text content for document viewing
  author?: string;
  createdByName?: string;
}

export interface JoaoStatus {
  id: string; // 'current'
  status: 'dormindo' | 'acordado' | 'disponivel' | 'trabalhando' | 'reuniao';
  lastUpdated: string;
}

export interface TimezoneAlarm {
  id: string;
  title: string;
  timeBrazil: string; // "HH:MM"
  timeEgypt: string;  // "HH:MM"
  sourceTimezone: 'Brazil' | 'Egypt';
  createdAt: string;
  createdByName?: string;
}

export interface ProfilePermissions {
  agenda: 'none' | 'view' | 'edit';
  recados: 'none' | 'view' | 'edit';
  memorias: 'none' | 'view' | 'edit';
  cartinhas: 'none' | 'view' | 'edit';
  conversas: 'none' | 'view' | 'edit';
  conteudos: 'none' | 'view' | 'edit';
  timezone: 'none' | 'view' | 'edit';
}

export interface Profile {
  id: string;
  name: string;
  code?: string; // administrative entry code (e.g. "adm" for João)
  isAdmin: boolean;
  permissions: ProfilePermissions;
  createdAt: string;
}

