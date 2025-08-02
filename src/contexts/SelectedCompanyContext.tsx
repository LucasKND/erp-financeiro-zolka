import { createContext, useContext, useState, ReactNode } from 'react';

interface SelectedCompanyContextType {
  selectedCompanyId: string | null;
  setSelectedCompanyId: (companyId: string | null) => void;
}

const SelectedCompanyContext = createContext<SelectedCompanyContextType>({
  selectedCompanyId: null,
  setSelectedCompanyId: () => {},
});

export const useSelectedCompany = () => {
  const context = useContext(SelectedCompanyContext);
  if (!context) {
    throw new Error('useSelectedCompany must be used within a SelectedCompanyProvider');
  }
  return context;
};

interface SelectedCompanyProviderProps {
  children: ReactNode;
}

export const SelectedCompanyProvider = ({ children }: SelectedCompanyProviderProps) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  return (
    <SelectedCompanyContext.Provider value={{ selectedCompanyId, setSelectedCompanyId }}>
      {children}
    </SelectedCompanyContext.Provider>
  );
};