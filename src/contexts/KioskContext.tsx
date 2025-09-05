import { ReactNode, createContext, useContext, useState } from 'react';

type KioskContextType = {
  sexGroup: string;
  setSexGroup: (sex: string) => void;
  ageGroup: string;
  setAgeGroup: (age: string) => void;
};

const KioskContext = createContext<KioskContextType | undefined>(undefined);

export const KioskProvider = ({ children }: { children: ReactNode }) => {
  const [sexGroup, setSexGroup] = useState('');
  const [ageGroup, setAgeGroup] = useState('');

  return (
    <KioskContext.Provider
      value={{
        sexGroup,
        setSexGroup,
        ageGroup,
        setAgeGroup,
      }}
    >
      {children}
    </KioskContext.Provider>
  );
};

export const useKiosk = () => {
  const context = useContext(KioskContext);
  if (!context) {
    throw new Error('useKiosk must be used within a KioskProvider');
  }
  return context;
};
