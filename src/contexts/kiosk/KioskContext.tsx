import { createContext, useState, type ReactNode } from 'react';

type KioskContextType = {
  sexGroup: string;
  setSexGroup: (sex: string) => void;
  ageGroup: string;
  setAgeGroup: (age: string) => void;
  capturedImage: string | null;
  setCapturedImage: (image: string | null) => void;
};

export const KioskContext = createContext<KioskContextType | undefined>(
  undefined
);

export const KioskProvider = ({ children }: { children: ReactNode }) => {
  const [sexGroup, setSexGroup] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  return (
    <KioskContext.Provider
      value={{
        sexGroup,
        setSexGroup,
        ageGroup,
        setAgeGroup,
        capturedImage,
        setCapturedImage,
      }}
    >
      {children}
    </KioskContext.Provider>
  );
};
