import React, { createContext, useContext, ReactNode } from 'react';
import { useAccountsData } from './useAccountsData';

interface NotificationContextType {
  accounts: any[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  invalidateAccount: (accountId: string, type: 'payable' | 'receivable') => void;
  totals: {
    totalReceivable: number;
    totalPayable: number;
    totalOverdue: number;
  };
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const accountsData = useAccountsData();

  return (
    <NotificationContext.Provider value={accountsData}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
