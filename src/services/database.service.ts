import {
  DocumentData,
  DocumentSnapshot,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';

import { db } from '@/src/services/firebase';

export async function getDocument<T extends DocumentData>(
  collectionName: string,
  documentId: string,
): Promise<T | null> {
  const snapshot: DocumentSnapshot<DocumentData> = await getDoc(
    doc(db, collectionName, documentId),
  );

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as T;
}

export async function setDocument<T extends DocumentData>(
  collectionName: string,
  documentId: string,
  data: T,
): Promise<void> {
  await setDoc(doc(db, collectionName, documentId), data);
}

export async function listDocuments<T extends DocumentData>(
  collectionName: string,
): Promise<Array<T & { id: string }>> {
  const snapshot = await getDocs(collection(db, collectionName));

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as T),
  }));
}
