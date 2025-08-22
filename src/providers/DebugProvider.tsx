import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DebugContextType {
  isDebugMode: boolean;
  setDebugMode: (enabled: boolean) => void;
  debugLog: (message: string, data?: any) => void;
  debugInfo: DebugInfo[];
  clearDebugInfo: () => void;
}

interface DebugInfo {
  id: string;
  timestamp: Date;
  message: string;
  data?: any;
  type: 'log' | 'warn' | 'error' | 'info';
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export const DebugProvider = ({ children }: { children: ReactNode }) => {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo[]>([]);

  const setDebugMode = (enabled: boolean) => {
    setIsDebugMode(enabled);
    localStorage.setItem('finska-debug-mode', String(enabled));
    
    if (enabled) {
      console.log('🔍 Modo Debug Ativado - Finska');
    } else {
      console.log('🔍 Modo Debug Desativado - Finska');
    }
  };

  const debugLog = (message: string, data?: any) => {
    if (!isDebugMode) return;

    const logEntry: DebugInfo = {
      id: Date.now().toString(),
      timestamp: new Date(),
      message,
      data,
      type: 'log'
    };

    setDebugInfo(prev => [...prev.slice(-49), logEntry]); // Keep only last 50 entries
    console.log(`🔍 [DEBUG] ${message}`, data || '');
  };

  useEffect(() => {
    const savedDebugMode = localStorage.getItem('finska-debug-mode') === 'true';
    setIsDebugMode(savedDebugMode);
  }, []);

  // Debug performance monitoring
  useEffect(() => {
    if (!isDebugMode) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          debugLog('Navegação completa', {
            duration: entry.duration,
            type: entry.entryType
          });
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });

    return () => observer.disconnect();
  }, [isDebugMode]);

  const clearDebugInfo = () => {
    setDebugInfo([]);
  };

  return (
    <DebugContext.Provider value={{
      isDebugMode,
      setDebugMode,
      debugLog,
      debugInfo,
      clearDebugInfo
    }}>
      {children}
    </DebugContext.Provider>
  );
};

export const useDebug = () => {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
};