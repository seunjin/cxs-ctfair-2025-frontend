import { useState, type ReactNode, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { KioskContext, type DocentTeam } from './KioskContext';
import { useIdleTimer } from '../../hooks/useIdleTimer';

const IDLE_TIMEOUT = 120000; // 2분

const initialSex = '';
const initialAge = '';
const initialStyle = '';
const initialMood = '';
const initialDocentTeam: DocentTeam = null;

export const KioskProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
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
    setDocentTeam(initialDocentTeam);
  }, []);

  const handleIdle = useCallback(() => {
    console.log('유휴 상태 감지. 상태를 초기화하고 메인으로 이동합니다.');
    resetState();
    navigate('/kiosk');
  }, [navigate, resetState]);

  useIdleTimer(handleIdle, IDLE_TIMEOUT);

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
