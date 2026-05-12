import { useState, useEffect } from 'react';
import { AnalysisResult } from '../services/aiService';

export interface HistoryItem {
  id: string;
  date: string;
  image?: string;
  description: string;
  result: AnalysisResult;
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('farmdiag_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }, []);

  const addToHistory = (item: Omit<HistoryItem, 'id' | 'date'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    
    setHistory(prev => {
      const newHistory = [newItem, ...prev].slice(0, 20); // Keep last 20 scans
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
    clearHistory
  };
}
