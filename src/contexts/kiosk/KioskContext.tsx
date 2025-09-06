import { createContext, RefObject } from 'react';
import { FaceLandmarker } from '@mediapipe/tasks-vision';

type KioskContextType = {
  id: string; // 세션 ID
  sexGroup: string;
  setSexGroup: (sex: string) => void;
  ageGroup: string;
  setAgeGroup: (age: string) => void;
  styleGroup: string;
  setStyleGroup: (style: string) => void;
  moodGroup: string;
  setMoodGroup: (mood: string) => void;
  capturedImage: string | null;
  setCapturedImage: (image: string | null) => void;
  landmarks: string | null;
  setLandmarks: (landmarks: string) => void;
  resetState: () => void; // 모든 상태를 초기화하는 함수
  modelsLoaded: boolean; // 모델 로딩 완료 여부
  faceLandmarker: RefObject<FaceLandmarker | null>; // 로드된 모델 인스턴스
};

export const KioskContext = createContext<KioskContextType | undefined>(
  undefined
);
