import { useState, type ReactNode, useCallback, useRef } from 'react';
import { KioskContext, type DocentTeam } from './KioskContext';

const initialSex = '';
const initialAge = '';
const initialStyle = '';
const initialMood = '';
const initialDocentTeam: DocentTeam = null;

export const KioskProvider = ({ children }: { children: ReactNode }) => {
  const [id, setId] = useState(() => crypto.randomUUID());
  const [sexGroup, setSexGroup] = useState(initialSex);
  const [ageGroup, setAgeGroup] = useState(initialAge);
  const [styleGroup, setStyleGroup] = useState(initialStyle);
  const [moodGroup, setMoodGroup] = useState(initialMood);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<string | null>(null);
  const [docentTeam, setDocentTeam] = useState<DocentTeam>(initialDocentTeam);

  // --- 모델 로딩 로직 비활성화 ---
  const modelsLoaded = true; // 항상 true
  const faceLandmarker = useRef<null>(null); // 타입도 null로 변경

  const resetState = useCallback(() => {
    setId(crypto.randomUUID()); // 새 세션을 위해 ID를 새로 생성
    setSexGroup(initialSex);
    setAgeGroup(initialAge);
    setStyleGroup(initialStyle);
    setMoodGroup(initialMood);
    setCapturedImage(null);
    setLandmarks(null);
    // setDocentTeam(initialDocentTeam); // docentTeam은 초기화하지 않음
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
        modelsLoaded,
        faceLandmarker,
        docentTeam,
        setDocentTeam,
      }}
    >
      {children}
    </KioskContext.Provider>
  );
};
