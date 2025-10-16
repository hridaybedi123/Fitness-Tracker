import { createContext, useContext } from 'react';
import type { AppContextType } from '../types';

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppProvider');
  }
  return context;
};