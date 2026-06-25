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
  initialAgenda, 
  initialRecados, 
  initialMemorias, 
  initialCartinhas, 
  initialConversas, 
  initialConteudos 
} from '../data/initialData';
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
 */
export async function seedDatabaseIfEmpty() {
  try {
    // 1. Seed Agenda
    const agendaSnap = await getDocs(collection(db, 'agenda'));
    if (agendaSnap.empty) {
      console.log('Seeding agenda items...');
      const batch = writeBatch(db);
      initialAgenda.forEach(item => {
        const d = doc(db, 'agenda', item.id);
        batch.set(d, item);
      });
      await batch.commit();
    }

    // 2. Seed Recados
    const recadosSnap = await getDocs(collection(db, 'recados'));
    if (recadosSnap.empty) {
      console.log('Seeding recados...');
      const batch = writeBatch(db);
      initialRecados.forEach(item => {
        const d = doc(db, 'recados', item.id);
        batch.set(d, item);
      });
      await batch.commit();
    }

    // 3. Seed Memorias
    const memoriasSnap = await getDocs(collection(db, 'memorias'));
    if (memoriasSnap.empty) {
      console.log('Seeding memorias...');
      const batch = writeBatch(db);
      initialMemorias.forEach(item => {
        const d = doc(db, 'memorias', item.id);
        batch.set(d, item);
      });
      await batch.commit();
    }

    // 4. Seed Cartinhas
    const cartinhasSnap = await getDocs(collection(db, 'cartinhas'));
    if (cartinhasSnap.empty) {
      console.log('Seeding cartinhas...');
      const batch = writeBatch(db);
      initialCartinhas.forEach(item => {
        const d = doc(db, 'cartinhas', item.id);
        batch.set(d, item);
      });
      await batch.commit();
    }

    // 5. Seed Conversas & Subcollection Messages
    const conversasSnap = await getDocs(collection(db, 'conversas'));
    if (conversasSnap.empty) {
      console.log('Seeding conversas rooms and messages subcollections...');
      for (const room of initialConversas) {
        // Create room doc without messages list (since it's unbounded)
        const roomDocRef = doc(db, 'conversas', room.id);
        const roomMetadata = {
          id: room.id,
          name: room.name,
          avatarColor: room.avatarColor,
          description: room.description,
          createdAt: room.createdAt,
          ...(room.personaPrompt ? { personaPrompt: room.personaPrompt } : {})
        };
        await setDoc(roomDocRef, roomMetadata);

        // Seed messages inside subcollection
        const messageBatch = writeBatch(db);
        room.messages.forEach(msg => {
          const mDocRef = doc(db, 'conversas', room.id, 'messages', msg.id);
          messageBatch.set(mDocRef, msg);
        });
        await messageBatch.commit();
      }
    }

    // 6. Seed Conteudos (Biblioteca)
    const conteudosSnap = await getDocs(collection(db, 'conteudos'));
    if (conteudosSnap.empty) {
      console.log('Seeding conteudos...');
      const batch = writeBatch(db);
      initialConteudos.forEach(item => {
        const d = doc(db, 'conteudos', item.id);
        batch.set(d, item);
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seeding');
  }
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
