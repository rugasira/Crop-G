import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';
import { AnalysisResult } from '../services/aiService';

export interface HistoryItem {
  id: string;
  date: string;
  image?: string;
  description: string;
  result: AnalysisResult;
  syncStatus: 'pending' | 'synced';
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { user } = useAuth();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'history'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: HistoryItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // snapshot.metadata.hasPendingWrites is true if there are un-synced local changes
        const isPending = docSnap.metadata.hasPendingWrites;
        items.push({
          id: docSnap.id,
          date: data.date,
          image: data.image,
          description: data.description,
          result: data.result,
          syncStatus: isPending ? 'pending' : 'synced'
        });
      });
      setHistory(items);
    }, (error) => {
      console.error("Error fetching history: ", error);
    });

    return () => unsubscribe();
  }, [user]);

  const addToHistory = async (item: Omit<HistoryItem, 'id' | 'date' | 'syncStatus'>) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'users', user.uid, 'history'), {
        ...item,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error('Failed to save history to Firestore', e);
    }
  };

  const clearHistory = async () => {
    if (!user) return;
    try {
      const promises = history.map(item => deleteDoc(doc(db, 'users', user.uid, 'history', item.id)));
      await Promise.all(promises);
    } catch (e) {
      console.error('Failed to clear history', e);
    }
  };

  return {
    history,
    addToHistory,
    clearHistory,
    isOnline
  };
}
