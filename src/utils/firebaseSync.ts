import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  AgendaItem, 
  RecadoItem, 
  MemoriaItem, 
  CartinhaItem, 
  ConversaRoom, 
  ConteudoFile,
  ChatMessage
} from '../types';

/**
 * Validates connection to Firestore. Required by system guidelines.
 */
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

/**
 * Seeds the database if collections are currently empty.
 * Set to a no-op as the user requested a completely empty/clean production database.
 */
export async function seedDatabaseIfEmpty() {
  console.log('Database seeding is disabled. Application starts with empty collections.');
}

// --- Wrapper CRUD Functions for Firestore ---

// 1. Agenda CRUD
export async function addAgendaItemDb(item: AgendaItem) {
  try {
    await setDoc(doc(db, 'agenda', item.id), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `agenda/${item.id}`);
  }
}

export async function updateAgendaItemDb(id: string, updates: Partial<AgendaItem>) {
  try {
    await updateDoc(doc(db, 'agenda', id), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `agenda/${id}`);
  }
}

export async function deleteAgendaItemDb(id: string) {
  try {
    await deleteDoc(doc(db, 'agenda', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `agenda/${id}`);
  }
}

// 2. Recados CRUD
export async function addRecadoItemDb(item: RecadoItem) {
  try {
    await setDoc(doc(db, 'recados', item.id), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `recados/${item.id}`);
  }
}

export async function updateRecadoItemDb(id: string, updates: Partial<RecadoItem>) {
  try {
    await updateDoc(doc(db, 'recados', id), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `recados/${id}`);
  }
}

export async function deleteRecadoItemDb(id: string) {
  try {
    await deleteDoc(doc(db, 'recados', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `recados/${id}`);
  }
}

// 3. Memorias CRUD
export async function addMemoriaItemDb(item: MemoriaItem) {
  try {
    await setDoc(doc(db, 'memorias', item.id), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `memorias/${item.id}`);
  }
}

export async function updateMemoriaItemDb(id: string, updates: Partial<MemoriaItem>) {
  try {
    await updateDoc(doc(db, 'memorias', id), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `memorias/${id}`);
  }
}

export async function deleteMemoriaItemDb(id: string) {
  try {
    await deleteDoc(doc(db, 'memorias', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `memorias/${id}`);
  }
}

// 4. Cartinhas CRUD
export async function addCartinhaItemDb(item: CartinhaItem) {
  try {
    await setDoc(doc(db, 'cartinhas', item.id), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `cartinhas/${item.id}`);
  }
}

export async function updateCartinhaItemDb(id: string, updates: Partial<CartinhaItem>) {
  try {
    await updateDoc(doc(db, 'cartinhas', id), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `cartinhas/${id}`);
  }
}

export async function deleteCartinhaItemDb(id: string) {
  try {
    await deleteDoc(doc(db, 'cartinhas', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `cartinhas/${id}`);
  }
}

// 5. Conversas CRUD
export async function addConversaRoomDb(room: Omit<ConversaRoom, 'messages'>) {
  try {
    await setDoc(doc(db, 'conversas', room.id), room);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `conversas/${room.id}`);
  }
}

export async function deleteConversaRoomDb(id: string) {
  try {
    await deleteDoc(doc(db, 'conversas', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `conversas/${id}`);
  }
}

export async function addChatMessageDb(roomId: string, message: ChatMessage) {
  try {
    await setDoc(doc(db, 'conversas', roomId, 'messages', message.id), message);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `conversas/${roomId}/messages/${message.id}`);
  }
}

// 6. Conteudos CRUD
export async function addConteudoFileDb(file: ConteudoFile) {
  try {
    await setDoc(doc(db, 'conteudos', file.id), file);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `conteudos/${file.id}`);
  }
}

export async function deleteConteudoFileDb(id: string) {
  try {
    await deleteDoc(doc(db, 'conteudos', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `conteudos/${id}`);
  }
}

export async function resetDatabaseDb() {
  try {
    const collections = ['agenda', 'recados', 'memorias', 'cartinhas', 'conteudos'];
    
    // Delete flat collections
    for (const colName of collections) {
      const snap = await getDocs(collection(db, colName));
      const batch = writeBatch(db);
      snap.forEach((d) => {
        batch.delete(doc(db, colName, d.id));
      });
      await batch.commit();
    }

    // Delete conversas & subcollection messages
    const conversasSnap = await getDocs(collection(db, 'conversas'));
    for (const roomDoc of conversasSnap.docs) {
      const msgsSnap = await getDocs(collection(db, 'conversas', roomDoc.id, 'messages'));
      const msgBatch = writeBatch(db);
      msgsSnap.forEach((m) => {
        msgBatch.delete(doc(db, 'conversas', roomDoc.id, 'messages', m.id));
      });
      await msgBatch.commit();
      await deleteDoc(doc(db, 'conversas', roomDoc.id));
    }
    
    // Re-seed with fresh initial presentation data
    await seedDatabaseIfEmpty();
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}
