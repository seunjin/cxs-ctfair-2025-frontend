import { useState, type ReactNode, useCallback } from 'react';
import { KioskContext } from './KioskContext';

const initialSex = '남성';
const initialAge = '20대';
const initialStyle = '랜덤';
const initialMood = '랜덤';

export const KioskProvider = ({ children }: { children: ReactNode }) => {
  const [id, setId] = useState(() => crypto.randomUUID());
  const [sexGroup, setSexGroup] = useState(initialSex);
  const [ageGroup, setAgeGroup] = useState(initialAge);
  const [styleGroup, setStyleGroup] = useState(initialStyle);
  const [moodGroup, setMoodGroup] = useState(initialMood);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setId(crypto.randomUUID()); // 새 세션을 위해 ID를 새로 생성
    setSexGroup(initialSex);
    setAgeGroup(initialAge);
    setStyleGroup(initialStyle);
    setMoodGroup(initialMood);
    setCapturedImage(null);
    setLandmarks(null);
  }, []);

  return (
    <KioskContext.Provider
      value={{
        id,
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
        resetState,
      }}
    >
      {children}
    </KioskContext.Provider>
  );
};
