export interface FaceDetectResponse {
  error_code: number;
  error_msg: string;
  landmarks: number[][];
  landmarks_str: string;
  region: number[];
  seconds: number;
  trx_id: string;
}

export interface KioskResult {
  imageUrl: string;
  videoUrl: string;
}

export type KeywordType = 'COLOR_AND_STYLE' | 'ATMOSPHERE_AND_MOOD';

export interface Keyword {
  id: string;
  type: KeywordType;
  label: string;
  value: string;
}

export interface CreateJobPayload {
  id: string;
  sexGroup: string;
  ageGroup: number;
  styleGroup: string;
  moodGroup: string;
  base64Image: string;
  landmarks: string;
}

export interface UpdateUserPhonePayload {
  id: string;
  phoneNumber: string;
}
