import { createContext, useContext, useState, ReactNode } from 'react';

type PageType = 'home' | 'banks' | 'cash' | 'insights' | 'reminders' | 'settings';

interface AppContextType {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  return (
    <AppContext.Provider value={{ currentPage, setCurrentPage }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
