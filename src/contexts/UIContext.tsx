import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface UIContextType {
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  // Initialize theme from localStorage or system preference
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Initialize sidebar state from localStorage
  const [sidebarWidth, setSidebarWidthState] = useState(() => {
    const saved = localStorage.getItem('sidebarWidth');
    return saved ? parseInt(saved, 10) : 300;
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Save sidebar width to localStorage
  const setSidebarWidth = useCallback((width: number) => {
    setSidebarWidthState(width);
    localStorage.setItem('sidebarWidth', width.toString());
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  return (
    <UIContext.Provider
      value={{
        sidebarWidth,
        setSidebarWidth,
        isSidebarCollapsed,
        toggleSidebar,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
}
