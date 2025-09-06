import { useState, type ReactNode } from 'react';
import { KioskContext } from './KioskContext';
export const KioskProvider = ({ children }: { children: ReactNode }) => {
  const [sexGroup, setSexGroup] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [styleGroup, setStyleGroup] = useState('');
  const [moodGroup, setMoodGroup] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<string | null>(null);

  return (
    <KioskContext.Provider
      value={{
        sexGroup,
        setSexGroup,
        ageGroup,
        setAgeGroup,
        styleGroup,
        setStyleGroup,
        moodGroup,
        setMoodGroup,
        capturedImage,
        setCapturedImage,
        landmarks,
        setLandmarks,
      }}
    >
      {children}
    </KioskContext.Provider>
  );
};
