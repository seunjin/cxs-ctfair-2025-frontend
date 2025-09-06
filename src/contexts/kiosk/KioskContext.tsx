import { createContext } from 'react';

type KioskContextType = {
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
};

export const KioskContext = createContext<KioskContextType | undefined>(
  undefined
);
