import { useState, type ReactNode } from 'react';
import { KioskContext } from './KioskContext';
export const KioskProvider = ({ children }: { children: ReactNode }) => {
  const [sexGroup, setSexGroup] = useState('남성');
  const [ageGroup, setAgeGroup] = useState('20대');
  const [styleGroup, setStyleGroup] = useState('랜덤');
  const [moodGroup, setMoodGroup] = useState('랜덤');
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
