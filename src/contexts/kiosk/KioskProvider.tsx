import {
  useState,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { KioskContext } from './KioskContext';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

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

  // --- 모델 로딩 로직 추가 ---
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const faceLandmarker = useRef<FaceLandmarker | null>(null);

  useEffect(() => {
    console.log({
      id,
      sexGroup,
      ageGroup,
      styleGroup,
      moodGroup,
      capturedImage,
      landmarks,
      modelsLoaded,
    });
  }, [
    id,
    sexGroup,
    ageGroup,
    styleGroup,
    moodGroup,
    capturedImage,
    landmarks,
    modelsLoaded,
  ]);

  useEffect(() => {
    const createFaceLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks('/models');
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: '/models/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 2,
        });
        faceLandmarker.current = landmarker;
        setModelsLoaded(true);
        console.log('✅ FaceLandmarker 모델 로딩 성공');
      } catch (error) {
        console.error('❌ FaceLandmarker 모델 로딩 실패:', error);
      }
    };
    createFaceLandmarker();
    // Provider가 언마운트될 때 모델을 정리하는 로직은 앱 구조에 따라 필요할 수 있습니다.
    // return () => faceLandmarker.current?.close();
  }, []);
  // --------------------------

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
        modelsLoaded,
        faceLandmarker,
      }}
    >
      {children}
    </KioskContext.Provider>
  );
};
