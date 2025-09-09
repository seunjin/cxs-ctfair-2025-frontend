import { http } from './http';
import type {
  KioskResult,
  Keyword,
  CreateJobPayload,
  UpdateUserPhonePayload,
  Content,
  ContentPresentedPayload,
} from './types';

/**
 * 키오스크 결과 데이터를 가져옵니다.
 * @param id 해싱된 전화번호
 * @returns Promise<KioskResult>
 */
export const getKioskResult = (id: string): Promise<KioskResult> => {
  return http.get<KioskResult>(`/kiosk/results/${id}`);
};

/**
 * 키워드 목록을 가져옵니다.
 * @returns Promise<Keyword[]>
 */
export const getKeywords = (): Promise<Keyword[]> => {
  return http.get<Keyword[]>('/api/contents/keywords');
};

/**
 * 새로운 AI 작업을 생성합니다.
 * @param payload 작업 생성에 필요한 데이터
 * @returns Promise<unknown> - 서버 응답 타입이 정해지면 수정
 */
export const createJob = (payload: CreateJobPayload): Promise<unknown> => {
  return http.post('/api/jobs', payload);
};

/**
 * 사용자의 전화번호를 업데이트합니다.
 * @param payload 사용자 ID와 전화번호
 * @returns Promise<unknown>
 */
export const updateUserPhone = (payload: UpdateUserPhonePayload): Promise<unknown> => {
  return http.patch('/api/jobs/user-phone', payload);
};

/**
 * @description 스크린에 표시될 초기 영상 재생 목록을 가져옵니다.
 * @returns Promise<Content[]>
 */
export const getPlaylist = (): Promise<Content[]> => {
  return http.get<Content[]>('/api/contents/playlist');
};

/**
 * @description 영상 재생이 완료되었음을 서버에 알립니다.
 * @param payload 재생 완료된 콘텐츠의 ID
 * @returns Promise<unknown>
 */
export const reportContentPresented = (payload: ContentPresentedPayload): Promise<unknown> => {
  return http.post('/api/contents/presented', payload);
};
