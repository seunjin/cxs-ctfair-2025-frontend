export interface FaceDetectResponse {
  error_code: number;
  error_msg: string;
  landmarks: number[][];
  landmarks_str: string;
  region: number[];
  seconds: number;
  trx_id: string;
}

/**
 * @description 서버에서 내려오는 모든 API 응답의 표준 형식입니다.
 */
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
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

/**
 * @description GET /api/contents/playlist API의 응답 배열에 포함될 콘텐츠 객체의 타입입니다.
 */
export interface Content {
  contentId: number;
  videoUrl: string;
}

/**
 * @description POST /api/contents/presented API에 전송할 데이터의 타입입니다.
 */
export interface ContentPresentedPayload {
  contentId: number;
}

export type SmsStatus = 'SENT' | 'FAILED' | 'PENDING' | 'NOT_FOUND';

export type AdminContentStatus = 'PROCESSING' | 'COMPLETE' | 'FAILED';

/**
 * @description GET /api/admin/contents API의 응답 배열에 포함될 콘텐츠 객체의 타입입니다.
 */
export interface Generation {
  contentId: number;
  imageUrl?: string;
  smsStatus: SmsStatus;
  status: AdminContentStatus;
  createdAt: string; // JSON으로 직렬화된 날짜는 string으로 받는 것이 안전합니다.
}

/**
 * @description GET /api/admin/contents API의 응답 데이터 타입입니다. (무한 스크롤용)
 */
export interface GenerationsResponse {
  list: Generation[];
  count?: number; // 전체 항목 개수
}

export interface StyleMoodKeyword {
  value: string; // 영어
  label: string; // 한글
}

export interface KeywordsResponse {
  fixedKeywords: string[];
  styleKeywords: StyleMoodKeyword[];
  moodKeywords: StyleMoodKeyword[];
}

/**
 * @description PUT /api/admin/keywords API에 전송할 데이터의 타입입니다.
 */
export interface UpdateKeywordsPayload {
  fixedKeywords: string[];
  styleKeywords: StyleMoodKeyword[];
  moodKeywords: StyleMoodKeyword[];
}

export type SexGroup = 'man' | 'woman';

/**
 * @description GET /api/admin/contents/{contentId} API의 응답 타입입니다.
 */
export interface GenerationDetail {
  keyword: string;
  sexGroup: SexGroup;
  ageGroup: number;
  status: AdminContentStatus;
  smsStatus: SmsStatus;
  imageUrl: string;
  videoUrl: string;
  createdAt: Date;
}

/**
 * @description POST /api/admin/fixed-content API에 전송할 데이터의 타입입니다.
 */
export interface AddFixedContentPayload {
  imageUrl: string;
}
