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
}

export interface RecadoItem {
  id: string;
  title: string;
  text: string;
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange' | 'slate';
  priority: 'low' | 'medium' | 'high';
  isPinned: boolean;
  createdAt: string;
}

export interface MemoriaItem {
  id: string;
  imageUrl: string; // base64 or link
  caption: string;
  date: string; // YYYY-MM-DD
  expiration: 'permanent' | '24h' | '7d';
  createdAt: string; // ISO string
  isShared: boolean;
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
}

export interface ConteudoFile {
  id: string;
  name: string;
  category: 'sermoes' | 'estudos' | 'aulas' | 'pdfs' | 'downloads' | 'documentos';
  size: string;
  uploadDate: string;
  content?: string; // Text content for document viewing
  author?: string;
}
