import {
  useState,
  type ReactNode,
  useCallback,
  useRef,
} from 'react';
import { KioskContext } from './KioskContext';
// import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

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

  // --- 모델 로딩 로직 비활성화 ---
  const modelsLoaded = true; // 항상 true
  const faceLandmarker = useRef<null>(null); // 타입도 null로 변경

  // useEffect(() => {
  //   const createFaceLandmarker = async () => {
  //     try {
  //       const vision = await FilesetResolver.forVisionTasks('/models');
  //       const landmarker = await FaceLandmarker.createFromOptions(vision, {
  //         baseOptions: {
  //           modelAssetPath: '/models/face_landmarker.task',
  //           delegate: 'GPU',
  //         },
  //         runningMode: 'VIDEO',
  //         numFaces: 2,
  //       });
  //       faceLandmarker.current = landmarker;
  //       setModelsLoaded(true);
  //       console.log('✅ FaceLandmarker 모델 로딩 성공');
  //     } catch (error) {
  //       console.error('❌ FaceLandmarker 모델 로딩 실패:', error);
  //     }
  //   };
  //   createFaceLandmarker();
  // }, []);
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
