import { useState, useEffect } from 'react';
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

  useEffect(() => {
    try {
      const stored = localStorage.getItem('farmdiag_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Simulate syncing when coming back online
  useEffect(() => {
    if (isOnline && history.some(h => h.syncStatus === 'pending')) {
      // Fake sync delay
      const timer = setTimeout(() => {
        setHistory(prev => {
          const updated = prev.map(h => ({ ...h, syncStatus: 'synced' as const }));
          localStorage.setItem('farmdiag_history', JSON.stringify(updated));
          return updated;
        });
        console.log("Offline scans synced to cloud.");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, history]);

  const addToHistory = (item: Omit<HistoryItem, 'id' | 'date' | 'syncStatus'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      syncStatus: navigator.onLine ? 'synced' : 'pending'
    };
    
    setHistory(prev => {
      const newHistory = [newItem, ...prev].slice(0, 50); // Increased to 50 for dashboard
      try {
        localStorage.setItem('farmdiag_history', JSON.stringify(newHistory));
      } catch (e) {
        console.error('Failed to save history to local storage', e);
      }
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('farmdiag_history');
  };

  return {
    history,
    addToHistory,
    clearHistory,
    isOnline
  };
}
